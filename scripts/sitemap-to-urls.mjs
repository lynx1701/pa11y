import fs from "node:fs";
import { XMLParser } from "fast-xml-parser";

const args = Object.fromEntries(
  process.argv.slice(2).map((x) => {
    const [k, v] = x.split("=");
    return [k.replace(/^--/, ""), v ?? "true"];
  })
);

const sitemapUrl = args.sitemap;
const baseUrl = args.base; // optional: rewrite origin to this (ex: http://127.0.0.1:3000)
const outFile = args.out ?? "a11y-urls.txt";
const limit = args.limit ? Number(args.limit) : Infinity;
const include = args.include ? new RegExp(args.include) : null;
const exclude = args.exclude ? new RegExp(args.exclude) : null;

if (!sitemapUrl) {
  console.error("Missing --sitemap=<url>");
  process.exit(1);
}

const parser = new XMLParser({ ignoreAttributes: false });

async function fetchXml(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

function toArray(x) {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}

function rewrite(urlStr) {
  const u = new URL(urlStr);
  if (baseUrl) {
    const b = new URL(baseUrl);
    u.protocol = b.protocol;
    u.host = b.host;
  }
  return u.toString();
}

async function collectFromSitemap(url, seen = new Set()) {
  if (seen.has(url)) return [];
  seen.add(url);

  const xml = await fetchXml(url);
  const data = parser.parse(xml);

  // sitemap index
  if (data.sitemapindex?.sitemap) {
    const sitemaps = toArray(data.sitemapindex.sitemap)
      .map((s) => s.loc)
      .filter(Boolean);
    const nested = await Promise.all(
      sitemaps.map((u) => collectFromSitemap(u, seen))
    );
    return nested.flat();
  }

  // urlset
  const urls = toArray(data.urlset?.url)
    .map((u) => u.loc)
    .filter(Boolean);

  return urls;
}

const raw = await collectFromSitemap(sitemapUrl);

const normalized = Array.from(
  new Set(
    raw
      .map(rewrite)
      .filter((u) => (include ? include.test(u) : true))
      .filter((u) => (exclude ? !exclude.test(u) : true))
  )
).slice(0, limit);

fs.writeFileSync(outFile, normalized.join("\n") + "\n", "utf8");
console.log(`Wrote ${normalized.length} URLs -> ${outFile}`);
