// NEXULEX AI — Destek bildirimlerini şirket e-postasına ileten edge function.
//
// Gerekli secret'lar (tanımlı değilse aşağıdaki varsayılanlar kullanılır):
//   supabase secrets set RESEND_API_KEY=...
//   supabase secrets set SUPPORT_INBOX=nexulexai@gmail.com
//   supabase secrets set SUPPORT_FROM="NEXULEX AI <destek@nexulexai.com>"
//
// Dağıtım:  supabase functions deploy notify-support

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

// Resend'de doğrulanmış domain: nexulexai.com
const DEFAULT_INBOX = 'nexulexai@gmail.com';
const DEFAULT_FROM = 'NEXULEX AI <destek@nexulexai.com>';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const inbox = body.to || Deno.env.get('SUPPORT_INBOX') || DEFAULT_INBOX;
    const apiKey = Deno.env.get('RESEND_API_KEY');
    const from = Deno.env.get('SUPPORT_FROM') || DEFAULT_FROM;

    if (!inbox) {
      return new Response(JSON.stringify({ error: 'SUPPORT_INBOX tanımlı değil.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Anahtar tanımlı değilse kayıt zaten veritabanında; sessizce geç.
    if (!apiKey) {
      console.warn('RESEND_API_KEY tanımlı değil, e-posta gönderilmedi.');
      return new Response(JSON.stringify({ delivered: false, stored: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const html = `
      <h2>Yeni destek bildirimi #${escapeHtml(body.id)}</h2>
      <p><b>Kullanıcı:</b> ${escapeHtml(body.email)} (${escapeHtml(body.user_id)})</p>
      <p><b>Konu:</b> ${escapeHtml(body.subject) || '-'}</p>
      <p><b>Dil:</b> ${escapeHtml(body.locale)} &nbsp; <b>Platform:</b> ${escapeHtml(body.platform)} &nbsp; <b>Sürüm:</b> ${escapeHtml(body.app_version)}</p>
      <p><b>Cihaz:</b> ${escapeHtml(body.device_id)}</p>
      <hr />
      <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(body.message)}</pre>
    `;

    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [inbox],
        reply_to: body.reply_to || body.email || undefined,
        subject: `[Destek] ${body.subject || 'Yeni bildirim'}`,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`E-posta sağlayıcısı ${response.status}: ${detail.slice(0, 300)}`);
    }

    return new Response(JSON.stringify({ delivered: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('notify-support hatası:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
