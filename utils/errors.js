// Servis katmanının ürettiği hata kodlarını çevrilebilir arayüz mesajlarına
// dönüştürür. Teknik ayrıntı (error.detail) yalnızca konsola yazılır, kullanıcıya
// gösterilmez.

import { AI_ERROR_CODES } from '../services/ai';
import { QUOTA_ERRORS } from '../services/quota';

const CODE_TO_KEY = {
  [AI_ERROR_CODES.CONFIG]: 'errServiceConfig',
  [AI_ERROR_CODES.AUTH]: 'errSessionExpired',
  [AI_ERROR_CODES.RATE_LIMIT]: 'errRateLimited',
  [AI_ERROR_CODES.TIMEOUT]: 'errTimeout',
  [AI_ERROR_CODES.NETWORK]: 'errNetwork',
  [AI_ERROR_CODES.SERVICE]: 'errServiceUnavailable',
  [AI_ERROR_CODES.PARSE]: 'errUnreadableResponse',
  [AI_ERROR_CODES.EMPTY_INPUT]: 'selectContentError',
  [AI_ERROR_CODES.PDF_TOO_LARGE]: 'errPdfTooLarge',
  [AI_ERROR_CODES.IMAGES_TOO_LARGE]: 'errImagesTooLarge',
  [AI_ERROR_CODES.HEAVY]: 'errAnalysisHeavy',
  [AI_ERROR_CODES.EXTRACT]: 'extractFailed',
  [AI_ERROR_CODES.EXTRACT_TRUNCATED]: 'errExtractTruncated',
  [AI_ERROR_CODES.DRAFT_TRUNCATED]: 'errDraftTruncated',
  [QUOTA_ERRORS.QUOTA_EXHAUSTED]: 'noFreeAnalysesLeft',
  [QUOTA_ERRORS.PHONE_TAKEN]: 'phoneAlreadyUsed',
  [QUOTA_ERRORS.NOT_AUTHENTICATED]: 'errSessionExpired',
};

// t: i18next çeviri fonksiyonu. Bilinmeyen hatalarda genel bir mesaj döner.
export function describeError(t, error) {
  const key = CODE_TO_KEY[error?.code];
  if (key) return t(key);

  // Kodlanmamış hatalarda ham mesajı göstermek yerine genel metin kullanılır;
  // ayrıntı geliştirici konsoluna düşer.
  if (error?.detail || error?.message) {
    console.warn('Beklenmeyen hata:', error.detail || error.message);
  }

  return t('errUnexpected');
}
