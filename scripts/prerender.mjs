import { readFile, writeFile, mkdir } from "node:fs/promises";
import { loadEnv } from "vite";
import { renderLanding } from "../dist-ssr/prerender.js";
const configured = loadEnv(
  "production",
  process.cwd(),
  "VITE_",
).VITE_SITE_URL?.trim();
let site;
if (configured) {
  const url = new URL(configured);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    ["localhost", "127.0.0.1"].includes(url.hostname)
  )
    throw new Error(
      "VITE_SITE_URL must be a public HTTPS origin without a path",
    );
  site = url.origin;
}
const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
const source = await readFile("dist/index.html", "utf8");
let home = source.replace(
  '<div id="root"></div>',
  `<div id="root">${renderLanding()}</div>`,
);
if (site)
  home = home
    .replace(
      'name="robots" content="noindex,nofollow"',
      'name="robots" content="index,follow"',
    )
    .replace(
      "</head>",
      `<link rel="canonical" href="${escape(site)}/" /><meta property="og:url" content="${escape(site)}/" /></head>`,
    );
await writeFile("dist/index.html", home);
// These public auth URLs must never initially serve the indexable landing HTML.
for (const route of ["login", "forgot-password", "reset-password"]) {
  await mkdir(`dist/${route}`, { recursive: true });
  await writeFile(`dist/${route}/index.html`, source);
}
await writeFile(
  "dist/robots.txt",
  site
    ? `User-agent: *\nAllow: /$\nDisallow: /login\nDisallow: /forgot-password\nDisallow: /reset-password\nDisallow: /dashboard\nDisallow: /trips\nDisallow: /userprofile\nDisallow: /share\nSitemap: ${site}/sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n",
);
if (site)
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(site)}/</loc></url></urlset>`,
  );
console.log(
  `Landing HTML prerendered. ${site ? "Canonical, robots and sitemap generated." : "Indexing disabled until VITE_SITE_URL is configured."}`,
);
