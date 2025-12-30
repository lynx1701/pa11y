function parseUrls(value) {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

module.exports = {
  defaults: {
    timeout: 60000,
    concurrency: 2,
    chromeLaunchConfig: {
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    },
    reporters: [
      "cli",
      ["json", { fileName: "reports/pa11y/pa11y-report.json" }],
      ["pa11y-ci-reporter-html", { destination: "reports/pa11y/html" }],
    ],
  },

  // Populated at runtime from the workflow input
  urls: parseUrls(process.env.PA11Y_URLS),
};
