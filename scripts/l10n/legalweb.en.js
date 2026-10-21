// WAVE ST.3 — Privacy + delete page (EN master). Locked quota / lawyer sentences stay byte-identical.
module.exports = {
  privacy: `<h1>Privacy Policy</h1>
<p class="meta">Last updated: 21 October 2026</p>
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

<h2 data-sec="signup">7. Sign-up details</h2>
<p>At sign-up you provide an email address and a phone number. The phone number and a device identifier are used to claim the free analysis quota and to prevent repeated free-quota abuse. They are not used for advertising and are not sold.</p>
<h2 data-sec="voice">8. Voice input</h2>
<p>Voice input is optional. When you use the microphone, speech recognition is performed by the speech service built into your phone (Apple or Google), under that provider’s own privacy terms. NexuLex AI does not record or store your audio; it receives only the text you choose to use.</p>
<h2 data-sec="transfer">9. Service providers and international transfers</h2>
<p>We use these service providers to run NexuLex AI:</p>
<ul>
<li>Supabase: cloud database, sign-in and server functions. Our project is hosted in the European Union (Frankfurt, Germany).</li>
<li>Anthropic (Claude API, United States): analysis and answers, reached only through our server.</li>
<li>RevenueCat (United States): purchase and plan status.</li>
<li>Netlify: hosts these web pages and may process technical request data such as your IP address.</li>
<li>Apple and Google: the app stores, billing, and the speech recognition built into your phone.</li>
</ul>
<p>Some providers, such as Anthropic and RevenueCat, process data in the United States, and others may process data outside your country, including outside the European Economic Area, the United Kingdom, Switzerland and Türkiye. Where the law requires safeguards for such transfers, we rely on the data-protection addenda and international transfer mechanisms (such as standard contractual clauses) offered in these providers’ standard terms of service.</p>
<h2 data-sec="rights">10. Your rights</h2>
<p>Depending on where you live (for example under the GDPR / UK GDPR, the Swiss FADP, Austria’s DSG, Türkiye’s KVKK, India’s DPDP Act, Canada’s PIPEDA and provincial laws, or Australia’s Privacy Act) you may have the right to access, correct, delete, export, restrict or object to the use of your data, and to withdraw consent. You can delete your account in the app. For other requests, email nexulexai@gmail.com from the address you registered with; we answer within the period the law requires. You may also complain to the data-protection authority in your country.</p>
<h2 data-sec="children">11. Children, advertising and tracking</h2>
<p>NexuLex AI is intended for adults aged 18 or over and is not directed at children. We do not knowingly collect data from children; contact us and we will delete it. The app contains no advertising and no cross-app tracking, and we do not sell personal data.</p>
<h2 data-sec="analytics">12. Anonymous usage and error reports</h2>
<p>To keep the app reliable and improve it, NexuLex AI can send short anonymous events: for example which areas are used, whether an analysis finished or failed, paywall and purchase outcomes, and the type of an error. Each report carries a random install ID created on your device (not your device’s hardware ID), the app version, platform and app language. Reports never contain your contracts, text, images, email address, phone number or account ID, and are not used for advertising or sold.</p>
<p>In the European Economic Area, the United Kingdom, Switzerland, Türkiye, Brazil, India, South Korea and South Africa, nothing is sent unless you allow it. Elsewhere it is on by default. You can change this at any time under <strong>Settings → Privacy</strong>; turning it off deletes any reports still waiting on your device. Reports are stored in Supabase and removed after at most 180 days.</p>
<h2 data-sec="invite">13. Invite codes</h2>
<p>If you are signed in, NexuLex AI gives you a short invite code. When a friend enters it, we store the two account IDs, the friend’s device identifier (the one used for the free-analysis quota) and the date, only to grant the bonus analyses and to prevent abuse. Nothing about your contracts is shared. If you delete your account, your code and its account links are deleted; a record without any account ID may remain so the same device cannot claim the bonus again.</p>
<h2 data-sec="controller">14. Controller and legal bases</h2>
<p>The controller of your personal data is Doğancan Kara, a sole proprietor in Bağcılar, Istanbul, Türkiye (email: nexulexai@gmail.com), publisher of NexuLex AI. Where the GDPR, the UK GDPR or the Swiss FADP applies, we rely on these legal bases: performing our contract with you (your account, analyses, quotas and purchases); our legitimate interests (running the service securely, preventing free-quota abuse and fixing errors); your consent (optional features you switch on, such as anonymous usage reports where consent is required); and legal obligations where they apply. You can withdraw consent at any time; this does not affect earlier processing. Where other data-protection laws apply, we rely on the equivalent grounds they provide.</p>
<h2 data-sec="security">15. Security</h2>
<p>We protect data with encrypted connections (HTTPS), account authentication and row-level security policies in our database, and AI requests go through our server rather than directly from the app. No system is completely secure, so please keep your login credentials safe. If a personal-data breach affects you, we will tell you and the authorities where the law requires.</p>
<h2 data-sec="templates">16. Contract templates</h2>
<p>The Contract library (Advisor tab) fills open-source contract templates on your device. The details you type into the form are used only to build the document on screen and are kept only in the app’s memory for that session; they are not sent to our servers, to our AI provider or to anyone else, and they are not saved to your account. The document leaves your device only when you copy, share or export it yourself. The template texts are bundled with the app and published by General Legal under the CC0-1.0 public-domain licence.</p>
<h2 data-sec="retention">17. Retention periods</h2>
<p>How long we keep data on our servers:</p>
<table>
<thead><tr><th>Data</th><th>How long</th></tr></thead>
<tbody>
<tr><td>Account and profile</td><td>Until you delete your account</td></tr>
<tr><td>Saved analyses and contract text</td><td>Until you delete them or your account</td></tr>
<tr><td>Brief and share codes</td><td>Until the stated validity window ends; an expired code stops working automatically</td></tr>
<tr><td>Support messages</td><td>At most 24 months, or until you delete your account</td></tr>
<tr><td>Anonymous usage and error reports</td><td>At most 180 days</td></tr>
<tr><td>Free-quota record (device identifier and phone number, without any link to your account)</td><td>No fixed end date; kept only to prevent repeated free-quota abuse</td></tr>
<tr><td>Plan and expiry date on your profile</td><td>Until you delete your account; purchase records held by Apple, Google and RevenueCat follow their own policies</td></tr>
<tr><td>Data on your device (history, case files, answers, drafts)</td><td>Until you delete it or uninstall the app</td></tr>
</tbody>
</table>
<h2 data-sec="kvkk">18. Türkiye: KVKK information notice (Law No. 6698)</h2>
<p>If you are in Türkiye, this section is our information notice under Article 10 of the Personal Data Protection Law No. 6698 (KVKK). Data controller: Doğancan Kara (sole proprietor), Bağcılar, Istanbul, Türkiye; email: nexulexai@gmail.com.</p>
<p>Purposes: creating and running your account, analysing the contracts you submit, enforcing quotas, processing purchases, giving support, keeping the service secure and preventing abuse, and meeting legal obligations. Legal grounds (Article 5): performance of a contract, the controller’s legitimate interests, explicit consent where it is required (for example optional anonymous usage reports), and legal obligations. Method: your own input and automatic collection through the app, by electronic means.</p>
<p>Recipients and transfers: your data is processed by the service providers named in section 9, some of them outside Türkiye (Supabase in the European Union, Anthropic and RevenueCat in the United States). We carry out transfers abroad in line with Article 9 of the KVKK. We do not sell your data.</p>
<p>Your rights under Article 11: to learn whether your data is processed and request information about it; to learn the purpose and whether it is used accordingly; to know the third parties to whom it is transferred in Türkiye or abroad; to request correction of incomplete or wrong data; to request deletion or destruction under Article 7 and ask that third parties be told; to object to a result against you that comes only from automated analysis; and to claim compensation for loss caused by unlawful processing.</p>
<p>To apply, email nexulexai@gmail.com from the address you registered with and describe your request. We answer within 30 days at the latest. If you are not satisfied, you may complain to the Personal Data Protection Board (Kişisel Verileri Koruma Kurulu). Contracts you upload may contain other people’s data; you must have the right to process it.</p>
<h2 data-sec="ccpa">19. United States: California and other state privacy rights</h2>
<p>We do not sell your personal information and we do not share it for cross-context behavioural advertising. The app contains no advertising, so there is no “Do Not Sell or Share My Personal Information” setting to switch.</p>
<p>If you live in California or another US state with a consumer privacy law (for example the CCPA/CPRA), then to the extent that law applies to us you may have the right to know what personal information we collect, use and disclose; to access, correct and delete it; to limit the use of sensitive personal information; and to be free from discrimination for using these rights.</p>
<p>In the past twelve months we collected these categories: identifiers (email address, phone number, device and install identifiers); commercial information (plan and purchase status); app activity (anonymous usage events); and the content you submit (contracts and questions). We disclose them only to the service providers in section 9, for the business purposes described in this policy. We do not store your voice audio.</p>
<p>To use your rights, email nexulexai@gmail.com from the address you registered with. We may ask for details to verify that it is you, you can use an authorised agent, and we respond within 45 days where the law requires.</p>
<h2 data-sec="changes">20. Changes to this policy</h2>
<p>We may update this Privacy Policy. If we make material changes, we will change the date at the top and, where the law requires, tell you in the app or by other appropriate means before the change applies. Please review this page from time to time.</p>
<h2 data-sec="language">21. Languages</h2>
<p>This policy is available in several languages for convenience. In case of discrepancies, the English version shall prevail.</p>
<h2>22. Contact</h2>
<p>Questions about privacy and requests about your data: email nexulexai@gmail.com or use the in-app Support screen. Publisher and controller: Doğancan Kara (sole proprietor), Bağcılar, Istanbul, Türkiye.</p>`,

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

  terms: `<h1>Terms of Use (EULA)</h1>
<p class="meta">Last updated: 21 October 2026</p>
<p>By downloading or using NexuLex AI you agree to these Terms of Use and our <a href="privacy.html">Privacy Policy</a>.</p>

<h2>1. Service description</h2>
<p>NexuLex AI is a consumer software tool that helps you review contracts, surface risks, draft counter-language, and share limited read-only briefs. It is provided “as is”.</p>

<h2>2. Not a law firm</h2>
<p><strong>NexuLex AI is not a law firm and does not provide legal advice.</strong> Nothing in the app creates an attorney–client relationship. Always verify important decisions with a licensed lawyer in your jurisdiction.</p>
<p>“Find a lawyer” links only to official directories run by bar associations and public bodies. NexuLex AI does not recommend, rank or refer lawyers, receives no referral fees and is not responsible for the services of any lawyer you choose. Check a lawyer’s admission and fees before you instruct them.</p>

<h2>3. Accounts &amp; subscriptions</h2>
<ul>
<li>Free quotas and Pro entitlements are enforced server-side and through RevenueCat / the app stores.</li>
<li>The Professional plan includes everything in Pro plus the Professional tools and higher daily limits shown in the app. Your plan is verified by our server with RevenueCat; it cannot be changed from the app.</li>
<li>The Professional tools are work aids for professionals, not legal advice. They use only the material you provide and may contain errors; you must verify every date, fact and source before relying on it. NexuLex AI does not represent anyone before any court or authority.</li>
<li>Billing, refunds, and cancellations for paid plans follow Apple App Store or Google Play rules.</li>
<li>You are responsible for keeping your login credentials secure.</li>
</ul>

<h2>4. Acceptable use</h2>
<ul>
<li>Do not upload unlawful content or material you are not authorized to process.</li>
<li>Do not attempt to reverse engineer, overload, or bypass security, quotas, or paywalls.</li>
<li>Do not use the service to harass, defraud, or mislead others.</li>
<li>Do not share secrets, credentials, or third-party personal data without a lawful basis.</li>
</ul>

<h2>5. Intellectual property</h2>
<p>The NexuLex AI name, branding, and app software are owned by the publisher. You retain rights in contracts you upload. You grant us a limited license to process that content solely to provide the service.</p>

<h2>6. Shared briefs &amp; seats</h2>
<p>Brief links and advisor / household seats are designed to hide the original contract text. Recipients still see analysis-derived summaries you choose to share. Use care before minting codes.</p>

<h2>7. Limitation of liability</h2>
<p>To the maximum extent permitted by law, we are not liable for decisions you make based on app output, third-party AI errors, store billing disputes, or outages outside our reasonable control.</p>

<h2>8. Changes</h2>
<p>We may update these Terms. Continued use after an update constitutes acceptance of the revised Terms.</p>

<h2 data-sec="eligibility">9. Eligibility</h2>
<p>You must be at least 18 years old, or of legal age where you live, to use NexuLex AI. If you use it for a business, you confirm that you may bind that business.</p>
<h2 data-sec="renewal">10. Subscriptions and automatic renewal</h2>
<p>Paid plans renew automatically for the same period at the store price shown, until you cancel. Payment is charged to your App Store or Google Play account. You can manage or cancel in your store account settings; on the App Store, cancel at least 24 hours before the current period ends. Deleting your NexuLex AI account does not cancel a subscription. Refunds follow the store’s policy.</p>
<h2 data-sec="ai">11. AI-generated output</h2>
<p>Analyses, answers, drafts and summaries are generated by artificial intelligence. They can be incomplete, out of date or wrong, and laws differ by country and change over time. Check important points with official sources or a licensed lawyer before you rely on them.</p>
<h2 data-sec="termin">12. Suspension and termination</h2>
<p>You can stop using NexuLex AI and delete your account at any time. We may suspend or end access that breaches these Terms or puts the service or other users at risk.</p>
<h2 data-sec="templates">13. Contract templates</h2>
<p>The Contract library (Advisor tab) offers general-purpose business contract templates published by General Legal under the CC0-1.0 public-domain licence. NexuLex AI inserts the details you type and leaves the rest of each template unchanged, in its original English wording. The templates are not tailored to your situation, country or industry and may not be valid or enforceable where you are. They are provided “as is”, without warranty. Have a lawyer licensed in the governing jurisdiction review any contract before you sign it. NexuLex AI is not a party to any contract you create, and the Contract library does not create an attorney–client relationship. The full document, Word export, copy and share actions are part of the Pro plan; free users see a preview.</p>
<h2 data-sec="law">14. Governing law and courts</h2>
<p>These Terms are governed by the laws of the Republic of Türkiye. The courts and enforcement offices of Istanbul (Çağlayan) have jurisdiction, without removing any mandatory consumer-protection right you have under the law of the country where you live, including any right to bring a claim before the competent court or body there.</p>
<h2 data-sec="language">15. Languages</h2>
<p>These Terms are available in several languages for convenience. In case of discrepancies, the English version shall prevail.</p>
<h2>16. Contact</h2>
<p>Use the in-app Support screen or email nexulexai@gmail.com for account, product and consumer questions. Publisher: Doğancan Kara (sole proprietor), Bağcılar, Istanbul, Türkiye.</p>`,
};
