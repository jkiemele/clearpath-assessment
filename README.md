# CLEARPATH Operational Reality Assessment

A lightweight React intake app for collecting CLEARPATH Operational Reality Assessment responses and exporting them for GPT-assisted analysis.

## Run Locally

```bash
node server.js
```

Open:

```text
http://127.0.0.1:4173
```

## Google Sheets Submission

This app can submit completed intakes to a Google Sheet through a Google Apps Script web app.

1. Open the Google Sheet you want to receive responses.
2. Go to **Extensions > Apps Script**.
3. Paste the contents of `apps-script/Code.gs`.
4. Save the script.
5. Click **Deploy > New deployment**.
6. Choose **Web app**.
7. Set **Execute as** to **Me**.
8. Set **Who has access** to **Anyone** or **Anyone with the link**.
9. Deploy and copy the web app URL.
10. Paste that URL into `src/config.js` as `sheetsEndpoint`.

Example:

```js
window.CLEARPATH_CONFIG = {
  sheetsEndpoint: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
};
```

When deployed publicly, respondents can complete the assessment and click **Submit to Google Sheets**. The script creates or updates a `Responses` tab and appends one row per submission.

## Static Hosting

Because the app has no build step, you can host these files on Netlify, Vercel, GitHub Pages, Cloudflare Pages, or another static host:

- `index.html`
- `assets/`
- `src/`
- `vendor/`

`server.js` is only for local preview.

## Data Shape

Each submission includes:

- permanent `assessmentId` such as `CP-20260523-084131`
- `diagnosticPath`, including the optional `ai_readiness` pathway
- respondent name, organization, and email
- completion percentage
- one column per assessment prompt
- AI Readiness flat columns when the AI pathway is used
- AI amplification responses for speed, hidden stabilizers, trust-boundary risk, and leadership automation beliefs
- the full GPT-ready JSON payload in `fullPayloadJson`

When `diagnosticPath` is `ai_readiness`, the JSON also includes `aiReadiness` with answers, score, readiness state, triggered risk conditions, recommended CLEARPATH stage, and a 30-day readiness plan.
9. Deploy and copy the web app URL.
10. Paste that URL into `src/config.js` as `sheetsEndpoint`.

Example:

```js
window.CLEARPATH_CONFIG = {
  sheetsEndpoint: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
};
```

When deployed publicly, respondents can complete the assessment and click **Submit to Google Sheets**. The script creates or updates a `Responses` tab and appends one row per submission.

## Static Hosting

Because the app has no build step, you can host these files on Netlify, Vercel, GitHub Pages, Cloudflare Pages, or another static host:

- `index.html`
- `assets/`
- `src/`
- `vendor/`

`server.js` is only for local preview.

## Data Shape

Each submission includes:

- permanent `assessmentId` such as `CP-20260523-084131`
- `diagnosticPath`, including the optional `ai_readiness` pathway
- respondent name, organization, and email
- completion percentage
- one column per assessment prompt
- AI Readiness flat columns when the AI pathway is used
- the full GPT-ready JSON payload in `fullPayloadJson`

When `diagnosticPath` is `ai_readiness`, the JSON also includes `aiReadiness` with answers, score, readiness state, triggered risk conditions, recommended CLEARPATH stage, and a 30-day readiness plan.
