const { expect } = require("@playwright/test");

class EmiCalculatorPage {
  constructor(page) { this.page = page; }
  async open() { await this.page.goto(process.env.APP_BASE_URL || "http://127.0.0.1:3000"); }
  tab(name) { return this.page.getByRole("tab", { name }); }
  slider(name) { return this.page.getByRole("slider", { name }); }
  chart(name) { return this.page.getByTestId(name); }
  async selectTab(name) { await this.tab(name).click(); }
  async setSlider(name, value) {
    const slider = this.slider(name);
    await slider.evaluate((element, nextValue) => {
      const input = element;
      const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      valueSetter.call(input, String(nextValue));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }, value);
  }
  async setStartMonth(value) { await this.page.getByLabel("Schedule start month").fill(value); }
  async expectStartMonth(value) { await expect(this.page.getByLabel("Schedule start month")).toHaveValue(value); }
}

module.exports = { EmiCalculatorPage };
