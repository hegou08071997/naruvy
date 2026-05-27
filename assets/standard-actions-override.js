/**
 * Standard Actions Override for Dawn
 *
 * Minimal override that delegates cart mutations to the SFAPI default
 * handler. The default updateCart UI refresh path already understands Dawn:
 * it walks `getSectionsToRender()` on Dawn's cart custom elements, fetches
 * `/cart.js?sections=`, replaces innerHTML in place, and publishes
 * `cart-update` through Dawn's pubsub. Subscribers (cart drawer, quantity
 * controls, quick-add-bulk, …) update themselves.
 *
 * The only Dawn-specific behavior is `openCart`, which opens Dawn's
 * <cart-drawer> dialog when present, or navigates to /cart otherwise
 * (e.g. cart drawer disabled in theme settings, or already on the cart
 * page).
 */

function initializeOverrides() {
  const actions = window.Shopify?.actions;

  if (!actions) {
    return;
  }

  actions.openCart.configure({
    async handler() {
      const drawer = document.querySelector('cart-drawer');

      if (drawer && typeof drawer.open === 'function') {
        drawer.open();
      } else {
        window.location.href = window.routes?.cart_url || '/cart';
      }

      return {};
    },
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeOverrides, { once: true });
} else {
  initializeOverrides();
}
