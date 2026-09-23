const fs = require('fs');
const path = require('path');
const {
  withAppBuildGradle,
  withDangerousMod,
  withGradleProperties,
  withProjectBuildGradle,
} = require('expo/config-plugins');

const JDK17 = 'C:/Program Files/Eclipse Adoptium/jdk-17.0.20.101-hotspot';
const NDK = '27.1.12297006';
const CPP_FLAGS = '-std=c++20 -DFOLLY_CFG_NO_COROUTINES=1';
const PICK_FIRSTS = [
  '**/libc++_shared.so',
  '**/libjsi.so',
  '**/libfbjni.so',
  '**/libreactnative.so',
  '**/libhermes.so',
  '**/libhermesvm.so',
].join(',');

const GRADLE_MARKER = 'cursor-sandbox-cache';
const GRADLEW_PATCH = `@rem Cursor sandboxes Gradle under Temp\\cursor-sandbox-cache\\..., which exceeds
@rem Windows MAX_PATH (260) when Ninja stats prefab .so files.
echo.%GRADLE_USER_HOME% | findstr /I "cursor-sandbox-cache" >nul
if %ERRORLEVEL% equ 0 set "GRADLE_USER_HOME=%USERPROFILE%\\.gradle"
`;

const ROOT_NATIVE_BLOCK = `
def nativeCppFlags = "-std=c++20 -DFOLLY_CFG_NO_COROUTINES=1"
def nativeCmakeArgs = [
  "-DANDROID_STL=c++_shared",
  "-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON",
  "-DCMAKE_CXX_STANDARD=20",
  "-DCMAKE_CXX_STANDARD_REQUIRED=ON",
  "-DFOLLY_CFG_NO_COROUTINES=1",
  "-DReactAndroid_VERSION_MINOR=86",
]

subprojects { subproject ->
  def applyNativeFlags = {
    if (!subproject.plugins.hasPlugin("com.android.library") &&
        !subproject.plugins.hasPlugin("com.android.application")) {
      return
    }
    def androidExt = subproject.extensions.findByName("android")
    if (androidExt == null) {
      return
    }

    if (rootProject.ext.has("ndkVersion")) {
      androidExt.ndkVersion = rootProject.ext.ndkVersion
    }

    try {
      def cmakeExt = androidExt.externalNativeBuild?.cmake
      if (cmakeExt?.path == null) {
        return
      }

      androidExt.buildFeatures.prefab = true

      def cmakeConfig = androidExt.defaultConfig.externalNativeBuild.cmake
      cmakeConfig.cppFlags(nativeCppFlags)
      def existingArgs = []
      try {
        existingArgs.addAll(cmakeConfig.arguments ?: [])
      } catch (Throwable ignored) {
      }
      nativeCmakeArgs.each { arg ->
        if (!existingArgs.contains(arg)) {
          existingArgs.add(arg)
        }
      }
      cmakeConfig.arguments(existingArgs as String[])
    } catch (Throwable ignored) {
    }
  }

  subproject.pluginManager.withPlugin("com.android.library") {
    if (subproject.state.executed) {
      applyNativeFlags()
    } else {
      subproject.afterEvaluate { applyNativeFlags() }
    }
  }
  subproject.pluginManager.withPlugin("com.android.application") {
    if (subproject.state.executed) {
      applyNativeFlags()
    } else {
      subproject.afterEvaluate { applyNativeFlags() }
    }
  }
}
`;

function upsertProperty(properties, key, value) {
  const index = properties.findIndex((item) => item.type === 'property' && item.key === key);
  if (index >= 0) {
    properties[index].value = value;
  } else {
    properties.push({ type: 'property', key, value });
  }
}

function withJdkAndNdkProperties(config) {
  return withGradleProperties(config, (mod) => {
    const props = mod.modResults;
    const jvm = props.find((item) => item.type === 'property' && item.key === 'org.gradle.jvmargs');
    if (jvm && !String(jvm.value).includes('--enable-native-access=ALL-UNNAMED')) {
      jvm.value = `${jvm.value} --enable-native-access=ALL-UNNAMED`;
    }
    upsertProperty(props, 'org.gradle.java.home', JDK17);
    upsertProperty(props, 'android.ndkVersion', NDK);
    upsertProperty(props, 'ANDROID_NDK_CPP_FLAGS', CPP_FLAGS);
    upsertProperty(props, 'FOLLY_CFG_NO_COROUTINES', '1');
    upsertProperty(props, 'android.packagingOptions.pickFirsts', PICK_FIRSTS);
    return mod;
  });
}

