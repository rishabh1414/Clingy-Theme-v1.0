/* =========================================================
   CLINGY — Theme + CV Loader (App Theme only)
   - Runs ONLY when locationId changes (not on every route)
   - Global loader sits ABOVE GHL loader
   - Fetches 7 CVs + "App Theme"
   - Applies <html data-theme="..."> with fallback to yellow
   - Swaps agency logo (Light → Dark fallback)
   - Exposes window.locationCustomValues (uses appTheme)
   - Verbose console logs
   ========================================================= */
(function () {
  ("use strict");

  /* -------------------- CONFIG / LOGGING -------------------- */
  const DEBUG = true;
  const log = (...a) => DEBUG && console.log("[CLINGY]", ...a);
  const warn = (...a) => console.warn("[CLINGY]", ...a);
  const err = (...a) => console.error("[CLINGY]", ...a);

  const TOKEN_API =
    "https://apiv1.securebusinessautomation.com/api/auth/location-token";
  const GHL_BASE = "https://services.leadconnectorhq.com";

  // CV names in GHL
  const CUSTOM_VALUE_NAMES = {
    COLOR_1: "Agency Color 1",
    COLOR_2: "Agency Color 2",
    DARK_LOGO: "Agency Dark Logo",
    LIGHT_LOGO: "Agency Light Logo",
    AGENCY_NAME: "Agency Name",
    PHONE: "Agency Phone Number",
    SUPPORT_EMAIL: "Agency Support Email",
    APP_THEME: "App Theme", // <-- main theme CV
  };

  // Defaults
  const DEFAULTS = {
    color1: "#000000",
    color2: "#ffdf2b",
    darkLogo:
      "https://storage.googleapis.com/msgsndr/BkFiZbApZikznjlKBFX7/media/678e5c7caccdd164c283efb0.png",
    lightLogo:
      "https://storage.googleapis.com/msgsndr/BkFiZbApZikznjlKBFX7/media/678e5c7c38930748655f4002.png",
    name: "Clingy",
    phone: "(347) 682-4506",
    supportEmail: "supportsquad@clingy.app",
    theme: "yellow",
  };

  /* -------------------- THEMES (30+) -------------------- */
  const THEME_KEYS = [
    "yellow",
    "green",
    "red",
    "black",
    "white",
    "blue",
    "teal",
    "cyan",
    "sky",
    "indigo",
    "purple",
    "violet",
    "pink",
    "rose",
    "orange",
    "amber",
    "lime",
    "emerald",
    "fuchsia",
    "gray",
    "slate",
    "stone",
    "neutral",
    "zinc",
    "brown",
    "gold",
    "silver",
    "navy",
    "maroon",
    "olive",
    "aqua",
  ];

  const THEME_VARS = {
    yellow: {
      "--sb-bg": "#000000",
      "--interact-bg": "#facc15",
      "--interact-text": "#0a0a0a",
    },
    green: {
      "--sb-bg": "#0a1f14",
      "--interact-bg": "#22c55e",
      "--interact-text": "#ffffff",
    },
    red: {
      "--sb-bg": "#2a0a0a",
      "--interact-bg": "#ef4444",
      "--interact-text": "#ffffff",
    },
    blue: {
      "--sb-bg": "#0a1525",
      "--interact-bg": "#3b82f6",
      "--interact-text": "#ffffff",
    },
    teal: {
      "--sb-bg": "#0a1f1f",
      "--interact-bg": "#14b8a6",
      "--interact-text": "#ffffff",
    },
    cyan: {
      "--sb-bg": "#0a1f2a",
      "--interact-bg": "#06b6d4",
      "--interact-text": "#ffffff",
    },
    sky: {
      "--sb-bg": "#0a1a2a",
      "--interact-bg": "#38bdf8",
      "--interact-text": "#0a0a0a",
    },
    indigo: {
      "--sb-bg": "#151533",
      "--interact-bg": "#6366f1",
      "--interact-text": "#ffffff",
    },
    purple: {
      "--sb-bg": "#1a0f2d",
      "--interact-bg": "#a855f7",
      "--interact-text": "#ffffff",
    },
    violet: {
      "--sb-bg": "#1a1330",
      "--interact-bg": "#8b5cf6",
      "--interact-text": "#ffffff",
    },
    pink: {
      "--sb-bg": "#2a0f1f",
      "--interact-bg": "#ec4899",
      "--interact-text": "#ffffff",
    },
    rose: {
      "--sb-bg": "#2a0f18",
      "--interact-bg": "#f43f5e",
      "--interact-text": "#ffffff",
    },
    orange: {
      "--sb-bg": "#2a1205",
      "--interact-bg": "#f97316",
      "--interact-text": "#ffffff",
    },
    amber: {
      "--sb-bg": "#1f1505",
      "--interact-bg": "#f59e0b",
      "--interact-text": "#0a0a0a",
    },
    lime: {
      "--sb-bg": "#1a220a",
      "--interact-bg": "#84cc16",
      "--interact-text": "#0a0a0a",
    },
    emerald: {
      "--sb-bg": "#0a1f18",
      "--interact-bg": "#10b981",
      "--interact-text": "#ffffff",
    },
    fuchsia: {
      "--sb-bg": "#240a2a",
      "--interact-bg": "#d946ef",
      "--interact-text": "#ffffff",
    },
    gray: {
      "--sb-bg": "#0f0f0f",
      "--interact-bg": "#9ca3af",
      "--interact-text": "#ffffff",
    },
    slate: {
      "--sb-bg": "#0f172a",
      "--interact-bg": "#64748b",
      "--interact-text": "#ffffff",
    },
    stone: {
      "--sb-bg": "#1c1917",
      "--interact-bg": "#78716c",
      "--interact-text": "#ffffff",
    },
    neutral: {
      "--sb-bg": "#171717",
      "--interact-bg": "#737373",
      "--interact-text": "#ffffff",
    },
    zinc: {
      "--sb-bg": "#18181b",
      "--interact-bg": "#71717a",
      "--interact-text": "#ffffff",
    },
    brown: {
      "--sb-bg": "#1a0f0a",
      "--interact-bg": "#92400e",
      "--interact-text": "#ffffff",
    },
    gold: {
      "--sb-bg": "#1a1405",
      "--interact-bg": "#eab308",
      "--interact-text": "#0a0a0a",
    },
    silver: {
      "--sb-bg": "#1a1a1a",
      "--interact-bg": "#9ca3af",
      "--interact-text": "#000000",
    },
    navy: {
      "--sb-bg": "#0a1120",
      "--interact-bg": "#1e3a8a",
      "--interact-text": "#ffffff",
    },
    maroon: {
      "--sb-bg": "#1a0a0f",
      "--interact-bg": "#991b1b",
      "--interact-text": "#ffffff",
    },
    olive: {
      "--sb-bg": "#1a1f0a",
      "--interact-bg": "#4d7c0f",
      "--interact-text": "#ffffff",
    },
    aqua: {
      "--sb-bg": "#0a1f1f",
      "--interact-bg": "#06b6d4",
      "--interact-text": "#0a0a0a",
    },
  };

  /* -------------------- GLOBAL LOADER (TOPMOST) -------------------- */
  function ensureBody(cb) {
    if (document.body) return cb();
    const ro = new MutationObserver(() => {
      if (document.body) {
        ro.disconnect();
        cb();
      }
    });
    ro.observe(document.documentElement, { childList: true, subtree: true });
  }

  function showGlobalLoader() {
    if (document.getElementById("clingy-global-loader")) return;
    const create = () => {
      const el = document.createElement("div");
      el.id = "clingy-global-loader";
      el.style.cssText = `
        position: fixed; inset: 0;
        width: 100vw; height: 100vh;
        background: #F0FDFE;
        display: flex; align-items: center; justify-content: center;
        flex-direction: column;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, "Nunito", sans-serif;
        font-size: 2.2rem; font-weight: 800; letter-spacing: .4px;
        color: #000;
        z-index: 2147483647; /* above everything, incl. GHL loader */
        opacity: 1; transition: opacity 260ms ease;
        pointer-events: all;
      `;
      el.innerHTML = `<div>Loading....</div>`;
      document.body.insertBefore(el, document.body.firstChild || null);
      log("Global loader shown (prepended to body)");
    };
    ensureBody(create);
  }

  function hideGlobalLoader() {
    const el = document.getElementById("clingy-global-loader");
    if (!el) return;
    el.style.opacity = "0";
    setTimeout(() => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      log("Global loader hidden");
    }, 280);
  }

  /* -------------------- HELPERS -------------------- */
  const normalize = (s) => (s || "").toString().trim().toLowerCase();
  const safe = (v, fb) => (typeof v === "string" && v.trim() ? v.trim() : fb);

  function canonicalizeTheme(raw) {
    const v = (raw || "").toString().trim().toLowerCase();
    if (THEME_KEYS.includes(v)) return v;
    return DEFAULTS.theme; // fallback if theme not in list
  }

  function getLocationIdFromUrl() {
    try {
      const m = location.pathname.match(/\/location\/([A-Za-z0-9_\-]+)/);
      const id = m ? m[1] : null;
      log("getLocationIdFromUrl →", id, "| path:", location.pathname);
      return id;
    } catch (e) {
      err("getLocationIdFromUrl error:", e);
      return null;
    }
  }

  async function getLocationToken(locationId) {
    try {
      log("Fetching token for location:", locationId);
      const r = await fetch(TOKEN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId }),
      });
      log("Token status:", r.status);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      const token =
        j.accessToken || j.token || j.access_token || j.locationToken || null;
      log("Token present?", !!token);
      return token;
    } catch (e) {
      err("getLocationToken error:", e);
      return null;
    }
  }

  async function fetchCustomValues(locationId, token) {
    const endpoints = [
      `${GHL_BASE}/locations/${locationId}/customValues`,
      `${GHL_BASE}/locations/${locationId}/custom-values`,
      `${GHL_BASE}/locations/${locationId}/customFields`,
    ];
    for (const url of endpoints) {
      try {
        log("Trying CV endpoint:", url);
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            Version: "2021-07-28",
          },
        });
        log("CV endpoint status:", res.status);
        if (!res.ok) continue;
        const j = await res.json();
        const arr = Array.isArray(j) ? j : j.customValues || [];
        log(
          "CV payload (first 3):",
          Array.isArray(arr) ? arr.slice(0, 3) : arr
        );
        return arr;
      } catch (e) {
        warn("Endpoint failed", url, e?.message);
      }
    }
    return null;
  }

  function cvValue(cv) {
    const v = cv?.value ?? cv?.defaultValue ?? null;
    return typeof v === "string" && v.trim().length ? v : v ?? null;
  }

  function mapCvsByName(customValues) {
    if (!Array.isArray(customValues)) {
      warn("mapCvsByName: not an array");
      return null;
    }
    const out = {};
    for (const [key, displayName] of Object.entries(CUSTOM_VALUE_NAMES)) {
      const hit = customValues.find((cv) => {
        const n = normalize(cv?.name || cv?.key || cv?.fieldKey);
        return n === normalize(displayName);
      });
      out[key] = hit ? cvValue(hit) : null;
    }
    log("Mapped CVs:", out);
    return out;
  }

  function applyTheme(theme) {
    const html = document.documentElement;
    const before = html.getAttribute("data-theme");
    if (before !== theme) {
      html.setAttribute("data-theme", theme);
      log("Set <html data-theme>=", theme, "(was:", before, ")");
    } else {
      log("<html data-theme> already", theme);
    }
    const vars = THEME_VARS[theme] || THEME_VARS[DEFAULTS.theme];
    Object.entries(vars).forEach(([k, v]) => html.style.setProperty(k, v));
    log("Applied theme vars:", vars);
  }

  // Use dark first, then fall back to light
  // Use dark first, then fall back to light.
  // Pass current locationId so we can cache-bust per location.
  function applyAgencyLogo(darkLogo, lightLogo, locationId) {
    const dark = safe(darkLogo, null);
    const light = safe(lightLogo, null);
    const rawSrc = dark || light;
    if (!rawSrc) {
      warn("No logo URL found (dark/light)");
      return;
    }

    // Cache-bust by location so browser won't reuse previous location's image.
    const src =
      rawSrc +
      (rawSrc.includes("?") ? "&" : "?") +
      "v=" +
      encodeURIComponent(locationId || "");

    log("applyAgencyLogo → chosen URL:", src);

    const SELECTORS = [".agency-logo", "img.agency-logo", "[data-agency-logo]"];
    const TIMEOUT_MS = 15000; // watch longer; GHL can remount late
    const RETRY_EVERY_MS = 200;

    // Attach logo to all known targets
    const attach = () => {
      let count = 0;
      SELECTORS.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          if (el.tagName === "IMG") {
            // Always set; don't skip if equal
            el.src = src;
            if (el.srcset) el.removeAttribute("srcset");
            el.decoding = "async";
            el.loading = "eager";
          } else {
            el.style.backgroundImage = `url("${src}")`;
            el.style.backgroundSize = "contain";
            el.style.backgroundRepeat = "no-repeat";
            el.style.backgroundPosition = "center";
          }
          el.classList.add("logo-updated");
          count++;
        });
      });
      if (count > 0) log("Updated agency logo on", count, "element(s)");
      return count > 0;
    };

    // Try now
    let applied = attach();
    if (applied) return;

    // Retry for a while (DOM might not be ready yet)
    const started = Date.now();
    const iv = setInterval(() => {
      applied = attach();
      if (applied || Date.now() - started > TIMEOUT_MS) {
        clearInterval(iv);
        if (!applied) warn("Logo targets not found within retry window.");
      }
    }, RETRY_EVERY_MS);

    // Also watch for header mutations and re-attach when nodes appear
    try {
      const header = document.querySelector(".hl_header") || document.body;
      const mo = new MutationObserver(() => {
        if (attach()) {
          // Once we succeed due to remount, we can disconnect the observer
          mo.disconnect();
        }
      });
      mo.observe(header, { childList: true, subtree: true });
      // Safety: disconnect after TIMEOUT_MS to avoid leaking observers
      setTimeout(() => mo.disconnect(), TIMEOUT_MS);
    } catch (e) {
      // Non-fatal
    }
  }

  function exposeValues(finalValues) {
    const exposed = {
      agencyColor1: finalValues.color1,
      agencyColor2: finalValues.color2,
      agencyDarkLogo: finalValues.darkLogo,
      agencyLightLogo: finalValues.lightLogo,
      agencyName: finalValues.name,
      agencyPhoneNumber: finalValues.phone,
      agencySupportEmail: finalValues.supportEmail,
      appTheme: finalValues.appTheme, // <-- exposed as appTheme
    };
    window.locationCustomValues = exposed;
    window.dispatchEvent(
      new CustomEvent("customValuesLoaded", { detail: exposed })
    );
    log("Exposed window.locationCustomValues:", exposed);
  }

  /* -------------------- LOCATION-AWARE INIT -------------------- */
  let currentLocationId = null; // last applied locationId
  let initInFlight = false; // guard against overlaps

  async function initializeForLocation(locationId) {
    if (!locationId) {
      warn("initializeForLocation: no locationId; applying defaults");
      showGlobalLoader();
      try {
        const theme = DEFAULTS.theme;
        applyTheme(theme);
        applyAgencyLogo(DEFAULTS.lightLogo, DEFAULTS.darkLogo, locationId);
        exposeValues({
          color1: DEFAULTS.color1,
          color2: DEFAULTS.color2,
          darkLogo: DEFAULTS.darkLogo,
          lightLogo: DEFAULTS.lightLogo,
          name: DEFAULTS.name,
          phone: DEFAULTS.phone,
          supportEmail: DEFAULTS.supportEmail,
          appTheme: theme,
        });
      } finally {
        hideGlobalLoader();
      }
      return;
    }

    // Prevent redundant calls on same-location routes
    if (currentLocationId === locationId) {
      log("Same locationId detected (no re-init):", locationId);
      return;
    }
    if (initInFlight) {
      log("Init already in flight; skipping duplicate trigger");
      return;
    }

    initInFlight = true;
    showGlobalLoader();
    log("initializeForLocation START →", locationId);

    try {
      const token = await getLocationToken(locationId);
      if (!token) {
        warn("No token; using defaults");
        const theme = DEFAULTS.theme;
        applyTheme(theme);
        applyAgencyLogo(DEFAULTS.lightLogo, DEFAULTS.darkLogo, locationId);
        exposeValues({
          color1: DEFAULTS.color1,
          color2: DEFAULTS.color2,
          darkLogo: DEFAULTS.darkLogo,
          lightLogo: DEFAULTS.lightLogo,
          name: DEFAULTS.name,
          phone: DEFAULTS.phone,
          supportEmail: DEFAULTS.supportEmail,
          appTheme: theme,
        });
        currentLocationId = locationId;
        log("initializeForLocation END (defaults applied)");
        return;
      }

      const list = await fetchCustomValues(locationId, token);
      if (!list) {
        warn("No CV list; applying defaults");
        const theme = DEFAULTS.theme;
        applyTheme(theme);
        applyAgencyLogo(DEFAULTS.lightLogo, DEFAULTS.darkLogo, locationId);
        exposeValues({
          color1: DEFAULTS.color1,
          color2: DEFAULTS.color2,
          darkLogo: DEFAULTS.darkLogo,
          lightLogo: DEFAULTS.lightLogo,
          name: DEFAULTS.name,
          phone: DEFAULTS.phone,
          supportEmail: DEFAULTS.supportEmail,
          appTheme: theme,
        });
        currentLocationId = locationId;
        log("initializeForLocation END (defaults; no CVs)");
        return;
      }

      const mapped = mapCvsByName(list) || {};
      const finalValues = {
        color1: safe(mapped.COLOR_1, DEFAULTS.color1),
        color2: safe(mapped.COLOR_2, DEFAULTS.color2),
        darkLogo: safe(mapped.DARK_LOGO, DEFAULTS.darkLogo),
        lightLogo: safe(mapped.LIGHT_LOGO, DEFAULTS.lightLogo),
        name: safe(mapped.AGENCY_NAME, DEFAULTS.name),
        phone: safe(mapped.PHONE, DEFAULTS.phone),
        supportEmail: safe(mapped.SUPPORT_EMAIL, DEFAULTS.supportEmail),
        appTheme: safe(mapped.APP_THEME, DEFAULTS.theme), // <-- read "App Theme"
      };

      log("App Theme (raw):", finalValues.appTheme);
      const canon = canonicalizeTheme(finalValues.appTheme);
      log("App Theme (canonical):", canon);

      applyTheme(canon);
      applyAgencyLogo(finalValues.lightLogo, finalValues.darkLogo, locationId);
      exposeValues({ ...finalValues, appTheme: canon });

      currentLocationId = locationId; // mark as applied so we ignore same-location routes
      log(
        "initializeForLocation END → applied for location:",
        currentLocationId
      );
    } catch (e) {
      err("initializeForLocation error:", e);
    } finally {
      initInFlight = false;
      hideGlobalLoader();
    }
  }

  /* -------------------- BOOT + SPA HOOKS -------------------- */
  function boot() {
    const id = getLocationIdFromUrl();
    log("BOOT detected locationId:", id);
    // Run ASAP (don't wait for DOM—loader handles body-not-ready)
    initializeForLocation(id);
  }

  // Only trigger on *locationId* change
  function handleUrlChange() {
    const id = getLocationIdFromUrl();
    if (id !== currentLocationId) {
      log("Location change detected:", currentLocationId, "→", id);
      initializeForLocation(id);
    } else {
      log("Route change within same location; no re-init");
    }
  }

  // Hook SPA navigation
  (function hookSpa() {
    const p = history.pushState,
      r = history.replaceState;
    history.pushState = function () {
      const out = p.apply(this, arguments);
      handleUrlChange();
      return out;
    };
    history.replaceState = function () {
      const out = r.apply(this, arguments);
      handleUrlChange();
      return out;
    };
    addEventListener("popstate", handleUrlChange);
    log("SPA navigation hooks installed (location-aware)");
  })();

  // Visibility: log when others fire our event
  window.addEventListener("customValuesLoaded", (e) => {
    log(
      "customValuesLoaded event observed:",
      e.detail || window.locationCustomValues
    );
  });

  boot();
})();
