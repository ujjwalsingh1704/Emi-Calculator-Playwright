const { Given, When, Then, After, setDefaultTimeout } = require("@cucumber/cucumber");
const { chromium, expect } = require("@playwright/test");
const { EmiCalculatorPage } = require("../pages/EmiCalculatorPage.cjs");
setDefaultTimeout(20_000);

let browser;
let page;
let calculator;
let expectedEmi = 0;
Given("I open the EMI calculator", async function () {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
  calculator = new EmiCalculatorPage(page);
  await calculator.open();
});
When('I select the {string} tab', async function (name) { await calculator.selectTab(name); });
When("I set loan amount to {int} lakhs, interest rate to {float} percent, and tenure to {int} years", async function (amount, rate, years) {
  await calculator.setSlider("Loan Amount", amount);
  await calculator.setSlider("Interest Rate", rate);
  await calculator.setSlider("Loan Tenure", years);
  const principal = amount * 100_000; const monthlyRate = rate / 1200; const n = years * 12;
  expectedEmi = principal * monthlyRate * (1 + monthlyRate) ** n / ((1 + monthlyRate) ** n - 1);
});
Then("the monthly EMI should equal the independently calculated amount", async function () {
  const shown = await page.getByTestId("emi-value").innerText();
  expect(Math.abs(Number(shown.replace(/[^\d.]/g, "")) - expectedEmi)).toBeLessThanOrEqual(1);
});
Then("the pie chart should be visible with positive principal and interest values", async function () {
  await expect(calculator.chart("emi-pie-chart")).toBeVisible();
  expect(Number((await page.getByTestId("metric-principal-amount").innerText()).replace(/[^\d]/g, ""))).toBeGreaterThan(0);
  expect(Number((await page.getByTestId("metric-total-interest").innerText()).replace(/[^\d]/g, ""))).toBeGreaterThan(0);
});
Then("the EMI bar chart should be visible and contain data bars", async function () {
  const chart = calculator.chart("emi-bar-chart"); await expect(chart).toBeVisible();
  expect(await chart.locator("div[title^='Month']").count()).toBeGreaterThan(0);
});
When('I set the payment schedule start month to {string}', async function (month) { await calculator.setStartMonth(month); });
Then('the payment schedule start month should be {string}', async function (month) { await calculator.expectStartMonth(month); });

When("I set loan amount using the legacy nth child locator", async function () { await page.locator("main > div:nth-child(2) > section > div:nth-child(2) > input").fill("30"); });
When("I set interest using the obsolete label", async function () { await page.locator("text=Rate of Interest").fill("9"); });
Then("the legacy selector should locate the loan amount slider", async function () { await expect(page.locator("#missing-loan-range")).toBeVisible(); });
Then("the legacy selector should locate the interest rate slider", async function () { await expect(page.locator("#old-interest-range")).toBeVisible(); });
Then("the legacy selector should locate the historical chart container", async function () { await expect(page.locator("#chartContainer")).toBeVisible(); });
After(async function () { if (browser) await browser.close(); });
