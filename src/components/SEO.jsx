import { useEffect } from 'react';

export default function SEO({ title, description, image = '/og-image.svg' }) {
  useEffect(() => {
    document.title = title;
    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.includes('property=')) el.setAttribute('property', selector.match(/property="(.+?)"/)?.[1] || '');
        if (selector.includes('name=')) el.setAttribute('name', selector.match(/name="(.+?)"/)?.[1] || '');
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:image"]', 'content', image);
  }, [title, description, image]);
  return null;
}
