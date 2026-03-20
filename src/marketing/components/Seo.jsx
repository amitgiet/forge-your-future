import { useEffect } from "react";

const DEFAULT_SITE_NAME = "NEETFORGE";

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

export default function Seo({
  title,
  description,
  canonicalPath = "/",
  image = "/og-image.png",
  type = "website",
  schema,
}) {
  useEffect(() => {
    const origin = window.location.origin;
    const canonicalUrl = new URL(canonicalPath, origin).toString();
    const imageUrl = new URL(image, origin).toString();
    const previousTitle = document.title;
    const previousJsonLd = document.getElementById("seo-json-ld");

    document.title = title;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: "index, follow" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: DEFAULT_SITE_NAME });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
    upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });

    if (schema) {
      const script = document.createElement("script");
      script.id = "seo-json-ld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);

      if (previousJsonLd) {
        previousJsonLd.replaceWith(script);
      } else {
        document.head.appendChild(script);
      }
    }

    return () => {
      document.title = previousTitle;
      const currentJsonLd = document.getElementById("seo-json-ld");
      if (currentJsonLd) {
        currentJsonLd.remove();
      }
    };
  }, [canonicalPath, description, image, schema, title]);

  return null;
}
