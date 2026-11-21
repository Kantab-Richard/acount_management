# Journalit web workspace

A browser based trading journal that stores every edit on this device first. It can optionally sync a private copy to the user's own Google Drive through Google Apps Script.

## Offline use

Open the app once while online from its HTTPS deployment (or localhost). The service worker caches the app shell and the journal is stored in browser local storage, so it remains available offline on that same browser/device. Offline edits are queued and synced when the device is online again after Google sync has been connected.

## Google Apps Script sync setup

1. Sign into Google and create a new Apps Script project.
2. Add `apps-script/Code.gs` as `Code.gs` and `apps-script/Bridge.html` as an HTML file named `Bridge`.
3. In **Project Settings → Script properties**, add `JOURNALIT_ALLOWED_ORIGINS` with the exact app origin, for example `https://your-site.vercel.app`. For local development, add `http://127.0.0.1:4173` as another comma-separated origin. Only list sites you trust.
4. Deploy as a **Web app**, set **Execute as: User accessing the web app**, and allow users with Google accounts. Each user authorizes the script and gets a private spreadsheet created in their own Drive. The app uses that user's Apps Script properties to find their spreadsheet; it does not use a shared database or a developer-owned Google Sheet.
5. Copy the deployed web app URL ending in `/exec` into `web/apps-script-config.js`:

   ```js
   window.JOURNALIT_APPS_SCRIPT_CONFIG = {
     url: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
   };
   ```

6. Redeploy the web app after changing the Apps Script code or its allowed-origin setting. While signed into Google, open the deployed `/exec` URL in a normal browser tab once and approve the Google authorization prompt. Then open Journalit online, choose **Connect Google**, and choose whether to load an existing Drive journal or upload this device's journal.

The app does not upload local journal data merely because you open it. Google sync only starts after you choose Connect Google and authorize it. A successful first connection creates a private spreadsheet in your Google Drive. Google Apps Script and Sheets have usage quotas and are not a replacement for a managed production database.

## Deploy the web app

Import this repository into Vercel. The root `vercel.json` publishes the `web` folder. HTTPS hosting is required for installable offline app behavior.

## Features

- Home and performance dashboards, trade log, setup summaries, reviews, calendar, and session timer
- Trading accounts with user-defined risk rules and an illustrative 30-step growth scenario
- Position sizing estimate using broker details entered by the user
- CSV import and JSON backup/restore
- Offline local storage, app-shell caching, and queued Google Drive sync
- Responsive desktop and mobile layout

The growth ladder is an illustrative scenario, not a forecast or recommended return. Position size calculations are estimates and depend on accurate broker specifications, fees, and execution.
