import { I18nManager, Platform, StyleSheet } from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// NexuLex design tokens — "Ink & Champagne"
//
// One calm brand colour (champagne gold) on deep ink navy; status colours are
// kept separate so "brand" never gets confused with "safe". Every screen reads
// these tokens, so the whole app can be re-skinned from this file alone.
//
// Contrast (WCAG): dark theme text on bg >= 12:1, accent on bg ~9:1, status
// colours on bg >= 4.9:1. Light theme uses darker status/accent tones (>= 4.5:1).
// ─────────────────────────────────────────────────────────────────────────────

// Marka Renkleri — dark-theme values. Keep the 6-digit hex form: several
// screens build tints with `${ACCENT}22` (hex alpha suffix).
export const ACCENT = '#D4B27A';
// Technology blue: secondary accent for information / AI / guidance only (never primary actions).
export const ACCENT_ALT = '#38BDF8';
export const DANGER = '#EC5459'; // 4.9:1 on cardBg (was #E5484D = 4.4:1, below AA for text)
export const WARNING = '#E8A33D';
export const SUCCESS = '#3DBE8B';
export const alignStart = I18nManager.isRTL ? 'right' : 'left';

// Text colour placed on top of a filled ACCENT / WARNING / SUCCESS surface.
export const INK = '#080C14';

// Spacing scale (4pt grid)
export const SPACING = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };

// Corner radii: rounded-rect controls 12, cards 16, sheets 24, chips/badges pill
export const RADIUS = { xs: 6, sm: 10, md: 12, lg: 16, xl: 20, sheet: 24, pill: 999 };

// Type scale (size / line-height): comfortable 1.45-1.6 ratios for reading
export const TYPE = {
  caption: { fontSize: 11, lineHeight: 16 },
  small: { fontSize: 12, lineHeight: 18 },
  body: { fontSize: 14, lineHeight: 21 },
  bodyLg: { fontSize: 15, lineHeight: 23 },
  title: { fontSize: 17, lineHeight: 24 },
  heading: { fontSize: 20, lineHeight: 28 },
  display: { fontSize: 28, lineHeight: 34 },
};

// Layered ambient elevation. iOS: soft, wide shadow. Android: low elevation.
// Dark surfaces get depth mostly from the lighter surface + hairline border.
const elevation = (opacity, radius, offsetY, androidElevation) =>
  Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
    android: { elevation: androidElevation },
    default: {},
  });

export const SHADOW = {
  none: {},
  sm: elevation(0.16, 8, 2, 1),
  md: elevation(0.22, 16, 6, 3),
  lg: elevation(0.3, 28, 12, 8),
};

// Tema Tanımlamaları
export const darkTheme = {
  bg: '#0A0F1D',
  text: '#EEF1F8',
  subText: '#9AA6BD',
  cardBg: '#111A2E',
  inputBg: '#0D1426',
  borderColor: 'rgba(255, 255, 255, 0.09)',
  // Extended tokens (additive — existing keys above are unchanged in meaning)
  surfaceRaised: '#172238',
  borderStrong: 'rgba(255, 255, 255, 0.16)',
  accent: ACCENT,
  accentSoft: 'rgba(212, 178, 122, 0.14)',
  accentBorder: 'rgba(212, 178, 122, 0.38)',
  onAccent: INK,
  accentAlt: ACCENT_ALT,
  accentAltSoft: 'rgba(56, 189, 248, 0.12)',
  accentAltBorder: 'rgba(56, 189, 248, 0.34)',
  danger: DANGER,
  warning: WARNING,
  success: SUCCESS,
  overlay: 'rgba(5, 8, 16, 0.76)',
};

