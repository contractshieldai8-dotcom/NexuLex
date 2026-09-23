// WAVE ST — localized iOS permission dialogs (app.json "locales" → InfoPlist.strings at prebuild).
// Run: node scripts/gen-ios-locales.js  (native config: needs a new build, not OTA)
const fs = require('fs');
const path = require('path');

// [microphone, speech recognition, photo library]
const STRINGS = {
  tr: [
    'NexuLex AI, hukuki sorularınızı sesle sorabilmeniz için mikrofonu kullanır.',
    'NexuLex AI, konuşmanızı metne çevirmek için konuşma tanıma kullanır.',
    'NexuLex AI, fotoğraf arşivinizi yalnızca analiz edilecek sözleşme fotoğraflarını seçmeniz için açar.',
  ],
  en: [
    'NexuLex AI uses the microphone so you can ask legal questions by voice.',
    'NexuLex AI uses speech recognition to turn your voice into text.',
    'NexuLex AI opens your photo library only so you can pick contract photos to analyze.',
  ],
  de: [
    'NexuLex AI nutzt das Mikrofon, damit Sie Rechtsfragen per Sprache stellen können.',
    'NexuLex AI nutzt die Spracherkennung, um Ihre Stimme in Text umzuwandeln.',
    'NexuLex AI öffnet Ihre Fotomediathek nur, damit Sie Vertragsfotos zur Analyse auswählen können.',
  ],
  fr: [
    'NexuLex AI utilise le micro pour que vous puissiez poser vos questions juridiques à voix haute.',
    'NexuLex AI utilise la reconnaissance vocale pour transformer votre voix en texte.',
    'NexuLex AI ouvre votre photothèque uniquement pour choisir des photos de contrat à analyser.',
  ],
  es: [
    'NexuLex AI usa el micrófono para que puedas hacer tus preguntas legales por voz.',
    'NexuLex AI usa el reconocimiento de voz para convertir tu voz en texto.',
    'NexuLex AI abre tu fototeca solo para que elijas fotos de contratos que analizar.',
  ],
  ar: [
    'يستخدم NexuLex AI الميكروفون لتتمكن من طرح أسئلتك القانونية صوتيًا.',
    'يستخدم NexuLex AI التعرّف على الكلام لتحويل صوتك إلى نص.',
    'يفتح NexuLex AI مكتبة الصور فقط لتختار صور العقود المراد تحليلها.',
  ],
  it: [
    'NexuLex AI usa il microfono per permetterti di fare domande legali a voce.',
    'NexuLex AI usa il riconoscimento vocale per trasformare la tua voce in testo.',
    'NexuLex AI apre la libreria foto solo per scegliere le foto dei contratti da analizzare.',
  ],
  zh: [
    'NexuLex AI 使用麦克风，方便您用语音提出法律问题。',
    'NexuLex AI 使用语音识别将您的语音转换为文字。',
    'NexuLex AI 仅在您选择要分析的合同照片时打开照片图库。',
  ],
  ru: [
    'NexuLex AI использует микрофон, чтобы вы могли задавать юридические вопросы голосом.',
    'NexuLex AI использует распознавание речи, чтобы превратить ваш голос в текст.',
    'NexuLex AI открывает медиатеку только для выбора фотографий договора для анализа.',
  ],
  fa: [
    'NexuLex AI از میکروفون استفاده می‌کند تا بتوانید پرسش‌های حقوقی خود را با صدا بپرسید.',
    'NexuLex AI برای تبدیل صدای شما به متن از تشخیص گفتار استفاده می‌کند.',
    'NexuLex AI کتابخانه عکس را فقط برای انتخاب عکس‌های قرارداد جهت تحلیل باز می‌کند.',
  ],
  ja: [
    'NexuLex AI は、法律に関する質問を音声で入力できるようにマイクを使用します。',
    'NexuLex AI は、音声をテキストに変換するために音声認識を使用します。',
    'NexuLex AI は、分析する契約書の写真を選ぶ場合にのみ写真ライブラリを開きます。',
  ],
  pt: [
    'O NexuLex AI usa o microfone para que você possa fazer perguntas jurídicas por voz.',
    'O NexuLex AI usa o reconhecimento de fala para transformar sua voz em texto.',
    'O NexuLex AI abre sua fototeca apenas para você escolher fotos de contratos para análise.',
  ],
  nl: [
    'NexuLex AI gebruikt de microfoon zodat u juridische vragen met uw stem kunt stellen.',
    'NexuLex AI gebruikt spraakherkenning om uw stem om te zetten in tekst.',
    'NexuLex AI opent uw fotobibliotheek alleen om contractfoto’s te kiezen voor analyse.',
  ],
};

const dir = path.join(__dirname, '..', 'locales', 'ios');
fs.mkdirSync(dir, { recursive: true });
for (const [lang, [mic, speech, photos]] of Object.entries(STRINGS)) {
  const body = {
    ios: {
      NSMicrophoneUsageDescription: mic,
      NSSpeechRecognitionUsageDescription: speech,
      NSPhotoLibraryUsageDescription: photos,
    },
  };
  fs.writeFileSync(path.join(dir, `${lang}.json`), `${JSON.stringify(body, null, 2)}\n`, 'utf8');
}
console.log('Wrote locales/ios/*.json langs=', Object.keys(STRINGS).length);
