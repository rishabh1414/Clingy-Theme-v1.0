/* =========================================================
   CLINGY — Theme + CV Loader
   - Runs ONLY when locationId changes (not on every route)
   - Global loader sits ABOVE GHL loader
   - Fetches 7 CVs + "Company Theme"
   - Applies <html data-theme="..."> with fallback to yellow
   - Swaps agency logo (Light → Dark fallback)
   - Exposes window.locationCustomValues
   - Verbose console logs
   ========================================================= */
(function () {
  "use strict";

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
    COMPANY_THEME: "Company Theme",
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
  const THEME_ALIASES = {
    yellow: [
      "yellow",
      "team yellow",
      "theme yellow",
      "golden",
      "amber",
      "theme-yellow",
      "team-yellow",
    ],
    green: [
      "green",
      "team green",
      "theme green",
      "forest",
      "emerald",
      "team-green",
      "theme-green",
    ],
    red: [
      "red",
      "team red",
      "theme red",
      "crimson",
      "rose",
      "team-red",
      "theme-red",
    ],
    black: ["black", "dark", "charcoal", "team-black", "theme-black"],
    white: ["white", "light", "ivory", "team-white", "theme-white"],
    blue: ["blue", "azure", "royal", "cobalt", "team-blue", "theme-blue"],
    teal: ["teal", "turquoise", "aqua teal", "team-teal", "theme-teal"],
    cyan: ["cyan", "light blue", "cyan blue", "team-cyan", "theme-cyan"],
    sky: ["sky", "sky blue", "light sky", "team-sky", "theme-sky"],
    indigo: ["indigo", "deep blue", "team-indigo", "theme-indigo"],
    purple: ["purple", "violet purple", "team-purple", "theme-purple"],
    violet: ["violet", "lavender", "team-violet", "theme-violet"],
    pink: ["pink", "hot pink", "magenta", "team-pink", "theme-pink"],
    rose: ["rose", "rosé", "team-rose", "theme-rose"],
    orange: ["orange", "burnt orange", "team-orange", "theme-orange"],
    amber: ["amber", "honey", "team-amber", "theme-amber"],
    lime: ["lime", "lime green", "team-lime", "theme-lime"],
    emerald: ["emerald", "emerald green", "team-emerald", "theme-emerald"],
    fuchsia: ["fuchsia", "bright pink", "team-fuchsia", "theme-fuchsia"],
    gray: ["gray", "grey", "team-gray", "theme-gray"],
    slate: ["slate", "slate gray", "team-slate", "theme-slate"],
    stone: ["stone", "stone gray", "team-stone", "theme-stone"],
    neutral: ["neutral", "neutral gray", "team-neutral", "theme-neutral"],
    zinc: ["zinc", "zinc gray", "team-zinc", "theme-zinc"],
    brown: ["brown", "chocolate", "coffee", "team-brown", "theme-brown"],
    gold: ["gold", "goldenrod", "team-gold", "theme-gold"],
    silver: ["silver", "platinum", "team-silver", "theme-silver"],
    navy: ["navy", "navy blue", "team-navy", "theme-navy"],
    maroon: ["maroon", "burgundy", "team-maroon", "theme-maroon"],
    olive: ["olive", "olive green", "team-olive", "theme-olive"],
    aqua: ["aqua", "aqua blue", "team-aqua", "theme-aqua"],
  };
  const THEME_VARS = {
    yellow: {
      "--sb-bg": "#000000",
      "--interact-bg": "#ffdf2b",
      "--interact-text": "#0a0a0a",
    },
    green: {
      "--sb-bg": "#0b1a12",
      "--interact-bg": "#15803d",
      "--interact-text": "#ffffff",
    },
    red: {
      "--sb-bg": "#19070a",
      "--interact-bg": "#dc2626",
      "--interact-text": "#ffffff",
    },
    black: {
      "--sb-bg": "#000000",
      "--interact-bg": "#444444",
      "--interact-text": "#ffffff",
    },
    white: {
      "--sb-bg": "#ffffff",
      "--interact-bg": "#111827",
      "--interact-text": "#ffffff",
    },
    blue: {
      "--sb-bg": "#0a1a2f",
      "--interact-bg": "#2563eb",
      "--interact-text": "#ffffff",
    },
    teal: {
      "--sb-bg": "#042f2e",
      "--interact-bg": "#14b8a6",
      "--interact-text": "#ffffff",
    },
    cyan: {
      "--sb-bg": "#083344",
      "--interact-bg": "#06b6d4",
      "--interact-text": "#ffffff",
    },
    sky: {
      "--sb-bg": "#0c4a6e",
      "--interact-bg": "#38bdf8",
      "--interact-text": "#0a0a0a",
    },
    indigo: {
      "--sb-bg": "#1e1b4b",
      "--interact-bg": "#4f46e5",
      "--interact-text": "#ffffff",
    },
    purple: {
      "--sb-bg": "#2e1065",
      "--interact-bg": "#9333ea",
      "--interact-text": "#ffffff",
    },
    violet: {
      "--sb-bg": "#312e81",
      "--interact-bg": "#7c3aed",
      "--interact-text": "#ffffff",
    },
    pink: {
      "--sb-bg": "#831843",
      "--interact-bg": "#ec4899",
      "--interact-text": "#ffffff",
    },
    rose: {
      "--sb-bg": "#881337",
      "--interact-bg": "#f43f5e",
      "--interact-text": "#ffffff",
    },
    orange: {
      "--sb-bg": "#431407",
      "--interact-bg": "#ea580c",
      "--interact-text": "#ffffff",
    },
    amber: {
      "--sb-bg": "#451a03",
      "--interact-bg": "#f59e0b",
      "--interact-text": "#0a0a0a",
    },
    lime: {
      "--sb-bg": "#1a2e05",
      "--interact-bg": "#84cc16",
      "--interact-text": "#0a0a0a",
    },
    emerald: {
      "--sb-bg": "#022c22",
      "--interact-bg": "#10b981",
      "--interact-text": "#ffffff",
    },
    fuchsia: {
      "--sb-bg": "#4a044e",
      "--interact-bg": "#d946ef",
      "--interact-text": "#ffffff",
    },
    gray: {
      "--sb-bg": "#111827",
      "--interact-bg": "#6b7280",
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
      "--sb-bg": "#3e2723",
      "--interact-bg": "#8d6e63",
      "--interact-text": "#ffffff",
    },
    gold: {
      "--sb-bg": "#3b2f1e",
      "--interact-bg": "#ffd700",
      "--interact-text": "#0a0a0a",
    },
    silver: {
      "--sb-bg": "#374151",
      "--interact-bg": "#9ca3af",
      "--interact-text": "#000000",
    },
    navy: {
      "--sb-bg": "#0a1128",
      "--interact-bg": "#1e3a8a",
      "--interact-text": "#ffffff",
    },
    maroon: {
      "--sb-bg": "#2c0a1e",
      "--interact-bg": "#800000",
      "--interact-text": "#ffffff",
    },
    olive: {
      "--sb-bg": "#1a2e05",
      "--interact-bg": "#808000",
      "--interact-text": "#ffffff",
    },
    aqua: {
      "--sb-bg": "#032b2b",
      "--interact-bg": "#00ffff",
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
        background: #cce7ff;
        display: flex; align-items: center; justify-content: center;
        flex-direction: column;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, "Nunito", sans-serif;
        font-size: 2.2rem; font-weight: 800; letter-spacing: .4px;
        color: #000;
        z-index: 2147483647; /* above everything, incl. GHL loader */
        opacity: 1; transition: opacity 260ms ease;
        pointer-events: all;
      `;
      el.innerHTML = `<div>Loading… Please wait</div>`;
      // PREPEND so it’s the FIRST child — guarantees top stacking context
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
    const v = normalize(raw);
    if (!v) return DEFAULTS.theme;
    for (const [canon, list] of Object.entries(THEME_ALIASES)) {
      if (list.includes(v)) return canon;
    }
    if (THEME_KEYS.includes(v)) return v;
    const compact = v.replace(/[^a-z]/g, "");
    for (const key of THEME_KEYS) {
      if (compact.includes(key)) return key;
    }
    return DEFAULTS.theme;
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
      out[key] = hit ? hit.value ?? hit.defaultValue ?? null : null;
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

  function applyAgencyLogo(lightLogo, darkLogo) {
    const src = safe(lightLogo, null) || safe(darkLogo, null);
    log("applyAgencyLogo → chosen URL:", src);
    if (!src) {
      warn("No logo URL found (light/dark)");
      return;
    }
    const nodes = document.querySelectorAll(
      ".agency-logo, img.agency-logo, [data-agency-logo]"
    );
    if (!nodes.length) {
      warn("No .agency-logo elements found");
      return;
    }
    nodes.forEach((el) => {
      if (el.tagName === "IMG") {
        if (el.src !== src) el.src = src;
      } else {
        el.style.backgroundImage = `url(${src})`;
        el.style.backgroundSize = "contain";
        el.style.backgroundRepeat = "no-repeat";
        el.style.backgroundPosition = "center";
      }
      el.classList.add("logo-updated");
    });
    log("Updated agency logo on", nodes.length, "element(s)");
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
      companyTheme: finalValues.companyTheme,
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
        applyAgencyLogo(DEFAULTS.lightLogo, DEFAULTS.darkLogo);
        exposeValues({
          color1: DEFAULTS.color1,
          color2: DEFAULTS.color2,
          darkLogo: DEFAULTS.darkLogo,
          lightLogo: DEFAULTS.lightLogo,
          name: DEFAULTS.name,
          phone: DEFAULTS.phone,
          supportEmail: DEFAULTS.supportEmail,
          companyTheme: theme,
        });
      } finally {
        hideGlobalLoader();
      }
      return;
    }

    // If this location is already applied, skip (prevents reloading on same-location routes)
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
        applyAgencyLogo(DEFAULTS.lightLogo, DEFAULTS.darkLogo);
        exposeValues({
          color1: DEFAULTS.color1,
          color2: DEFAULTS.color2,
          darkLogo: DEFAULTS.darkLogo,
          lightLogo: DEFAULTS.lightLogo,
          name: DEFAULTS.name,
          phone: DEFAULTS.phone,
          supportEmail: DEFAULTS.supportEmail,
          companyTheme: theme,
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
        applyAgencyLogo(DEFAULTS.lightLogo, DEFAULTS.darkLogo);
        exposeValues({
          color1: DEFAULTS.color1,
          color2: DEFAULTS.color2,
          darkLogo: DEFAULTS.darkLogo,
          lightLogo: DEFAULTS.lightLogo,
          name: DEFAULTS.name,
          phone: DEFAULTS.phone,
          supportEmail: DEFAULTS.supportEmail,
          companyTheme: theme,
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
        companyTheme: safe(mapped.COMPANY_THEME, DEFAULTS.theme),
      };

      log("Company Theme (raw):", finalValues.companyTheme);
      const canon = canonicalizeTheme(finalValues.companyTheme);
      log("Company Theme (canonical):", canon);

      applyTheme(canon);
      applyAgencyLogo(finalValues.lightLogo, finalValues.darkLogo);
      exposeValues({ ...finalValues, companyTheme: canon });

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
    // Run ASAP (don’t wait for DOM—loader handles body-not-ready)
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

  boot();
})();
