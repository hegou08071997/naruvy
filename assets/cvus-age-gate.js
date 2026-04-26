/**
 * CloudVaultUS — Age Gate Controller
 * File: assets/cvus-age-gate.js
 *
 * Logic:
 * - Shows a 21+ DOB modal on first visit
 * - Validates month/day/year → calculates exact age
 * - Stores verification in localStorage (30 days default, or session-only)
 * - Locks body scroll while gate is open
 * - Traps keyboard focus inside modal (accessibility)
 */

(function () {
  'use strict';

  /* ── CONFIG ─────────────────────────────────────────────── */
  const STORAGE_KEY   = 'cvus_age_verified';
  const DEFAULT_DAYS  = 30;   // How long to remember verification
  const MIN_AGE       = 21;   // Minimum age in years

  /* ── ELEMENTS ────────────────────────────────────────────── */
  const gate    = document.getElementById('cvus-age-gate');
  const form    = document.getElementById('cvus-ag-form');
  const errorEl = document.getElementById('cvus-ag-error');
  const monthEl = document.getElementById('cvus-ag-month');
  const dayEl   = document.getElementById('cvus-ag-day');
  const yearEl  = document.getElementById('cvus-ag-year');
  const remEl   = document.getElementById('cvus-ag-remember');

  if (!gate || !form) return; // Guard: elements must exist

  /* ── HELPERS ─────────────────────────────────────────────── */
  function isVerified() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const { expires } = JSON.parse(raw);
      return Date.now() < expires;
    } catch {
      return false;
    }
  }

  function storeVerification(remember) {
    const days    = remember ? DEFAULT_DAYS : 0;
    const expires = days > 0
      ? Date.now() + days * 24 * 60 * 60 * 1000
      : Date.now() + 30 * 60 * 1000; // session: 30 min
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ verified: true, expires }));
    } catch {
      // localStorage blocked (private mode) — allow anyway
    }
  }

  function calculateAge(month, day, year) {
    const today = new Date();
    const birth = new Date(year, month - 1, day);
    if (isNaN(birth.getTime())) return -1;

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
    errorEl.setAttribute('role', 'alert');
  }

  function clearError() {
    errorEl.hidden = true;
    errorEl.removeAttribute('role');
  }

  /* ── GATE OPEN / CLOSE ───────────────────────────────────── */
  function openGate() {
    gate.setAttribute('aria-hidden', 'false');
    gate.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    // Focus first interactive element
    setTimeout(() => monthEl && monthEl.focus(), 100);
    trapFocus(gate);
  }

  function closeGate() {
    gate.classList.remove('is-visible');
    gate.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    removeFocusTrap();
  }

  /* ── FOCUS TRAP (accessibility) ──────────────────────────── */
  let _focusHandler = null;

  function trapFocus(container) {
    const focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    _focusHandler = function (e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', _focusHandler);
  }

  function removeFocusTrap() {
    if (_focusHandler) {
      document.removeEventListener('keydown', _focusHandler);
      _focusHandler = null;
    }
  }

  /* ── FORM SUBMIT ─────────────────────────────────────────── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    const month = parseInt(monthEl.value, 10);
    const day   = parseInt(dayEl.value, 10);
    const year  = parseInt(yearEl.value, 10);

    // Basic completeness check
    if (!month || !day || !year || year < 1900 || year > new Date().getFullYear()) {
      showError('Please enter a valid date of birth.');
      return;
    }

    if (day < 1 || day > 31) {
      showError('Please enter a valid day (1–31).');
      return;
    }

    const age = calculateAge(month, day, year);

    if (age < 0) {
      showError('The date you entered is not valid. Please check and try again.');
      return;
    }

    if (age < MIN_AGE) {
      // Redirect to a neutral page — do not allow access
      window.location.href = 'https://www.google.com';
      return;
    }

    // ✅ Age verified
    storeVerification(remEl && remEl.checked);
    closeGate();
  });

  /* ── KEYBOARD ESCAPE ─────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    // Pressing Escape does NOT close the gate — intentional for compliance
    // Users must verify or click "Exit"
  });

  /* ── INIT ────────────────────────────────────────────────── */
  function init() {
    if (isVerified()) {
      // Already verified — keep gate hidden
      gate.remove(); // Remove from DOM entirely for clean page
      return;
    }
    // Not verified — show gate after tiny delay for page paint
    requestAnimationFrame(() => setTimeout(openGate, 150));
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