function withAppNativeFlags(config) {
  return withAppBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;
    if (!contents.includes('FOLLY_CFG_NO_COROUTINES')) {
      contents = contents.replace(
        /buildConfigField "String", "REACT_NATIVE_RELEASE_LEVEL",[^\n]+\n/,
        (match) => `${match}
        externalNativeBuild {
            cmake {
                cppFlags "${CPP_FLAGS}"
                arguments "-DANDROID_STL=c++_shared", "-DCMAKE_CXX_STANDARD=20", "-DFOLLY_CFG_NO_COROUTINES=1"
            }
        }
`
      );
    } else {
      contents = contents.replace(/-std=c\+\+17/g, '-std=c++20');
    }
    if (!contents.includes('buildFeatures {')) {
      contents = contents.replace(
        /signingConfigs \{/,
        `buildFeatures {
        buildConfig true
    }

    signingConfigs {`
      );
    }
    if (!contents.includes('**/libjsi.so')) {
      contents = contents.replace(
        /packagingOptions \{\s*jniLibs \{/,
        `packagingOptions {
        pickFirst "**/libc++_shared.so"
        pickFirst "**/libjsi.so"
        pickFirst "**/libfbjni.so"
        pickFirst "**/libreactnative.so"
        pickFirst "**/libhermes.so"
        pickFirst "**/libhermesvm.so"
        jniLibs {`
      );
    }
    mod.modResults.contents = contents;
    return mod;
  });
}

function withRootNativeFlags(config) {
  return withProjectBuildGradle(config, (mod) => {
    let contents = mod.modResults.contents;
    if (contents.includes('def nativeCppFlags')) {
      contents = contents.replace(/\r?\ndef nativeCppFlags[\s\S]*$/, `\n${ROOT_NATIVE_BLOCK}`);
    } else {
      contents = `${contents.trimEnd()}\n${ROOT_NATIVE_BLOCK}`;
    }
    mod.modResults.contents = contents;
    return mod;
  });
}

function withWindowsGradleHome(config) {
  return withDangerousMod(config, [
    'android',
    async (mod) => {
      const projectRoot = mod.modRequest.platformProjectRoot;
      const gradlew = path.join(projectRoot, 'gradlew.bat');
      if (fs.existsSync(gradlew)) {
        let bat = fs.readFileSync(gradlew, 'utf8');
        if (!bat.includes(GRADLE_MARKER)) {
          bat = bat.replace(
            ':execute\r\n@rem Setup the command line\r\n',
            `:execute\r\n@rem Setup the command line\r\n\r\n${GRADLEW_PATCH}`
          );
          if (!bat.includes(GRADLE_MARKER)) {
            bat = bat.replace(
              ':execute\n@rem Setup the command line\n',
              `:execute\n@rem Setup the command line\n\n${GRADLEW_PATCH}`
            );
          }
          fs.writeFileSync(gradlew, bat);
        }
      }

      const sdkDir = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || '';
      if (sdkDir) {
        const localProps = path.join(projectRoot, 'local.properties');
        const escaped = sdkDir.replace(/\\/g, '\\\\').replace(':', '\\:');
        fs.writeFileSync(localProps, `sdk.dir=${escaped}\n`);
      }
      return mod;
    },
  ]);
}

function withExpoAvSourceFixes(config) {
  return withDangerousMod(config, [
    'android',
    async (mod) => {
      const avRoot = path.join(mod.modRequest.projectRoot, 'node_modules/expo-av/android/src/main/java');
      const viewUtils = path.join(avRoot, 'expo/modules/av/ViewUtils.kt');
      if (fs.existsSync(viewUtils)) {
        let src = fs.readFileSync(viewUtils, 'utf8');
        if (src.includes('.resolveView(viewTag)')) {
          src = src.replace(
            /moduleRegistry\.getModule\(UIManager::class\.java\)\.resolveView\(viewTag\) as VideoViewWrapper\?/g,
            'null as VideoViewWrapper?'
          );
          fs.writeFileSync(viewUtils, src);
        }
      }

      const fullscreen = path.join(avRoot, 'expo/modules/av/video/FullscreenVideoPlayer.java');
      if (fs.existsSync(fullscreen)) {
        let src = fs.readFileSync(fullscreen, 'utf8');
        if (src.includes('KeepAwakeManager')) {
          src = src.replace(
            /import expo\.modules\.core\.interfaces\.services\.KeepAwakeManager;\r?\n/,
            ''
          );
          src = src.replace(
            /KeepAwakeManager keepAwakeManager = moduleRegistry\.getModule\(KeepAwakeManager\.class\);\s*boolean keepAwakeIsActivated = keepAwakeManager != null && keepAwakeManager\.isActivated\(\);\s*if \(isPlaying \|\| keepAwakeIsActivated\) \{\s*window\.addFlags\(WindowManager\.LayoutParams\.FLAG_KEEP_SCREEN_ON\);\s*\} else \{\s*window\.addFlags\(WindowManager\.LayoutParams\.FLAG_KEEP_SCREEN_ON\);\s*\}/,
            `if (isPlaying) {
              window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            } else {
              window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            }`
          );
          fs.writeFileSync(fullscreen, src);
        }
      }
      return mod;
    },
  ]);
}

module.exports = function withAndroidNativeBuild(config) {
  config.autolinking = {
    ...config.autolinking,
    android: {
      ...(config.autolinking?.android || {}),
      buildFromSource: Array.from(
        new Set([
          ...(config.autolinking?.android?.buildFromSource || []),
          'expo-av',
          'expo-modules-core',
          'expo-updates',
        ])
      ),
    },
  };
  config = withJdkAndNdkProperties(config);
  config = withAppNativeFlags(config);
  config = withRootNativeFlags(config);
  config = withWindowsGradleHome(config);
  config = withExpoAvSourceFixes(config);
  return config;
};
