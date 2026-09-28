import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useLang } from "../i18n";
import { copy } from "../landing/copy";
const site = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, "");
export default function RouteSeo() {
  const { pathname } = useLocation();
  const { lang, t } = useLang();
  useEffect(() => {
    const c = copy[lang] || copy.th;
    const home = pathname === "/";
    document.title = home ? c.title : `AI LHOUNG — ${t("nav.tagline")}`;
    const meta = (key, value, property = false) => {
      const attr = property ? "property" : "name";
      let node = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!node) {
        node = document.createElement("meta");
        node.setAttribute(attr, key);
        document.head.appendChild(node);
      }
      node.content = value;
    };
    meta(
      "description",
      home ? c.description : `AI LHOUNG — ${t("nav.tagline")}`,
    );
    meta("robots", home && site ? "index,follow" : "noindex,nofollow");
    meta("og:title", document.title, true);
    meta(
      "og:description",
      home ? c.description : `AI LHOUNG — ${t("nav.tagline")}`,
      true,
    );
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (home && site) {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = `${site}/`;
    } else canonical?.remove();
    // Never expose private trip identifiers or password reset URLs in social metadata.
    const ogUrl = document.head.querySelector('meta[property="og:url"]');
    if (home && site) meta("og:url", `${site}/`, true);
    else ogUrl?.remove();
  }, [pathname, lang, t]);
  return <Outlet />;
}
