// Turns an account error from the auth server into a localized, plain-language message.
// The server answers in English; the app never shows that text to the user.
// Returns an i18n key (resolve it with t()). Unknown errors fall back to the generic localized message.

const has = (value, pattern) => pattern.test(String(value || ''));

export function authErrorKey(error) {
  if (!error) return 'errUnexpected';
  const code = String(error.code || error.error_code || '').toLowerCase();
  const name = String(error.name || '');
  const message = String(error.message || '');
  const status = Number(error.status || 0);

  if (code === 'invalid_credentials' || has(message, /invalid login credentials/i)) return 'authErrInvalidCreds';
  if (code === 'user_already_exists' || code === 'email_exists' || has(message, /already (been )?registered|already exists/i)) {
    return 'authErrEmailTaken';
  }
  if (code === 'email_not_confirmed' || has(message, /email not confirmed/i)) return 'authErrEmailUnconfirmed';
  if (code === 'weak_password' || name === 'AuthWeakPasswordError' || has(message, /password (should|must) be at least|weak password/i)) {
    return 'authErrWeakPassword';
  }
  if (code === 'same_password' || has(message, /different from the old password/i)) return 'authErrSamePassword';
  if (code === 'email_address_invalid' || has(message, /invalid.*email|unable to validate email/i)) {
    return 'authErrInvalidEmail';
  }
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || status === 429 || has(message, /rate limit|too many requests|security purposes/i)) {
    return 'errRateLimited';
  }
  if (code === 'session_expired' || code === 'session_not_found' || code === 'refresh_token_not_found' || has(message, /jwt expired|auth session missing/i)) {
    return 'errSessionExpired';
  }
  if (name === 'AuthRetryableFetchError' || error.status === 0 || has(message, /network request failed|failed to fetch|network error|timed? ?out/i)) {
    return 'errNetwork';
  }
  if (status >= 500) return 'errServiceUnavailable';
  return 'errUnexpected';
}

export function authErrorMessage(error, t) {
  if (typeof __DEV__ !== 'undefined' && __DEV__ && error?.message) console.warn('auth error:', error.code || error.name || '', error.message);
  return t(authErrorKey(error));
}
