/* =======================
   CLINGY – Theme Loader (Company Theme → CSS via CDN, SPA-safe)
   ======================= */
(function () {
  "use strict";

  /* ===== CONFIG ===== */
  const DEBUG = true;
  const log = (...a) => DEBUG && console.log("[CLINGY]", ...a);
  const warn = (...a) => console.warn("[CLINGY]", ...a);
  const err = (...a) => console.error("[CLINGY]", ...a);

  // TODO: point this to your hosted CSS
  const CSS_CDN_URL =
    "https://cdn.jsdelivr.net/gh/rishabh1414/Clingy-Theme-v1.0@main/themeSwitcherv1.css";

  // Your existing endpoints
  const TOKEN_API =
    "https://apiv1.securebusinessautomation.com/api/auth/location-token";
  const GHL_BASE = "https://services.leadconnectorhq.com";

  // Custom Value to read for theme
  const COMPANY_THEME_NAME = "Company Theme"; // e.g. "team green", "Green", "team-yellow"

  // Default theme if missing/blank/unrecognized
  const DEFAULT_THEME = "yellow";

  // Map common user inputs → canonical theme keys
  const THEME_ALIASES = {
    green: ["green", "team green", "team-green", "theme green", "theme-green"],
    red: ["red", "team red", "team-red", "theme red", "theme-red"],
    black: [
      "black",
      "team black",
      "team-black",
      "theme black",
      "theme-black",
      "dark",
    ],
    white: [
      "white",
      "team white",
      "team-white",
      "theme white",
      "theme-white",
      "light",
    ],
    yellow: [
      "yellow",
      "team yellow",
      "team-yellow",
      "theme yellow",
      "theme-yellow",
      "amber",
      "gold",
    ],
  };

  /* ===== STATE ===== */
  let currentLocationId = null;
  let refreshInFlight = false;
  let currentTheme = null;

  /* ===== UTIL ===== */
  const debounce = (fn, wait = 150) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), wait);
    };
  };

  const normalize = (s) => (s || "").toString().trim().toLowerCase();

  const canonicalizeTheme = (raw) => {
    const v = normalize(raw);
    if (!v) return DEFAULT_THEME;
    for (const [canon, list] of Object.entries(THEME_ALIASES)) {
      if (list.includes(v)) return canon;
    }
    // Also accept a bare color word
    if (["yellow", "green", "red", "black", "white"].includes(v)) return v;
    return DEFAULT_THEME;
  };

  const getLocationIdFromUrl = () => {
    try {
      const m = location.pathname.match(/\/location\/([^/]+)/i);
      return m ? m[1] : null;
    } catch {
      return null;
    }
  };

  async function getLocationToken(locationId) {
    try {
      const r = await fetch(TOKEN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      return (
        j.accessToken || j.token || j.access_token || j.locationToken || null
      );
    } catch (e) {
      err("getLocationToken", e);
      return null;
    }
  }

  async function fetchCustomValues(locationId, token) {
    const urls = [
      `${GHL_BASE}/locations/${locationId}/customValues`,
      `${GHL_BASE}/locations/${locationId}/custom-values`,
      `${GHL_BASE}/locations/${locationId}/customFields`,
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Version: "2021-07-28",
          },
        });
        if (res.ok) return await res.json();
      } catch (e) {
        warn("CV endpoint failed", url, e?.message);
      }
    }
    return null;
  }

  function findCompanyTheme(cvPayload) {
    // Payload could be { customValues: [...] } or an array
    const list = Array.isArray(cvPayload)
      ? cvPayload
      : cvPayload?.customValues || [];
    if (!Array.isArray(list)) return null;

    // Try common shapes { name, value }, { key, value }, { fieldKey, defaultValue }
    const hit = list.find((cv) => {
      const name = cv?.name || cv?.key || cv?.fieldKey;
      return normalize(name) === normalize(COMPANY_THEME_NAME);
    });
    const value = hit ? hit.value ?? hit.defaultValue ?? "" : "";
    return value;
  }

  /* ===== CSS INJECTION ===== */
  function ensureCssLink(doc, href, id = "clingy-theme-css") {
    try {
      const d = doc || document;
      const existing = d.getElementById(id);
      if (existing && existing.href === href) return existing;
      if (existing && existing.href !== href)
        existing.parentNode.removeChild(existing);

      const link = d.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      d.head.appendChild(link);
      return link;
    } catch (e) {
      err("ensureCssLink", e);
      return null;
    }
  }

  function applyThemeToDoc(doc, theme) {
    try {
      const d = doc || document;
      if (d.documentElement.getAttribute("data-theme") !== theme) {
        d.documentElement.setAttribute("data-theme", theme);
      }
    } catch (e) {
      err("applyThemeToDoc", e);
    }
  }

  function applyToIframes(theme) {
    document.querySelectorAll("iframe").forEach((f) => {
      try {
        const idoc = f.contentDocument || f.contentWindow?.document;
        if (!idoc) return;
        ensureCssLink(idoc, CSS_CDN_URL);
        applyThemeToDoc(idoc, theme);
      } catch (e) {
        // Cross-origin iframes are not accessible; safe to ignore
      }
    });
  }

  /* ===== MAIN FLOW ===== */
  async function initializeForLocation(locationId) {
    try {
      if (!locationId) {
        warn("No locationId");
        return;
      }
      if (refreshInFlight) return;
      refreshInFlight = true;

      // Make sure CSS is present first
      ensureCssLink(document, CSS_CDN_URL);

      const token = await getLocationToken(locationId);
      let theme = DEFAULT_THEME;

      if (token) {
        const cv = await fetchCustomValues(locationId, token);
        const val = findCompanyTheme(cv);
        theme = canonicalizeTheme(val);
      } else {
        warn("No token; using default theme");
      }

      // Apply to main doc
      applyThemeToDoc(document, theme);
      // And to same-origin iframes
      applyToIframes(theme);

      if (currentTheme !== theme) {
        currentTheme = theme;
        log("Theme applied:", theme);
      }
    } catch (e) {
      err("initializeForLocation", e);
    } finally {
      refreshInFlight = false;
    }
  }

  function boot() {
    currentLocationId = getLocationIdFromUrl();
    ensureCssLink(document, CSS_CDN_URL);

    const run = () => initializeForLocation(currentLocationId);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run, { once: true });
    } else {
      run();
    }
  }

  const onUrlChange = debounce(() => {
    const id = getLocationIdFromUrl();
    if (id && id !== currentLocationId) {
      log("Location changed:", currentLocationId, "→", id);
      currentLocationId = id;
      initializeForLocation(currentLocationId);
    }
  }, 120);

  (function hookSpaNavigation() {
    const p = history.pushState,
      r = history.replaceState;
    history.pushState = function () {
      const o = p.apply(this, arguments);
      onUrlChange();
      return o;
    };
    history.replaceState = function () {
      const o = r.apply(this, arguments);
      onUrlChange();
      return o;
    };
    addEventListener("popstate", onUrlChange);
  })();

  // If DOM mutates (drawers/iframes appear), reapply CSS link + theme to iframes
  new MutationObserver(() => {
    if (currentTheme) applyToIframes(currentTheme);
  }).observe(document.documentElement, { childList: true, subtree: true });

  // GO
  boot();
})();
