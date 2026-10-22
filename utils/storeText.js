// Picks the store-specific wording for a translation key. On iOS the "<key>Ios" variant names only the App Store
// (App Store Review 2.3.10: no references to other mobile platforms). Every other platform keeps the shared key.
// Pure and dependency-free so scripts can test it in Node.
export function storeKey(key, os) {
  return os === 'ios' ? `${key}Ios` : key;
}
