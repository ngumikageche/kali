const TRACKING_ID = "1b21b449-503c-495e-a82e-1975c390657f";
const TENANT_KEY = "007";
const API_ENDPOINT = "https://api.regisamtech.co.ke/api/track";
const TAXONOMY = {
  funnel_stages: ["awareness", "engaged", "product_intent", "checkout_intent", "converted"],
  conversion_events: ["purchase", "lead_submitted", "form_submitted", "contact_submitted", "demo_booked", "signup_completed", "subscription_started"],
  recommended_categories: ["navigation", "engagement", "commerce", "lead", "conversion"]
};

const SOCIAL_HOSTS = [
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "pinterest.com",
  "reddit.com",
  "t.co",
  "tiktok.com",
  "twitter.com",
  "whatsapp.com",
  "x.com",
  "youtube.com"
];

const SEARCH_HOSTS = [
  "baidu.com",
  "bing.com",
  "duckduckgo.com",
  "google.",
  "search.yahoo.com",
  "yahoo.com",
  "yandex."
];

const PAID_MEDIUMS = [
  "cpc",
  "cpm",
  "display",
  "paid",
  "paid-social",
  "ppc",
  "remarketing",
  "retargeting"
];

const state = {
  initialized: false,
  sessionId: "",
  visitorId: "",
  currentPageUrl: "",
  currentReferrer: null,
  pageStartTime: 0,
  maxScroll: 0,
  hasInteracted: false,
  lastExitKey: ""
};

export function initializeRegExAnalytics() {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.RegExAnalytics) {
    return window.RegExAnalytics;
  }

  state.sessionId = getOrCreateId("rx_session", 0.02);
  state.visitorId = getOrCreateId("rx_visitor", 365);

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("click", handleClick);
  document.addEventListener("submit", handleSubmit);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      trackExit({ reason: "visibilitychange" });
    }
  });
  window.addEventListener("pagehide", () => trackExit({ reason: "pagehide" }));

  state.initialized = true;

  const api = {
    trackingId: TRACKING_ID,
    sessionId: state.sessionId,
    visitorId: state.visitorId,
    taxonomy: TAXONOMY,
    trackPageview,
    trackEvent,
    markStage,
    trackConversion
  };

  window.RegExAnalytics = api;
  window.rxTrackConversion = (type, value) => {
    trackConversion(type, { value });
  };

  return api;
}

function getOrCreateId(key, ttlDays) {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      if (data?.id && data?.expires > Date.now()) {
        return data.id;
      }
    }
  } catch {
    return createVolatileId();
  }

  const id = createVolatileId();
  const expires = Date.now() + ttlDays * 24 * 60 * 60 * 1000;

  try {
    window.localStorage.setItem(key, JSON.stringify({ id, expires }));
  } catch {
    return id;
  }

  return id;
}

