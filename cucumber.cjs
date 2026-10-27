module.exports = {
  default: {
    paths: ["features/**/*.feature"],
    require: ["tests/steps/**/*.cjs"],
    format: ["progress", "html:artifacts/ui-report.html"]
  }
};
