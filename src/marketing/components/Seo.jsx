import { useEffect } from "react";

const BASE_URL = "https://neetforge.in";

function updateTag(selector, attrName, attrValue, content) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith("link") ? "link" : "meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute(selector.startsWith("link") ? "href" : "content", content);
}

export default function Seo({
  title,
  description,
  canonicalPath = "/",
  keywords,
  image = "https://neetforge.in/og-image.png",
  schema,
}) {
  useEffect(() => {
    const fullCanonical = `${BASE_URL}${canonicalPath === "/" ? "" : canonicalPath}`;
    
    document.title = title;

    updateTag('meta[name="description"]', "name", "description", description);
    if (keywords) {
      updateTag('meta[name="keywords"]', "name", "keywords", keywords);
    }
    updateTag('meta[name="robots"]', "name", "robots", "index, follow");

    updateTag('link[rel="canonical"]', "rel", "canonical", fullCanonical);

    updateTag('meta[property="og:title"]', "property", "og:title", title);
    updateTag('meta[property="og:description"]', "property", "og:description", description);
    updateTag('meta[property="og:url"]', "property", "og:url", fullCanonical);
    updateTag('meta[property="og:type"]', "property", "og:type", "website");
    updateTag('meta[property="og:image"]', "property", "og:image", image);

    updateTag('meta[name="twitter:title"]', "name", "twitter:title", title);
    updateTag('meta[name="twitter:description"]', "name", "twitter:description", description);
    updateTag('meta[name="twitter:image"]', "name", "twitter:image", image);

    if (schema) {
      let script = document.getElementById("route-schema-jsonld");
      if (!script) {
        script = document.createElement("script");
        script.id = "route-schema-jsonld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }

    return () => {
      const script = document.getElementById("route-schema-jsonld");
      if (script) script.remove();
    };
  }, [title, description, canonicalPath, keywords, image, schema]);

  return null;
}
