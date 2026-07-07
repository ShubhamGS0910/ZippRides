# Zipp Rides Website — Setup Guide

This is a static website (no server required) with two working forms —
**Book Your Ride** and **Feedback** — that both write straight into a
Google Sheet. Follow the two parts below in order.

---

## Part 1 — Connect Google Sheets (5 minutes)

1. Go to [sheets.google.com](https://sheets.google.com) and create a new
   spreadsheet. Name it something like **Zipp Rides Data**.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete any placeholder code, then paste in the entire contents of
   `google-apps-script.gs` (included in this folder).
4. Click the **Save** icon (or `Ctrl+S`).
5. Click **Deploy → New deployment**.
6. Click the gear icon next to "Select type" and choose **Web app**.
7. Fill in:
   - **Description**: `Zipp Rides forms`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
   (This last setting is important — it lets your public website submit
   data without visitors needing a Google login.)
8. Click **Deploy**. The first time, Google will ask you to authorize the
   script — click **Authorize access**, choose your Google account, then
   click **Advanced → Go to (project name)** and **Allow**.
9. Copy the **Web app URL** shown (it looks like
   `https://script.google.com/macros/s/AKfycb.../exec`).
10. Open `script.js` in this folder and replace this line:

    ```js
    const SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
    ```

    with your copied URL, e.g.:

    ```js
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbXXXXXXXX/exec";
    ```

11. Save the file.

That's it — the sheet will automatically grow two tabs, **Bookings** and
**Feedback**, with headers, the first time each form is submitted.

**If you ever edit the script later:** you must create a **new deployment
version** (Deploy → Manage deployments → pencil icon → New version) for
changes to go live, or the old code keeps running.

---

## Part 2 — Deploy to your domain

You have a domain already, so any static hosting works. Two easy, free
options:

### Option A — Netlify (drag and drop)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag this whole folder in.
3. Once it's live, go to **Site settings → Domain management → Add custom
   domain** and follow the DNS instructions (usually one CNAME record) to
   point your domain at it.

### Option B — Your existing hosting/cPanel
1. Upload `index.html`, `feedback.html`, `styles.css`, and `script.js` to
   your site's public folder (often called `public_html` or `www`).
2. Make sure `index.html` is set as the homepage.
3. You do **not** need to upload `google-apps-script.gs` or this
   `SETUP.md` — those two are only for your reference, not for the live
   site.

---

## Editing placeholder details

Before going live, search each HTML file for these and replace with your
real details:

- `+910000000000` — phone number (appears in the header booking button,
  the "Drive With Us" section, and the footer). Used for both `tel:` links
  and the WhatsApp link (`https://wa.me/91XXXXXXXXXX`).
- `book@zipprides.example` — contact email in the footer.

## Testing it works

1. Open `index.html` in a browser, fill out **Book Your Ride**, and
   submit.
2. Check your Google Sheet — a new **Bookings** tab should appear with
   your test row.
3. Repeat on `feedback.html` — a **Feedback** tab should appear.
4. If nothing shows up, double check the Web app's **Who has access** is
   set to **Anyone**, and that you copied the full `/exec` URL into
   `script.js`.
