// WAVE ST.3 — Privacy + delete page (EN master). Locked quota / lawyer sentences stay byte-identical.
module.exports = {
  privacy: `<h1>Privacy Policy</h1>
<p class="meta">Last updated: 25 September 2026</p>
<p>This Privacy Policy explains how NexuLex AI (“we”, “the app”) handles information when you use our mobile application and related web viewers.</p>

<h2>1. Data we process</h2>
<ul>
<li>Account data such as email address and authentication identifiers.</li>
<li>Contract text, images, or PDFs you upload or paste for analysis.</li>
<li>Photos and PDFs are chosen by you in the system picker. They are not taken in the background.</li>
<li>Analysis outputs, briefs, reminders, and support messages you create.</li>
<li>Purchase and entitlement status from the app stores via RevenueCat. Our server asks RevenueCat which plan (Pro or Professional) your account holds and stores only that plan and its expiry date on your profile.</li>
<li>Basic device and diagnostic signals needed to run the service securely.</li>
</ul>

<h2>2. Cloud storage (Supabase)</h2>
<p>Authenticated product data is stored in Supabase (PostgreSQL and related cloud services). Access is restricted by account authentication and row-level security policies. Shared briefs use short-lived codes and do not include the original contract text.</p>

<h2>3. How we use data</h2>
<ul>
<li>To analyse contracts, generate reports, and operate advisor / household seats.</li>
<li>To enforce free and Pro quotas and restore purchases.</li>
<li>To send optional local reminders you schedule on your device.</li>
<li>To respond to support requests you submit.</li>
</ul>

<h2>4. AI processing</h2>
<p>Contract content you submit may be sent to our cloud AI proxy for analysis. We do not sell your contracts. Do not upload information you are not permitted to process.</p>
<p>Legal questions and the Professional tools (chronology, issue list, research memo): your question, facts, case material and any case file you attach (without evidence files) are sent over an encrypted connection through our server to our AI provider only to create the answer. Our server keeps only a daily count of questions and Professional tool runs, not your text or the AI output. Answers, results and case files are saved on your device unless you save them elsewhere or share them.</p>
<p>You can report an AI output from the analysis report, an advisor answer or a polished draft. A report stores the reason, your optional note, the item id, app language and selected country. Contract or answer text (up to 2,000 characters) is attached only if you switch on “Include contract context”.</p>
<p>Find a lawyer: the first message and the case packet are created on your device without AI and are not sent to our servers or to any lawyer. They leave your device only when you copy or share them yourself. Directory links open the official websites of bar associations and public bodies, which have their own privacy policies. NexuLex does not pass your data to lawyers and receives no referral fees.</p>

<h2>5. Retention &amp; deletion</h2>
<p>You can delete your account at any time in the app under <strong>Settings → Delete account</strong>, or by following the steps on the <a href="delete-account.html">account deletion page</a> (no app needed). Deletion removes your account and profile, saved analyses and contract text, share codes, reminders, advisor / household seats and briefs, support messages and AI-output reports. On the device used for in-app deletion, scheduled reminders, local caches and exported files are also cleared.</p>
<p>After account deletion, the device identifier and phone number used to claim the free quota are retained without any link to your account, solely to prevent repeated free-quota abuse.</p>
<p>An active App Store / Google Play subscription is not cancelled automatically by account deletion; cancel it in your store account. Brief codes expire automatically after their stated validity window.</p>

<h2>6. Legal disclaimer</h2>
<p><strong>NexuLex AI is not a law firm and does not provide legal advice.</strong> Outputs are general informational tools. Decisions remain yours; consult a licensed lawyer for your matter.</p>

<h2>7. Contact</h2>
<p>Questions about privacy: use the in-app Support screen or contact the publisher listed on the store listing.</p>`,

  deleteAccount: `<h1>Delete your NexuLex AI account</h1>
<p class="meta">Last updated: 25 September 2026</p>

<h2>In the app (fastest)</h2>
<ol>
<li>Open NexuLex AI and sign in.</li>
<li>Go to <strong>Settings</strong> and tap <strong>Delete account</strong>.</li>
<li>Read the notice and confirm twice. Deletion runs immediately and you are signed out.</li>
</ol>

<p class="warn"><strong>Subscriptions are not cancelled automatically.</strong> Cancel an active plan in
<a href="https://apps.apple.com/account/subscriptions">App Store subscriptions</a> or
<a href="https://play.google.com/store/account/subscriptions">Google Play subscriptions</a>.</p>

<h2>Without the app</h2>
<p>Email <a href="mailto:nexulexai@gmail.com?subject=Account%20deletion%20request">nexulexai@gmail.com</a> from the address you registered with and write “Delete my account”. We confirm by email and complete the deletion within 30 days.</p>

<h2>What is deleted</h2>
<ul>
<li>Your account and profile (email, sign-in identifiers, Pro status record).</li>
<li>Saved analyses and contract text, share codes you created, reminders, advisor / household seats and briefs.</li>
<li>Support messages and AI-output reports you sent.</li>
<li>On the device used for in-app deletion: scheduled reminders, local caches and exported files are cleared.</li>
</ul>

<h2>What is kept</h2>
<p>The device identifier and phone number used to claim the free analysis quota are retained without any link to your account, solely to prevent repeated free-quota abuse. Purchase records held by Apple, Google and RevenueCat are governed by their own policies.</p>

<p>See also the <a href="privacy.html">Privacy Policy</a>.</p>`,
};