function createVolatileId() {
  return `rx_${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
}

function getUTM() {
  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content")
  };
}

function mergeExtra(currentExtra, nextExtra) {
  const base = currentExtra && typeof currentExtra === "object" ? currentExtra : {};
  const extra = nextExtra && typeof nextExtra === "object" ? nextExtra : {};

  return { ...base, ...extra };
}

function getTrafficSource(utm, referrer) {
  const medium = String(utm.utm_medium || "").toLowerCase();
  const source = String(utm.utm_source || "").toLowerCase();
  const referrerHost = readHostname(referrer);

  if (PAID_MEDIUMS.includes(medium) || ["adwords", "facebook_ads", "google_ads"].includes(source)) {
    return "paid";
  }

  if (medium === "social" || medium === "social-paid" || isHostMatch(referrerHost, SOCIAL_HOSTS)) {
    return "social";
  }

  if (medium === "organic" || isHostMatch(referrerHost, SEARCH_HOSTS)) {
    return "organic";
  }

  if (referrerHost && referrerHost !== window.location.hostname.toLowerCase()) {
    return "referral";
  }

  return "direct";
}

function readHostname(url) {
  if (!url) {
    return "";
  }

  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isHostMatch(hostname, patterns) {
  return patterns.some((pattern) => hostname.includes(pattern));
}

function basePayload(overrides = {}) {
  const utm = getUTM();
  const pageUrl = overrides.pageUrl || state.currentPageUrl || window.location.href;
  const referrer = overrides.referrer !== undefined ? overrides.referrer : state.currentReferrer;
  const trafficSource = getTrafficSource(utm, referrer);

  return {
    tracking_id: TRACKING_ID,
    tenant_key: TENANT_KEY,
    session_id: state.sessionId,
    visitor_id: state.visitorId,
    page_url: pageUrl,
    page_title: document.title,
    referrer: referrer || null,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_term: utm.utm_term,
    utm_content: utm.utm_content,
    traffic_source: trafficSource
  };
}

function send(endpoint, payload) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, new Blob([body], { type: "application/json" }));
    return;
  }

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => {});
}

function trackPageview(options = {}) {
  const nextPageUrl = window.location.href;
  const previousPageUrl = state.currentPageUrl;

  if (previousPageUrl === nextPageUrl && state.pageStartTime) {
    return;
  }

  const nextReferrer = options.referrer !== undefined
    ? options.referrer
    : previousPageUrl && previousPageUrl !== nextPageUrl
      ? previousPageUrl
      : document.referrer || null;

  if (previousPageUrl && previousPageUrl !== nextPageUrl) {
    trackExit({ pageUrl: previousPageUrl, referrer: state.currentReferrer, reason: "spa_navigation", nextPageUrl });
  }

  state.currentPageUrl = nextPageUrl;
  state.currentReferrer = nextReferrer;
  state.pageStartTime = Date.now();
  state.maxScroll = 0;
  state.hasInteracted = false;
  state.lastExitKey = "";

  send(API_ENDPOINT, Object.assign(basePayload(), {
    event_type: "pageview",
    event_name: "page_view",
    event_category: "navigation",
    funnel_stage: "awareness",
    extra: {
      taxonomy: {
        source: previousPageUrl && previousPageUrl !== nextPageUrl ? "spa_pageview" : "initial_pageview"
      }
    }
  }));
}

function trackEvent(name, options = {}) {
  send(API_ENDPOINT, Object.assign(basePayload(), {
    event_type: "event",
    event_name: name,
    event_category: options.category || options.event_category || "engagement",
    funnel_stage: options.funnel_stage || options.stage || null,
    conversion_event: options.conversion_event || null,
    conversion_value: options.value || null,
    extra: mergeExtra(options.extra, {
      label: options.label || null,
      source: options.source || "manual_event"
    })
  }));
}

function markStage(stage, options = {}) {
  trackEvent(options.event_name || `stage_${stage}`, {
    ...options,
    funnel_stage: stage,
    category: options.category || "conversion"
  });
}

function trackConversion(name, options = {}) {
  const payload = Object.assign(basePayload(), {
    event_type: "conversion",
    event_name: options.event_name || name,
    event_category: options.category || "conversion",
    funnel_stage: options.funnel_stage || "converted",
    conversion_event: name,
    conversion_type: name,
    conversion_value: options.value || null,
    is_conversion: true,
    extra: mergeExtra(options.extra, {
      label: options.label || null,
      source: options.source || "manual_conversion"
    })
  });

  send(API_ENDPOINT, payload);
  send(`${API_ENDPOINT}/update`, payload);
}

function readDatasetPayload(node) {
  if (!node?.dataset) {
    return null;
  }

  const payload = {
    category: node.dataset.rxCategory || null,
    label: node.dataset.rxLabel || null,
    value: node.dataset.rxValue ? Number(node.dataset.rxValue) : null
  };

  if (node.dataset.rxStage) {
    payload.funnel_stage = node.dataset.rxStage;
  }

  if (node.dataset.rxConversion) {
    payload.conversion_event = node.dataset.rxConversion;
  }

  return payload;
}

function handleScroll() {
  const height = Math.max(document.body.scrollHeight || 0, document.documentElement.scrollHeight || 0, 1);
  const scrollPct = Math.round(((window.scrollY + window.innerHeight) / height) * 100);
  state.maxScroll = Math.max(state.maxScroll, Math.min(scrollPct, 100));
  state.hasInteracted = true;
}

function handleClick(event) {
  state.hasInteracted = true;
  const target = event.target?.closest?.("[data-rx-event], [data-rx-stage], [data-rx-conversion]");

  if (!target) {
    return;
  }

  const payload = readDatasetPayload(target) || {};

  if (target.dataset.rxConversion) {
    trackConversion(target.dataset.rxConversion, payload);
    return;
  }

  if (target.dataset.rxStage) {
    markStage(target.dataset.rxStage, {
      ...payload,
      event_name: target.dataset.rxEvent || `stage_${target.dataset.rxStage}`
    });
    return;
  }

  if (target.dataset.rxEvent) {
    trackEvent(target.dataset.rxEvent, payload);
  }
}

function handleSubmit(event) {
  state.hasInteracted = true;
  const form = event.target;

  if (!form?.dataset) {
    return;
  }

  const payload = readDatasetPayload(form) || {};

  if (form.dataset.rxStage) {
    markStage(form.dataset.rxStage, {
      ...payload,
      event_name: form.dataset.rxEvent || `stage_${form.dataset.rxStage}`,
      source: "form_submit"
    });
  }

  if (form.dataset.rxConversion) {
    trackConversion(form.dataset.rxConversion, {
      ...payload,
      source: "form_submit"
    });
  }
}

function trackExit(options = {}) {
  const pageUrl = options.pageUrl || state.currentPageUrl || window.location.href;

  if (!pageUrl || !state.pageStartTime) {
    return;
  }

  const exitKey = `${pageUrl}|${state.pageStartTime}`;
  if (state.lastExitKey === exitKey) {
    return;
  }

  state.lastExitKey = exitKey;

  const timeOnPage = Math.round((Date.now() - state.pageStartTime) / 1000);
  const isBounce = !state.hasInteracted && timeOnPage < 30;

  send(`${API_ENDPOINT}/update`, {
    ...basePayload({ pageUrl, referrer: options.referrer }),
    time_on_page: timeOnPage,
    scroll_depth: state.maxScroll,
    is_bounce: isBounce,
    is_exit: true,
    event_name: "session_update",
    event_category: "engagement",
    funnel_stage: state.hasInteracted ? "engaged" : null,
    extra: {
      source: options.reason || "page_exit",
      next_page_url: options.nextPageUrl || null
    }
  });
}
