/**
 * Standard Actions configuration for Dawn.
 *
 * Storefront Renderer injects the Shopify Standard Actions bundle
 * (`window.Shopify.actions.{updateCart,openCart,getCart,…}`) into every
 * page. The bundle ships with a built-in Dawn-aware refresh path that
 * works out of the box.
 *
 * This file replaces the built-in path with an explicit, in-theme
 * configuration. There are two reasons to do this:
 *
 *   1. Forks that change Dawn's cart contract — renaming custom
 *      elements, restructuring pubsub events, replacing
 *      getSectionsToRender, etc. — would silently break the built-in
 *      integration. Putting the wiring here keeps it visible and
 *      forkable.
 *
 *   2. The integration is now self-contained: anything you can read in
 *      this theme is what runs in the browser. There is no "magic"
 *      cart-refresh behavior happening elsewhere.
 *
 * If you remove this file, the built-in defaults take over.
 *
 * Configured actions:
 *   - openCart   — opens Dawn's <cart-drawer>; falls back to /cart.
 *   - updateCart — after the Storefront API mutation, fetches affected
 *     sections, morphs the DOM, and publishes `cart-update` so Dawn's
 *     existing pubsub subscribers (cart-items, quick-add-bulk,
 *     recipient-form, price-per-item, …) react.
 *
 * Other actions (getCart, etc.) use the default implementation.
 */

// Cart custom elements that advertise sections via getSectionsToRender().
const DAWN_CART_TAGS = ['cart-drawer', 'cart-items', 'cart-drawer-items', 'cart-notification'];

// Sections that Dawn's own pubsub subscribers refresh (cart.js's
// onCartUpdate fetches and replaces these directly when cart-update
// fires). We skip them here to avoid double-rendering. Format is
// '<element-tag>:<getSectionsToRender entry id>'.
const DAWN_PUBSUB_REFRESHED_SECTIONS = new Set([
  'cart-drawer:cart-drawer',
  'cart-drawer-items:CartDrawer',
  'cart-items:main-cart-items',
]);

// Walk every mounted Dawn cart custom element, collect the sections it
// wants rendered, and dedupe. Returns a Map keyed by section id, each
// entry pointing at the DOM mount and the selector used to extract the
// fresh fragment.
function collectCartSections() {
  const sections = new Map();

  for (const el of document.querySelectorAll(DAWN_CART_TAGS.join(','))) {
    let entries;
    try {
      entries = el.getSectionsToRender?.();
    } catch {
      continue;
    }

    const tag = el.tagName.toLowerCase();
    for (const entry of entries ?? []) {
      if (DAWN_PUBSUB_REFRESHED_SECTIONS.has(`${tag}:${entry.id}`)) continue;

      const sectionId = entry.section ?? entry.id;
      if (!sectionId || sections.has(sectionId)) continue;

      // Two patterns coexist in getSectionsToRender():
      //   - cart-items style: entry.section is the parent Liquid section
      //     id, entry.selector is a child node inside it.
      //   - cart-drawer / cart-notification style: entry.id IS the mount;
      //     there is no parent wrapper.
      const root = entry.section ? document.getElementById(entry.id) : document;
      if (!root) continue;

      const mount = entry.selector
        ? (root.querySelector(entry.selector) ?? (entry.section ? root : null))
        : document.getElementById(entry.id);
      if (!mount) continue;

      sections.set(sectionId, {
        mount,
        extractSelector: entry.selector || '.shopify-section',
      });
    }
  }

  return sections;
}

// After a Storefront API mutation, refresh every Dawn cart section
// that isn't already refreshed by Dawn's own pubsub subscribers, then
// publish 'cart-update' so the subscribers run.
async function refreshDawnCartUI() {
  const sections = collectCartSections();

  let cartData = null;
  if (sections.size > 0) {
    const url = `${routes.cart_url}.js?sections=${[...sections.keys()].join(',')}`;
    cartData = await fetch(url, { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    if (cartData?.sections) {
      for (const [id, { mount, extractSelector }] of sections) {
        const html = cartData.sections[id];
        if (!html) continue;
        const source = new DOMParser()
          .parseFromString(html, 'text/html')
          .querySelector(extractSelector);
        if (source) mount.replaceChildren(...source.childNodes);
      }
    }
  }

  // Hand off to Dawn's existing subscribers. cartData is the full
  // Cart Ajax payload (items, item_count, token, …) plus sections;
  // quick-add-bulk.js and price-per-item.js read it directly.
  const payload = { source: 'external-refresh' };
  if (cartData) payload.cartData = cartData;
  publish(PUB_SUB_EVENTS.cartUpdate, payload);
}

function initStandardActions() {
  const actions = window.Shopify?.actions;
  if (!actions) return;

  actions.openCart.configure({
    async handler() {
      const drawer = document.querySelector('cart-drawer');
      if (drawer && typeof drawer.open === 'function') {
        drawer.open();
      } else {
        window.location.href = routes?.cart_url || '/cart';
      }
      return {};
    },
  });

  actions.updateCart.configure({
    async handler(defaultHandler, ...args) {
      const result = await defaultHandler(...args);
      try {
        await refreshDawnCartUI();
      } catch (error) {
        console.error('[Dawn] Standard Actions cart refresh failed; reloading.', error);
        window.location.reload();
      }
      return result;
    },
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStandardActions, { once: true });
} else {
  initStandardActions();
}
