import { useEffect } from "react";

export default function useSEO({ title, description, keywords, canonical, jsonLd }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);

      if (!el) {
        el = document.createElement("meta");
        const [attrName, attrVal] = attr.split("=");
        el.setAttribute(attrName, attrVal.replace(/"/g, ""));
        document.head.appendChild(el);
      }

      el.setAttribute("content", value);
    };

    if (description) {
      setMeta('meta[name="description"]', "name=description", description);
      setMeta('meta[property="og:description"]', "property=og:description", description);
      setMeta('meta[name="twitter:description"]', "name=twitter:description", description);
    }

    if (keywords) {
      setMeta('meta[name="keywords"]', "name=keywords", keywords);
    }

    if (title) {
      setMeta('meta[property="og:title"]', "property=og:title", title);
      setMeta('meta[name="twitter:title"]', "name=twitter:title", title);
    }

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');

      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }

      link.href = canonical;
      setMeta('meta[property="og:url"]', "property=og:url", canonical);
    }

    document.querySelectorAll("script[data-page-jsonld]").forEach((script) => script.remove());

    if (jsonLd) {
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];

      schemas.forEach((schema) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-page-jsonld", "true");
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    return () => {
      document.querySelectorAll("script[data-page-jsonld]").forEach((script) => script.remove());
    };
  }, [title, description, keywords, canonical, jsonLd]);
}
