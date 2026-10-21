# NexuLex AI — Mağaza gizlilik beyanı eşleme rehberi

Bu rehber, **kodun gerçekte topladığı verileri** Google Play “Data safety” ve App Store “App Privacy” (privacy nutrition label) formlarındaki alanlarla eşler. Kaynak gerçekler: `web/privacy.html` (21 Ekim 2026 sürümü), `STORE_LISTING.md` → “Data Safety & App Privacy” tablosu, `supabase/` fonksiyonları ve migrasyonları. Politika ile form çelişirse mağaza incelemesinde reddedilme ve yanlış beyan riski doğar; bu yüzden iki yüzey **aynı gerçeklere** dayanır.

## 0. Sorumlu ve işleyiciler (formdaki “data shared” sorusu için)

| Rol | Kişi / hizmet | Bölge | Not |
|---|---|---|---|
| Veri sorumlusu / yayıncı | Doğancan Kara (şahıs işletmesi), Bağcılar, İstanbul, Türkiye | — | Resmî iletişim: `nexulexai@gmail.com` |
| İşleyici | Supabase (veritabanı, oturum, Edge Functions) | AB, Frankfurt (`eu-central-1`) | Panelde bölgeyi doğrulayın |
| İşleyici | Anthropic (Claude API) | ABD | Yalnızca sunucu vekili üzerinden; uygulama doğrudan çağırmaz |
| İşleyici | RevenueCat | ABD | Satın alma ve plan doğrulama |
| İşleyici | Netlify | — | Yalnızca statik yasal sayfalar; teknik istek günlükleri (IP) |
| Cihaz / OS | Apple, Google konuşma tanıma | Cihaz içi / OS | Uygulama ses kaydetmez ve almaz |
| **Kullanılmaz** | Google Gemini | — | Kodda yok; politikadan çıkarıldı (`scripts/verify-ui.js` bunu denetler) |

Google Play kuralı: hizmeti sizin adınıza yürüten işleyicilere aktarım “paylaşım” sayılmaz. Bu nedenle **“Data shared” = hayır** işaretlenir. Reklam, satış veya izleme yoktur.

## 1. Google Play — Data safety

Genel yanıtlar:

- Uygulama veri topluyor mu: **Evet**.
- Veri üçüncü taraflarla paylaşılıyor mu: **Hayır** (işleyiciler paylaşım değildir).
- Aktarım sırasında şifreleme: **Evet** (HTTPS/TLS).
- Kullanıcı veri silme talep edebilir mi: **Evet**. Uygulama içi: Ayarlar → Hesabı sil. Web URL: `https://nexulexai.netlify.app/delete-account.html`.
- Reklam kimliği kullanılıyor mu: **Hayır**.

| Google Play kategorisi → veri türü | Toplanır | Paylaşılır | Zorunlu / isteğe bağlı | Amaç |
|---|---|---|---|---|
| Personal info → Email address | Evet | Hayır | Zorunlu | App functionality, Account management |
| Personal info → Phone number | Evet | Hayır | Zorunlu (ücretsiz hak için) | Fraud prevention, security and compliance |
| Personal info → User IDs | Evet | Hayır | Zorunlu | App functionality, Account management |
| Financial info → Purchase history | Evet (plan ve bitiş tarihi) | Hayır | İsteğe bağlı | App functionality |
| Photos and videos → Photos | Evet (kullanıcı sistem seçicisinden seçer; arka planda erişim yok) | Hayır | İsteğe bağlı | App functionality |
| Files and docs → Files and docs | Evet (seçilen PDF) | Hayır | İsteğe bağlı | App functionality |
| Messages → Other in-app messages | Evet (destek iletileri, YZ çıktısı bildirimleri) | Hayır | İsteğe bağlı | App functionality, Customer support |
| App activity → Other user-generated content | Evet (sözleşme metni, analiz çıktıları, paylaşım kodları, hatırlatıcılar) | Hayır | İsteğe bağlı | App functionality |
| App activity → App interactions | Evet (anonim olaylar) | Hayır | **İsteğe bağlı** (kullanıcı kapatabilir) | Analytics |
| App info and performance → Crash logs, Diagnostics | Evet | Hayır | **İsteğe bağlı** | Analytics |
| Device or other IDs → Device or other IDs | Evet (anonim kurulum kimliği; ücretsiz kota cihaz kimliği) | Hayır | Kota kimliği zorunlu, kurulum kimliği isteğe bağlı | Analytics (kurulum kimliği); Fraud prevention (kota kimliği) |

Beyan **edilmeyen** türler (kodda toplanmıyor): Location, Contacts, Calendar, Health and fitness, Web browsing, Search history, Audio (ses cihazda işletim sistemince metne çevrilir; uygulama kaydı almaz veya saklamaz), Videos, Advertising ID.

