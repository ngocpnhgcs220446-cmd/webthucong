export function initAnalytics() {
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const pixelId = import.meta.env.VITE_META_PIXEL_ID;

  if (gaId && gaId !== 'G-XXXXXXXXXX') {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId);
  }

  if (pixelId && pixelId !== '000000000000000') {
    window.fbq =
      window.fbq ||
      function fbq() {
        window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments);
      };
    window.fbq.queue = window.fbq.queue || [];
    window.fbq.loaded = true;
    window.fbq.version = '2.0';
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }
}

export function trackEvent(name, params = {}) {
  if (window.gtag) window.gtag('event', name, params);
  if (window.fbq) window.fbq('trackCustom', name, params);
}
