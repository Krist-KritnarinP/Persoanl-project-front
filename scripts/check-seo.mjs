import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const html = await readFile("dist/index.html", "utf8");
assert.equal((html.match(/<h1>/g) || []).length, 1);
assert.ok(html.includes("ทริปที่ดี") && html.includes("แผนรายวัน"));
assert.ok(html.includes('href="/login"') && html.includes('id="sample"'));
assert.ok(!html.includes('href="https://example.com'));
for (const id of ["plan", "map", "nearby", "team", "chat", "bills", "weather", "overview", "share"]) {
  assert.ok(html.includes(`data-feature="${id}"`), `Missing prerendered feature: ${id}`);
  assert.ok(html.includes(`id="feature-${id}"`), `Missing feature heading: ${id}`);
}
assert.ok(html.includes("หารบิล") && html.includes("แชร์พิกัด") && html.includes("บันทึกอากาศ"));

const robots = await readFile("dist/robots.txt", "utf8");
const canonical = html.match(/rel="canonical" href="([^"]+)"/);
if (canonical) {
  assert.ok(html.includes('name="robots" content="index,follow"'));
  assert.ok(robots.includes(`Sitemap: ${canonical[1]}sitemap.xml`));
  const sitemap = await readFile("dist/sitemap.xml", "utf8");
  assert.ok(sitemap.includes(`<loc>${canonical[1]}</loc>`));
  assert.equal((sitemap.match(/<loc>/g) || []).length, 1);
} else {
  assert.ok(html.includes('name="robots" content="noindex,nofollow"'));
  assert.ok(robots.includes("Disallow: /\n"));
}
for (const route of ["login", "forgot-password", "reset-password"]) {
  const auth = await readFile(`dist/${route}/index.html`, "utf8");
  assert.ok(auth.includes('name="robots" content="noindex,nofollow"'));
  assert.ok(!auth.includes('rel="canonical"') && !auth.includes("<h1>"));
}
console.log(
  "PASS: static landing content, canonical/index policy, sitemap scope and noindex auth pages.",
);
