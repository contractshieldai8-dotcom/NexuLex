'use strict';
// Loads the real, merged i18n resource table (the same one the app ships) in plain Node.
// ESM sources are transpiled on the fly with Babel's commonjs transform, so no app code is duplicated.
const Module = require('module');
const path = require('path');
const fs = require('fs');
const babel = require('@babel/core');

const ROOT = path.resolve(__dirname, '..', '..');
let installed = false;

function install() {
  if (installed) return;
  installed = true;
  const orig = Module._extensions['.js'];
  Module._extensions['.js'] = function (module, filename) {
    if (filename.startsWith(ROOT) && !filename.includes(`${path.sep}node_modules${path.sep}`)) {
      const src = fs.readFileSync(filename, 'utf8');
      const out = babel.transformSync(src, {
        filename,
        babelrc: false,
        configFile: false,
        sourceType: 'module',
        plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
      });
      return module._compile(out.code, filename);
    }
    return orig(module, filename);
  };
}

function loadResources() {
  install();
  const mod = require(path.join(ROOT, 'i18n.js'));
  const i18n = mod.default || mod;
  const data = i18n.store.data;
  const out = {};
  for (const lng of Object.keys(data)) out[lng] = { ...data[lng].translation };
  return out;
}

module.exports = { loadResources, ROOT };
