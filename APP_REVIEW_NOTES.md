# App Review notes (App Store Connect > App Review Information > Notes)

Paste the block under "Notes to paste" into App Store Connect. Fill the two `<...>` credential fields and tick the
checklist below before submitting. `node scripts/test-review-readiness.mjs` prints a warning for every field that is
still unfilled. It never fails the build over credentials, since they must not be committed.

## Before you submit (do these on the production backend)

- [ ] Create the demo user in the PRODUCTION Supabase project (Auth > Users > Add user, tick "Auto Confirm User"), so the
      reviewer never has to open a confirmation e-mail.
- [ ] Sign in once with that user on a clean device: run an analysis, accept the AI consent screen, open Settings.
- [ ] Give the demo user the Pro plan (RevenueCat promotional entitlement) so the reviewer can see every screen without
      paying. Purchases still work through the App Store sandbox (see note 4).
- [ ] App Store Connect > App Privacy: match `STORE_PRIVACY_MAPPING.md` line by line.
- [ ] Privacy Policy URL: `https://nexulexai.netlify.app/privacy.html`. Open it on a phone first.
- [ ] Support URL and Marketing URL: use `https://nexulexai.netlify.app/`. There is no `/support.html`.
- [ ] Redeploy `web/` to Netlify. The privacy, terms and delete-account pages in the repo differ from the live copies.
- [ ] Screenshots: only frames produced from the real build (`store/briefs`), with no Android UI, no "beta" and no other
      platforms.

## Notes to paste

```
NexuLex AI analyses contracts and legal documents that the user pastes, photographs or imports. It is an information
tool, not a law firm and not legal advice.

DEMO ACCOUNT (e-mail and password, already verified; no social login exists in this app)
  E-mail:   <DEMO_EMAIL>
  Password: <DEMO_PASSWORD>
The account has the Pro plan enabled so every feature can be reviewed.

HOW TO TEST
1. Sign in with the account above. A new account can also be created from the same screen.
2. Analyze tab: tap "Try a sample contract", or paste any contract text, then start the analysis.
3. The first time contract text would leave the device, an AI-processing consent screen appears. The user can accept
   or decline. Declining sends nothing, and consent can be withdrawn later under Settings.
4. Subscriptions are sold only with Apple in-app purchase (RevenueCat / StoreKit). There is no external payment, no
   web checkout and no Stripe. "Restore purchases" is on the paywall. Subscriptions are managed in
   iOS Settings > Apple ID > Subscriptions.
5. Account deletion: Settings > scroll to the bottom > "Delete account". It asks for confirmation, then deletes the
   account and the user's analyses and support messages immediately and signs the user out. No e-mail is needed.
6. Privacy Policy and Terms of Use are linked from Settings and from the paywall.

PERMISSIONS
- Photo library: the system photo picker opens only when the user chooses to import contract photos. Nothing is read
  in the background.
- Microphone and speech recognition: only when the user taps the voice button to ask a legal question by voice.
- Notifications (optional): reminders for deadlines the user sets.
- No location, contacts or tracking permission is requested.

The app supports 13 languages and works offline for saved items (history, reminders, calculators). AI analysis needs a
network connection.
```