Not: “Optional” işaretli analiz verileri, AEA, Birleşik Krallık, İsviçre, Türkiye, Brezilya, Hindistan, Güney Kore ve Güney Afrika’da kullanıcı açıkça izin vermeden gönderilmez.

## 2. App Store — App Privacy (privacy nutrition label)

Genel: **Data Used to Track You: yok** (ATT istenmez, `NSUserTrackingUsageDescription` yok). Üçüncü taraf reklam yok.

| Apple kategorisi → tür | Kimliğe bağlı mı | İzleme | Amaç |
|---|---|---|---|
| Contact Info → Email Address | Evet | Hayır | App Functionality |
| Contact Info → Phone Number | Evet | Hayır | App Functionality (kötüye kullanım önleme) |
| Identifiers → User ID | Evet | Hayır | App Functionality |
| Identifiers → Device ID | Evet | Hayır | App Functionality (ücretsiz kota, kötüye kullanım önleme) |
| Purchases → Purchase History | Evet | Hayır | App Functionality |
| User Content → Photos or Videos | Evet | Hayır | App Functionality (yalnızca kullanıcının seçtiği sözleşme görseli) |
| User Content → Other User Content | Evet | Hayır | App Functionality (sözleşme metni, analizler) |
| User Content → Customer Support | Evet | Hayır | App Functionality |
| Usage Data → Product Interaction | **Hayır** (kimliğe bağlı değil) | Hayır | Analytics |
| Diagnostics → Crash Data, Performance Data, Other Diagnostic Data | **Hayır** | Hayır | Analytics |

Şifreleme: `ITSAppUsesNonExemptEncryption = false` (yalnızca standart işletim sistemi şifrelemesi).

## 3. Saklama süreleri ve politika eşlemesi (politika bölüm 17)

| Veri | Süre | Zorlama |
|---|---|---|
| Hesap, profil, analizler | Kullanıcı silene kadar | `delete-account` Edge fonksiyonu |
| Destek mesajları | En fazla 24 ay | `purge_old_support_messages(24)` — migrasyon `20261021120000_support_retention.sql` |
| Anonim kullanım ve hata raporları | En fazla 180 gün | `purge_old_app_events(180)` — aynı migrasyonla zamanlanır |
| Paylaşım kodları | Geçerlilik süresi dolunca devre dışı | Edge fonksiyonu süre denetimi |
| Ücretsiz kota kaydı (cihaz kimliği, telefon) | Sabit bitiş yok; hesapla bağsız | Politikada açıkça yazılı |

## 4. Yayından önce yapılacaklar (sizin tarafınızda)

1. `supabase db push` ile `20261021120000_support_retention.sql` uygulanır. Supabase panelinde **Database → Extensions → pg_cron** açıksa iki günlük silme işi otomatik kurulur; kapalıysa önce açıp migrasyonu yeniden çalıştırın. Aksi hâlde 24 ay ve 180 gün vaatleri uygulanmamış olur.
2. `git push` ile `web/privacy.html`, `web/terms.html` ve `web/dist/*` Netlify’e gider (`nexulexai.netlify.app` main dalına bağlı).
3. Google Play Console → App content → Data safety ve App Store Connect → App Privacy formları yukarıdaki tablolara göre doldurulur; gizlilik URL’si `https://nexulexai.netlify.app/privacy.html`, hesap silme URL’si `https://nexulexai.netlify.app/delete-account.html`.
4. Supabase proje bölgesinin Frankfurt olduğu panelden bir kez doğrulanır; değişirse politika bölüm 9 ve bu rehber güncellenir.

## 5. Bilinen riskler (kamuya açık metinde yer almaz)

- **GDPR Madde 27:** AB’de tanımlı temsilci yok. AB kullanıcılarına bilinçli hedefleme büyürse temsilci atanması değerlendirilmelidir.
- **Özel DPA yok:** Aktarımlar sağlayıcıların standart hizmet şartlarındaki veri koruma ekleri ve aktarım mekanizmalarına dayanır (politikadaki ifade bununla birebir).
- **Süresiz kota kaydı:** Cihaz kimliği ve telefon, hesapla bağsız ve süresiz tutulur. Saklama sınırlaması ilkesi açısından en hassas noktadır; politikada açıkça belirtilmiştir. Yazım bilinçli olarak “anonimleştirilmiş/hashlenmiş” iddiasını **içermez**; teknik olarak bu doğrulanmadan yazılmamalıdır (`legalWebAssert.js` bu ifadeleri yasaklar).
- **KVKK / VERBİS:** Şahıs işletmesi olarak VERBİS kayıt yükümlülüğü eşiklerini ve istisnalarını bir Türk hukuk danışmanıyla bir kez doğrulayın.
- **Dil önceliği:** Çeviri uyuşmazlığında İngilizce metin geçerlidir; her dilde not vardır.
