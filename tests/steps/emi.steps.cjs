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

When('I select the {string} tab', async function (name) {
  await calculator.selectTab(name);
});

When("I set loan amount to {int} lakhs, interest rate to {float} percent, and tenure to {int} years", async function (amount, rate, years) {
  await calculator.setSlider("Loan Amount", amount);
  await calculator.setSlider("Interest Rate", rate);
  await calculator.setSlider("Loan Tenure", years);
  const principal = amount * 100_000;
  const monthlyRate = rate / 1200;
  const n = years * 12;
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
  const chart = calculator.chart("emi-bar-chart");
  await expect(chart).toBeVisible();
  expect(await chart.locator("div[title^='Month']").count()).toBeGreaterThan(0);
});

When('I set the payment schedule start month to {string}', async function (month) {
  await calculator.setStartMonth(month);
});

Then('the payment schedule start month should be {string}', async function (month) {
  await calculator.expectStartMonth(month);
});

When('I set the {string} slider to {int}', async function (name, value) {
  await calculator.setSlider(name, value);
});

Then('the {string} slider should have value {string}', async function (name, value) {
  await expect(calculator.slider(name)).toHaveValue(value);
});

Then("the balance chart should be visible by its accessible name", async function () {
  await expect(page.getByRole("img", { name: "Loan balance bar chart" })).toBeVisible();
});

After(async function () {
  if (browser) {
    await browser.close();
    browser = undefined;
  }
});
