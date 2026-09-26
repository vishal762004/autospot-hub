# Real visual assets

Auto Spot Hub does not download photos during `npm run dev`. This keeps development startup fast and avoids HTTP 429 rate-limit failures.

Run once on a machine with internet access:

```powershell
npm run prepare:assets
```

The preparation scripts download one real vehicle photograph per listing and the mapped real brand SVGs into `public/images/`. They use throttling and retry behavior and keep successful downloads when a source temporarily fails.

After preparation, use:

```powershell
npm run verify:local-assets
npm run dev
```

The UI prefers local assets. A missing local vehicle image may fall back to the same verified real source URL so a listing does not show generated artwork.
