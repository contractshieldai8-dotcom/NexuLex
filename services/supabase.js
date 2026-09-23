import '../utils/webcrypto';
import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL veya Anon Key .env dosyasında bulunamadı!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // React Native'de localStorage yoktur; adaptör verilmezse oturum yalnızca
    // bellekte tutulur ve uygulama kapanınca kaybolur.
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,

    // URL'i tarayıcı adres çubuğundan okumak web'e özgüdür. Mobilde bağlantıyı
    // expo-linking yakalar ve utils/authLinks.js işler.
    detectSessionInUrl: false,

    // PKCE: e-posta doğrulama kodu query string'de gelir; Android hash'teki
    // access_token'ı JS'e iletmez. SHA-256 polyfill (utils/webcrypto) uyarısızdır.
    flowType: 'pkce',
  },
});

// Uygulama ön plandayken token'ı otomatik tazele, arka planda durdur.
// Aksi hâlde arka planda gereksiz yenileme istekleri birikir.
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
