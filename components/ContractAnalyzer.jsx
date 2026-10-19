import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Alert, StyleSheet, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTranslation } from 'react-i18next';
import { ACCENT } from '../theme';
import { useFeedback } from '../context/FeedbackContext';

const MAX_PAGES = 8;
const HEAVY_BASE64 = 700000;

export async function compressImage(uri, knownWidth) {
  let width = Number(knownWidth) || 0;
  let source = uri;
  if (!width) {
    const probe = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    width = probe.width || 0;
    source = probe.uri || uri;
  }
  const actions = width > 1280 ? [{ resize: { width: 1280 } }] : [];
  let out = await ImageManipulator.manipulateAsync(source, actions, {
    compress: 0.7,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });
  if (String(out.base64 || '').length > HEAVY_BASE64) {
    out = await ImageManipulator.manipulateAsync(out.uri, [], {
      compress: 0.5,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    });
  }
  return out;
}

export default function ContractAnalyzer({ onImagesReady, disabled, imageCount = 0 }) {
  const { t } = useTranslation();
  const { showToast } = useFeedback();
  const [picking, setPicking] = useState(false);

  const pickImages = async () => {
    const room = Math.max(0, MAX_PAGES - Number(imageCount || 0));
    if (room <= 0) {
      showToast(t('errImagesTooLarge'), { type: 'warning' });
      return;
    }

    // System photo picker (iOS 14+ PHPicker / Android 13+ Photo Picker): no runtime permission prompt.
    let result;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: room,
        quality: 1,
      });
    } catch (error) {
      console.warn('Image picker failed:', error);
      Alert.alert(t('errorTitle'), t('errImagePickFailed'));
      return;
    }

    if (result?.canceled || !result?.assets) return;

    try {
      setPicking(true);
      const picked = result.assets || [];
      if (picked.length > room) {
        showToast(t('errImagesTooLarge'), { type: 'warning' });
      }
      const limited = picked.slice(0, room);
      const processedImages = await Promise.all(
        limited.map(async (asset) => {
          const compressed = await compressImage(asset.uri, asset.width);
          return {
            uri: compressed.uri,
            base64: compressed.base64,
            mimeType: 'image/jpeg',
          };
        })
      );
      const withBase64 = processedImages.filter((img) => img.base64);
      if (onImagesReady) onImagesReady(withBase64);
    } catch (error) {
      console.warn('Image processing failed:', error);
      Alert.alert(t('errorTitle'), t('errImagePickFailed'));
    } finally {
      setPicking(false);
    }
  };

  const busy = picking || disabled;

  return (
    <TouchableOpacity
      style={[styles.uploadButton, busy && styles.disabled]}
      onPress={pickImages}
      disabled={busy}
    >
      {picking ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <View style={styles.row}>
          <Ionicons name="scan-outline" size={18} color={ACCENT} />
          <Text
            style={styles.uploadButtonText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {imageCount > 0 ? t('imagesSelected', { count: imageCount }) : t('uploadImages')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const FONT_MEDIUM = Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' });

const styles = StyleSheet.create({
  uploadButton: {
    flex: 1,
    backgroundColor: '#172238',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderColor: 'rgba(212, 178, 122, 0.55)',
    shadowColor: ACCENT,
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontFamily: FONT_MEDIUM,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
    flexShrink: 1,
  },
  disabled: {
    opacity: 0.6,
  },
});
