// Sözleşme yaşam döngüsü. sign_status kırmızı çizgi ışıklarıdır; burası ezilmez.

export const LIFECYCLES = ['draft', 'negotiating', 'signed'];

export function normalizeLifecycle(value) {
  const code = String(value || '').toLowerCase().trim();
  return LIFECYCLES.includes(code) ? code : 'draft';
}

export function lifecycleLabelKey(value) {
  switch (normalizeLifecycle(value)) {
    case 'negotiating':
      return 'lifecycleNegotiating';
    case 'signed':
      return 'lifecycleSigned';
    default:
      return 'lifecycleDraft';
  }
}

export function canActivateShield(value) {
  return normalizeLifecycle(value) === 'signed';
}

export function lifecycleAfterStitch(current) {
  return normalizeLifecycle(current) === 'signed' ? 'signed' : 'negotiating';
}
