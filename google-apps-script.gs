/**
 * ZIPP RIDES — Google Sheets backend
 *
 * Paste this whole file into the Apps Script editor bound to your Google
 * Sheet (Extensions > Apps Script), then deploy as a Web App.
 * Full steps are in SETUP.md.
 *
 * Creates/uses two tabs in the active spreadsheet:
 *   - "Bookings"  (from the Book Your Ride form)
 *   - "Feedback"  (from the feedback / rating slip)
 */

const BOOKING_HEADERS = [
  'Timestamp', 'Customer Name', 'Pickup Location', 'Drop Destination',
  'Pickup Date & Time', 'Passengers', 'Luggage', 'Silent Ride',
  'AC Preference', 'Needs Luggage Help', 'Contact Number'
];

const FEEDBACK_HEADERS = [
  'Timestamp', 'Overall Rating', 'Driver Behavior', 'Car Cleanliness',
  'Safety & Driving', 'Improvement Suggestion', 'Would Recommend'
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const isFeedback = params.formType === 'feedback';
    const sheetName = isFeedback ? 'Feedback' : 'Bookings';
    const headers = isFeedback ? FEEDBACK_HEADERS : BOOKING_HEADERS;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const row = isFeedback
      ? [
          new Date(),
          params.rating || '',
          params.driverBehavior || '',
          params.cleanliness || '',
          params.safety || '',
          params.improvement || '',
          params.recommend || '',
        ]
      : [
          new Date(),
          params.customerName || '',
          params.pickup || '',
          params.drop || '',
          params.pickupDateTime || '',
          params.passengers || '',
          params.luggage || '',
          params.silentRide || '',
          params.acPref || '',
          params.luggageHelp || '',
          params.contact || '',
        ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Zipp Rides sheet API is live' }))
    .setMimeType(ContentService.MimeType.JSON);
}
