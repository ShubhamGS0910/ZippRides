/* ============================================================
   ZIPP RIDES — site behaviour
   Paste your deployed Google Apps Script Web App URL below.
   See SETUP.md for the 5-minute deployment steps.
   ============================================================ */

const SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

/** Sends form fields to the Google Sheet via the Apps Script web app. */
async function sendToSheet(dataObject) {
  const body = new URLSearchParams(dataObject);
  // no-cors: Apps Script web apps don't return CORS headers, so the response
  // body can't be read from the browser. We fire the request and treat the
  // absence of a thrown network error as success — this is the standard,
  // reliable pattern for Apps Script + static sites.
  await fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    body,
  });
}

function isConfigured() {
  return SCRIPT_URL && !SCRIPT_URL.includes("PASTE_YOUR");
}

function showStatus(el, message, type) {
  el.textContent = message;
  el.className = "form-status show " + type;
}

/* ---------------- Booking form (index.html) ---------------- */
function initBookingForm() {
  const form = document.getElementById("booking-form");
  if (!form) return;
  const status = document.getElementById("booking-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const required = ["customerName", "pickup", "drop", "pickupDateTime", "contact"];
    for (const name of required) {
      const field = form.elements[name];
      if (!field.value.trim()) {
        showStatus(status, "Please fill in \u201c" + field.dataset.label + "\u201d before booking.", "err");
        field.focus();
        return;
      }
    }
    const phone = form.elements["contact"].value.trim();
    if (!/^[0-9+\-\s]{7,15}$/.test(phone)) {
      showStatus(status, "Please enter a valid contact number.", "err");
      form.elements["contact"].focus();
      return;
    }

    const data = {
      formType: "booking",
      customerName: form.elements["customerName"].value.trim(),
      pickup: form.elements["pickup"].value.trim(),
      drop: form.elements["drop"].value.trim(),
      pickupDateTime: form.elements["pickupDateTime"].value,
      passengers: form.elements["passengers"].value,
      luggage: form.elements["luggage"].value,
      silentRide: form.elements["silentRide"].checked ? "Yes" : "No",
      acPref: form.elements["acPref"].value,
      luggageHelp: form.elements["luggageHelp"].checked ? "Yes" : "No",
      contact: phone,
    };

    if (!isConfigured()) {
      showStatus(
        status,
        "Almost there — connect your Google Sheet in script.js (SCRIPT_URL) to start receiving live bookings. See SETUP.md.",
        "err"
      );
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Booking...";
    try {
      await sendToSheet(data);
      showStatus(status, "\u2713 Trip request received. Our booking manager will confirm on WhatsApp/call shortly.", "ok");
      form.reset();
    } catch (err) {
      showStatus(status, "Something went wrong sending your request. Please call us directly.", "err");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Confirm Booking";
    }
  });
}

/* ---------------- Quick-book widget (hero) ---------------- */
function initQuickBook() {
  const quick = document.getElementById("quickbook-form");
  if (!quick) return;
  quick.addEventListener("submit", (e) => {
    e.preventDefault();
    const pickup = quick.elements["qPickup"].value.trim();
    const drop = quick.elements["qDrop"].value.trim();
    const when = quick.elements["qWhen"].value;

    const full = document.getElementById("booking-form");
    if (full) {
      if (pickup) full.elements["pickup"].value = pickup;
      if (drop) full.elements["drop"].value = drop;
      if (when) full.elements["pickupDateTime"].value = when;
      document.getElementById("book").scrollIntoView({ behavior: "smooth" });
      full.elements["customerName"].focus();
    }
  });
}

/* ---------------- Feedback form (feedback.html) ---------------- */
function initFeedbackForm() {
  const form = document.getElementById("feedback-form");
  if (!form) return;
  const status = document.getElementById("feedback-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  // Star rating interaction
  const starLabels = Array.from(document.querySelectorAll(".stars label"));
  starLabels.forEach((label) => {
    label.addEventListener("mouseenter", () => paintStars(label));
    label.addEventListener("click", () => paintStars(label, true));
  });
  document.querySelector(".stars")?.addEventListener("mouseleave", () => {
    const checked = document.querySelector('.stars input:checked');
    paintStars(checked ? checked.nextElementSibling : null);
  });
  function paintStars(uptoLabel) {
    let reached = !uptoLabel;
    starLabels.forEach((l) => (l.classList.remove("active")));
    for (const l of starLabels) {
      l.classList.add("active");
      if (l === uptoLabel) break;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const rating = form.querySelector('input[name="rating"]:checked');
    if (!rating) {
      showStatus(status, "Please choose a star rating.", "err");
      return;
    }

    const data = {
      formType: "feedback",
      rating: rating.value,
      driverBehavior: form.elements["driverBehavior"].value,
      cleanliness: form.elements["cleanliness"].value,
      safety: form.elements["safety"].value,
      improvement: form.elements["improvement"].value.trim(),
      recommend: form.elements["recommend"].value,
    };

    if (!isConfigured()) {
      showStatus(
        status,
        "Almost there — connect your Google Sheet in script.js (SCRIPT_URL) to start collecting feedback. See SETUP.md.",
        "err"
      );
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    try {
      await sendToSheet(data);
      showStatus(status, "\u2713 Thank you! Your feedback helps us improve every ride.", "ok");
      form.reset();
      starLabels.forEach((l) => l.classList.remove("active"));
    } catch (err) {
      showStatus(status, "Couldn't send your feedback right now. Please try again.", "err");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Feedback";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initBookingForm();
  initQuickBook();
  initFeedbackForm();
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
