function splitUrls(str) {
  return (str || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

module.exports = {
  ci: {
    collect: {
      url: splitUrls(process.env.LHCI_URLS),
      numberOfRuns: Number(process.env.LHCI_RUNS || 1),
      settings: {
        chromeFlags: ["--no-sandbox", "--disable-dev-shm-usage"],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "reports/lighthouse",
    },
  },
};
