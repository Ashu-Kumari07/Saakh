# Saakh

**Cash income, finally provable.** A consent-first platform that turns a street vendor's daily sales, receipts and payments into verified income that lenders can trust.

This repository holds the **frontend prototype**: one responsive web app with a vendor side and a lender side.

## What it does

- **Vendor app:** log a sale by voice or text (item, quantity, price and total are extracted automatically), confirm it, and see it in a date-wise ledger that goes back to the day the vendor joined. Entries can be viewed, edited, added or deleted for any date.
- **Trust levels:** every entry carries one of five trust levels (payment-verified to self-reported). Editing a verified entry downgrades it to self-reported.
- **Consent and privacy:** vendors decide which lender sees their profile. Turning sharing off removes the vendor from the lender's list immediately.
- **Lender dashboard:** applications queue, income shown as a **range with a confidence level**, evidence mix, income cross-check across three sources, and fraud flags (duplicate receipts, round amounts, rate mismatches).
- **Separate roles:** vendor and lender pages are not reachable from each other.

## Run it

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Login is a demo: any input works. Pick "I'm a vendor" or "I'm a lender".
Voice input uses the browser's speech recognition (Chrome works best). You can also type the sentence.

## Project structure

```
index.html            page shell and script order
css/styles.css        design tokens (light and dark) and global styles
js/tailwind-config.js maps design tokens to Tailwind classes
js/utils.js           small helpers
js/ui.js              reusable components (card, badge, evidence bar, table, shell)
js/data.js            app state and mock data
js/ledger.js          date-wise ledger logic
js/pages.js           every screen
js/voice.js           voice parsing and entry flow
js/router.js          hash router with role guard (loads last)
```

## Important limitations

- **All data is synthetic.** No real vendor, UPI, GST or Aadhaar data is used.
- **No backend yet.** State lives in the browser and resets on refresh.
- **Role and consent checks run in the browser.** In production they must be enforced on the server.
- Receipt OCR and UPI matching are not built yet.
- Tailwind is loaded from the Play CDN (prototype only).

## Roadmap

1. Backend and database (vendors, entries, consents, audit log)
2. Real login (phone OTP for vendors, work email for lenders)
3. Receipt OCR and UPI statement matching to assign trust levels automatically
4. Account Aggregator and GST integrations
5. Server-side consent enforcement and audit trail

## Design

Pine green and marigold palette, Plus Jakarta Sans, designed in Google Stitch.