export const lightTheme = {
  bg: '#F5F3EE',
  text: '#0F172A',
  subText: '#475569',
  cardBg: '#FFFFFF',
  inputBg: '#F1EFE9',
  borderColor: '#CBD5E1',
  surfaceRaised: '#FBFAF7',
  borderStrong: '#9AA6BD',
  // Darker brand/status tones so text and icons stay legible on light surfaces
  accent: '#7D5A1E',
  accentSoft: 'rgba(125, 90, 30, 0.10)',
  accentBorder: 'rgba(125, 90, 30, 0.40)',
  onAccent: '#FFFFFF',
  accentAlt: '#0369A1', // dark twin of #38BDF8 (>= 5:1 on white and pearl)
  accentAltSoft: 'rgba(3, 105, 161, 0.10)',
  accentAltBorder: 'rgba(3, 105, 161, 0.34)',
  danger: '#B42318',
  warning: '#9A5B0A',
  success: '#047857',
  overlay: 'rgba(15, 23, 42, 0.45)',
};

export const getRiskColor = (level) => {
  switch (level) {
    case 'RED': return DANGER;
    case 'YELLOW': return WARNING;
    case 'GREEN': return SUCCESS;
    default: return '#8E8E93';
  }
};

// ── Theme-aware text / icon tones ─────────────────────────────────────────
// ACCENT / DANGER / WARNING / SUCCESS are the dark-theme values and stay valid
// as *fills* (with INK text on top) in both modes. Used as TEXT or ICON colour on
// the pale light surfaces they drop below 3:1, so text / icon call sites go
// through toneText(): identity in dark mode, the darker light-theme twin in
// light mode. Unknown colours always pass through untouched.
const LIGHT_TONE_TWIN = {
  [ACCENT.toLowerCase()]: lightTheme.accent,
  [ACCENT_ALT.toLowerCase()]: lightTheme.accentAlt,
  [DANGER.toLowerCase()]: lightTheme.danger,
  [WARNING.toLowerCase()]: lightTheme.warning,
  [SUCCESS.toLowerCase()]: lightTheme.success,
};

export const toneText = (color) => {
  if (activeThemeMode !== 'light' || typeof color !== 'string') return color;
  return LIGHT_TONE_TWIN[color.toLowerCase()] || color;
};

// Risk colour for text / icons (use getRiskColor for fills and borders).
export const getRiskTextColor = (level) => toneText(getRiskColor(level));

// Tipografi Hiyerarşisi (platforma göre modern sistem fontları)
export const FONTS = Platform.select({
  ios: { regular: 'System', medium: 'System', bold: 'System' },
  android: { regular: 'sans-serif', medium: 'sans-serif-medium', bold: 'sans-serif-medium' },
  default: { regular: 'System', medium: 'System', bold: 'System' },
});

