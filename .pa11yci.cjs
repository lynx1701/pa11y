function parseUrls(envValue) {
  return (envValue || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

module.exports = {
  defaults: {
    timeout: 60000,
    concurrency: 2,

    // These args help headless Chromium behave inside CI containers/runners
    chromeLaunchConfig: {
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    },

    // Produce BOTH JSON + HTML reports
    reporters: [
      "cli",
      ["json", { fileName: "reports/pa11y/pa11y-report.json" }],
      ["pa11y-ci-reporter-html", { destination: "reports/pa11y/html" }],
    ],
  },

  // When running mode=urls, PA11Y_URLS comes from the workflow input
  urls: parseUrls(process.env.PA11Y_URLS),
};
