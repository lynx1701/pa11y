import fs from "node:fs";

const file = process.argv[2] || "pa11y/pa11y-ci-results.json";
const raw = JSON.parse(fs.readFileSync(file, "utf8"));

const pages = Array.isArray(raw)
  ? raw
  : raw?.results
  ? Object.values(raw.results)
  : [];
const normIssues = (issues = []) =>
  issues.reduce(
    (acc, i) => {
      const t = (i.type || "").toLowerCase();
      if (t === "error") acc.errors++;
      else if (t === "warning") acc.warnings++;
      else acc.notices++;
      acc.total++;
      return acc;
    },
    { errors: 0, warnings: 0, notices: 0, total: 0 }
  );

let grand = { errors: 0, warnings: 0, notices: 0, total: 0 };
const rows = pages.map((p) => {
  const url = p.pageUrl || p.url || "unknown";
  const counts = normIssues(p.issues || []);
  grand.errors += counts.errors;
  grand.warnings += counts.warnings;
  grand.notices += counts.notices;
  grand.total += counts.total;
  return { url, ...counts };
});

console.log(`# ♿️ Pa11y CI Report`);
console.log(`**Pages:** ${rows.length}`);
console.log(
  `**Issues:** ${grand.total} (errors: ${grand.errors}, warnings: ${grand.warnings}, notices: ${grand.notices})`
);
console.log("");
console.log(`| URL | Errors | Warnings | Notices | Total |`);
console.log(`|---|---:|---:|---:|---:|`);
for (const r of rows) {
  console.log(
    `| ${r.url} | ${r.errors} | ${r.warnings} | ${r.notices} | ${r.total} |`
  );
}