// Stil Tanımlamaları
const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    zIndex: 20,
    elevation: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  tagline: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.2,
    marginTop: 2,
  },
  // Segmented navigation: four equal pills inside one rounded track.
  tabBar: {
    flexDirection: 'row',
    marginTop: 14,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderRadius: 18,
  },
  tabItem: {
    flex: 1,
    minHeight: 52,
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTabBorder: {
    borderWidth: 1,
  },
  tabText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    maxWidth: '100%',
  },
  headerIconBtn: {
    marginLeft: 'auto',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    ...SHADOW.sm,
  },
  settingLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
    height: 140,
    minHeight: 140,
    maxHeight: 140,
    marginBottom: 15,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  primaryButton: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT,
        shadowOpacity: 0.28,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  primaryButtonText: {
    color: '#080C14',
    fontFamily: FONTS.bold,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: ACCENT,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryBtnText: {
    color: ACCENT,
    fontFamily: FONTS.bold,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  uploadButton: {
    backgroundColor: '#172238',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontFamily: FONTS.medium,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  previewImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#080C14',
    borderRadius: 12,
  },
  fileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#172238',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultContainer: {
    marginTop: 20,
  },
  scoreCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 20,
    alignItems: 'center',
  },
  scoreTitle: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  scoreValue: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginVertical: 4,
  },
  gaugeWrapper: {
    width: '100%',
    marginTop: 6,
    marginBottom: 4,
  },
  gaugeTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: 8,
    borderRadius: 4,
  },
  gaugeLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  gaugeLegendText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  summaryText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    textAlign: alignStart,
    marginTop: 6,
    lineHeight: 23,
    letterSpacing: 0.1,
  },
  takeawayCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  takeawayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  takeawayTitle: {
    flex: 1,
    flexShrink: 1,
    fontFamily: FONTS.bold,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  takeawayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  takeawayIndex: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(232, 163, 61, 0.15)',
    color: WARNING,
    fontFamily: FONTS.bold,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 20,
  },
  takeawayText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  sectionHint: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  jurisdictionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  jurisdictionConfidence: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  jurisdictionRow: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  jurisdictionKey: {
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
  },
  redFlagCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(229, 72, 77, 0.45)',
    borderLeftWidth: 4,
    borderLeftColor: DANGER,
    marginBottom: 12,
    minHeight: 64,
    flexShrink: 1,
    overflow: 'visible',
  },
  yellowFlagCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(232, 163, 61, 0.45)',
    borderLeftWidth: 4,
    borderLeftColor: WARNING,
    marginBottom: 12,
    minHeight: 64,
    flexShrink: 1,
    overflow: 'visible',
  },
  redFlagText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  legalReference: {
    color: ACCENT_ALT,
    fontFamily: FONTS.medium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.2,
    marginTop: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  tipIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(212, 178, 122, 0.15)',
    color: ACCENT,
    fontFamily: FONTS.bold,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 22,
  },
  tipArgument: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 19,
  },
  tipRationale: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  glossaryRow: {
    marginBottom: 10,
  },
  glossaryTerm: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  glossaryDefinition: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 12,
    gap: 6,
  },
  exportBtnText: {
    color: '#080C14',
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  sectionHeader: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.3,
    marginBottom: 12,
  },
  clauseCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 72,
    flexShrink: 1,
    overflow: 'visible',
  },
  clauseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  clauseHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    flexShrink: 0,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  badgeTextOnYellow: {
    color: '#0A0F1D',
    fontFamily: FONTS.bold,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  clauseTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    fontWeight: 'bold',
    lineHeight: 22,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 120,
    flexBasis: '60%',
  },
  originalText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 8,
    flexShrink: 1,
    textAlign: alignStart,
  },
  issueBox: {
    backgroundColor: 'rgba(229, 72, 77, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  issueTitle: {
    color: DANGER,
    fontFamily: FONTS.bold,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  issueText: {
    color: DANGER,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: alignStart,
  },
  counterBox: {
    backgroundColor: 'rgba(212, 178, 122, 0.1)',
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  offerTierRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
    marginTop: 2,
  },
  offerTierChip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: '100%',
  },
  offerTierChipText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  counterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterTitle: {
    color: ACCENT,
    fontFamily: FONTS.bold,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  counterText: {
    color: ACCENT,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: alignStart,
  },
  historyCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  historyScore: {
    flex: 1,
    fontFamily: FONTS.bold,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    marginRight: 8,
  },
  historyMeta: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  historySummary: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  historyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  historyDeleteBtn: {
    padding: 4,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  activeLangBtn: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  langText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#9AA6BD',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  activeLangText: {
    color: '#080C14',
  },

  // Sözleşme Kütüphanesi — sabit yükseklik; klavye açılınca esnemez
  typeChipRow: {
    marginBottom: 14,
    flexGrow: 0,
    flexShrink: 0,
    zIndex: 5,
  },
  typeChipContent: {
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingRight: 12,
    gap: 8,
    flexGrow: 0,
  },
  typeChip: {
    height: 36,
    minHeight: 36,
    maxHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    backgroundColor: 'transparent',
    marginRight: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 0,
    flexShrink: 0,
  },
  typeChipActive: {
    backgroundColor: 'rgba(212, 178, 122, 0.1)',
    borderColor: '#D4B27A',
  },
  typeChipText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: '#9AA6BD',
  },
  typeChipTextActive: {
    color: '#D4B27A',
  },
  logoutBtnLarge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DANGER,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  logoutTextLarge: {
    color: DANGER,
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.3,
  },

  // --- Ülke / Dil Seçiciler ---
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 10,
  },
  selectorValue: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  selectorHint: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 8, 15, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '75%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginBottom: 14,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    marginBottom: 14,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  modalOptionText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modalOptionHint: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    marginTop: 2,
  },
  // --- Şifre belirleme ekranı ---
  passwordRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 46,
  },
  passwordToggle: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 12,
    justifyContent: 'center',
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  strengthTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthLabel: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // --- Abonelik paket kartları ---
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  planTitle: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    fontWeight: '600',
  },
  planBadge: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginTop: 3,
  },
  planPrice: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    fontWeight: '800',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    padding: 0,
  },
  sheetFlag: {
    fontSize: 20,
  },

  // --- Giriş ekranı dil düğmesi ---
  languageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  languageChipText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // --- Uluslararası telefon girişi ---
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  phoneCountryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  phoneDialText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // --- Analiz İlerleme Adımları ---
  progressCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    marginBottom: 16,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  progressStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  progressStepText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  progressStepActive: {
    fontFamily: FONTS.bold,
    fontWeight: 'bold',
  },

  // --- Sohbet (Hukuk Danışmanı & Destek) ---
  chatList: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 10,
    gap: 12,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    backgroundColor: 'rgba(212, 178, 122, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 178, 122, 0.35)',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    maxWidth: '90%',
    borderWidth: 1,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
  bubbleText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: alignStart,
  },
  bubbleMeta: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    maxHeight: 120,
  },
  chatSendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatDisclaimer: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  // --- Paywall / Kota ---
  quotaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
  },
  quotaText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  paywallFeatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  paywallFeatureText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  paywallPrice: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },

  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  previewBannerText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.2,
  },
  partyChoiceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  partyChoiceCard: {
    flex: 1,
    minHeight: 116,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: 'flex-start',
  },
  partyChoiceCardActive: {
    borderWidth: 2,
  },
  partyChoiceIcon: {
    marginBottom: 8,
  },
  partyChoiceTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  partyChoiceSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  partyChoiceMeta: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  decisionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  decisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  decisionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  decisionBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: '#080C14',
    textTransform: 'uppercase',
  },
  decisionKicker: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    letterSpacing: 0.4,
    flexShrink: 1,
  },
  decisionHeadline: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  decisionReasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  decisionReasonIndex: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontWeight: '800',
    width: 16,
  },
  decisionReasonText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  decisionHarmBox: {
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    marginBottom: 12,
  },
  decisionHarmLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  decisionHarmText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  decisionShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
  },
  decisionShareText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    fontWeight: '700',
    color: ACCENT,
  },
  decisionDisclaimer: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  lockedMoreText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  lockedCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  lockedIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 178, 122, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  lockedTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  lockedSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 14,
  },
  lockedCta: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  lockedCtaText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontWeight: '800',
    color: '#080C14',
    textAlign: 'center',
  },
  lockedWrap: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  lockedFrost: {
    opacity: 0.22,
    maxHeight: 170,
    overflow: 'hidden',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: 'rgba(8, 12, 20, 0.72)',
  },
  sideSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sideCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  sideCardEmoji: {
    fontSize: 18,
    marginBottom: 8,
  },
  sideCardLabel: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginBottom: 6,
  },
  sideCardHint: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  deadlineLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  deadlineMeta: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  deadlineDays: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    fontWeight: '800',
    maxWidth: 90,
    flexShrink: 1,
    textAlign: 'right',
  },
  upcomingCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  counterMessageCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  conversionHook: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  conversionHookTitle: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  conversionHookBody: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  layerRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  statusChipText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    fontWeight: '800',
    color: '#080C14',
    letterSpacing: 0.3,
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  proposalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  proposalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  proposalBtnText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    fontWeight: '700',
    color: ACCENT,
  },
  decisionAdvice: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  costWidget: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  costWidgetValue: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 6,
  },
  voiceBriefBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  modeToggle: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modeToggleText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    fontWeight: '800',
  },
  chatMicBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatMicBtnActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  unspecifiedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(232, 163, 61, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(232, 163, 61, 0.45)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unspecifiedBadgeDark: {
    backgroundColor: 'rgba(255, 214, 102, 0.28)',
    borderColor: 'rgba(255, 214, 102, 0.7)',
  },
  unspecifiedBadgeText: {
    color: '#0A0F1D',
    fontFamily: FONTS.bold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  unspecifiedBadgeTextDark: {
    color: '#FFE08A',
  },
  tiltTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 6,
  },
  tiltFill: {
    height: '100%',
  },
  lightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  clashBanner: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
});

// ── Light-mode legibility ─────────────────────────────────────────────────
// A handful of shared styles paint text / borders with the dark-mode champagne
// (#D4B27A). On the pearl light surfaces that is unreadable (~1.9:1), so the same
// style keys resolve to the bronze light accent when the light theme is active.
// Every `styles.<key>` call site keeps working unchanged; App sets the mode once
// per render through setActiveThemeMode(), before any child reads `styles`.
let activeThemeMode = 'dark';
export const setActiveThemeMode = (mode) => {
  activeThemeMode = mode === 'light' ? 'light' : 'dark';
};

const lightStyleVariants = StyleSheet.create({
  secondaryBtn: { ...baseStyles.secondaryBtn, borderColor: lightTheme.accentBorder },
  secondaryBtnText: { ...baseStyles.secondaryBtnText, color: lightTheme.accent },
  tipIndex: { ...baseStyles.tipIndex, backgroundColor: lightTheme.accentSoft, color: lightTheme.accent },
  counterTitle: { ...baseStyles.counterTitle, color: lightTheme.accent },
  counterText: { ...baseStyles.counterText, color: lightTheme.text },
  decisionShareText: { ...baseStyles.decisionShareText, color: lightTheme.accent },
  proposalBtn: { ...baseStyles.proposalBtn, borderColor: lightTheme.accentBorder },
  proposalBtnText: { ...baseStyles.proposalBtnText, color: lightTheme.accent },
  chatMicBtn: { ...baseStyles.chatMicBtn, borderColor: lightTheme.accentBorder },
  legalReference: { ...baseStyles.legalReference, color: lightTheme.accentAlt },
  langBtn: { ...baseStyles.langBtn, borderColor: lightTheme.borderColor },
  langText: { ...baseStyles.langText, color: lightTheme.subText },
  typeChip: { ...baseStyles.typeChip, borderColor: lightTheme.borderColor },
  typeChipActive: { ...baseStyles.typeChipActive, backgroundColor: lightTheme.accentSoft, borderColor: lightTheme.accent },
  typeChipText: { ...baseStyles.typeChipText, color: lightTheme.subText },
  typeChipTextActive: { ...baseStyles.typeChipTextActive, color: lightTheme.accent },
  modalHandle: { ...baseStyles.modalHandle, backgroundColor: 'rgba(15, 23, 42, 0.22)' },
  takeawayIndex: { ...baseStyles.takeawayIndex, color: lightTheme.warning },
  issueTitle: { ...baseStyles.issueTitle, color: lightTheme.danger },
  issueText: { ...baseStyles.issueText, color: lightTheme.danger },
  logoutTextLarge: { ...baseStyles.logoutTextLarge, color: lightTheme.danger },
});

export const styles = Object.defineProperties(
  { ...baseStyles },
  Object.keys(lightStyleVariants).reduce((acc, key) => {
    acc[key] = {
      enumerable: true,
      get: () => (activeThemeMode === 'light' ? lightStyleVariants[key] : baseStyles[key]),
    };
    return acc;
  }, {}),
);

// YELLOW badges need dark ink on WARNING (#E8A33D); RED/others keep white.
export const badgeLabelStyle = (level) =>
  String(level || '').toUpperCase() === 'YELLOW' ? styles.badgeTextOnYellow : styles.badgeText;
