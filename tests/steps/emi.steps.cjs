const { Given, When, Then, After, setDefaultTimeout } = require("@cucumber/cucumber");
const { chromium, expect } = require("@playwright/test");
const { EmiCalculatorPage } = require("../pages/EmiCalculatorPage.cjs");
setDefaultTimeout(20_000);

let browser;
let page;
let calculator;
let expectedEmi = 0;
let expectedPrincipal = 0;
let expectedTotal = 0;
let expectedInterest = 0;
let expectedMonths = 0;
let expectedPrincipalPercent = 0;

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function setExpectedFigures(amountLakhs, annualRate, years) {
  expectedPrincipal = amountLakhs * 100_000;
  expectedMonths = years * 12;
  const monthlyRate = annualRate / 1200;
  expectedEmi = monthlyRate === 0
    ? expectedPrincipal / expectedMonths
    : expectedPrincipal * monthlyRate * (1 + monthlyRate) ** expectedMonths / ((1 + monthlyRate) ** expectedMonths - 1);
  expectedTotal = expectedEmi * expectedMonths;
  expectedInterest = expectedTotal - expectedPrincipal;
  expectedPrincipalPercent = Math.round(expectedPrincipal / expectedTotal * 100);
}

async function displayedMoney(testId) {
  const text = await page.getByTestId(testId).innerText();
  return Number(text.replace(/[^\d]/g, ""));
}

Given("I open the EMI calculator", async function () {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
  calculator = new EmiCalculatorPage(page);
  setExpectedFigures(25, 10, 10);
  await calculator.open();
  await expect(page.getByRole("heading", { name: "EMI Calculator" })).toBeVisible();
});
Then("the calculator dashboard should be visible", async function () {
  await expect(page.getByRole("region", { name: "Loan inputs" })).toBeVisible();
  await expect(page.getByRole("region", { name: "EMI report" })).toBeVisible();
});
When('I select the {string} tab', async function (name) {
  await calculator.selectTab(name);
  if (name === "Personal Loan") setExpectedFigures(10, 12, 5);
  else if (name === "Home Loan") setExpectedFigures(25, 10, 10);
});
When("I set loan amount to {int} lakhs, interest rate to {float} percent, and tenure to {int} years", async function (amount, rate, years) {
  await calculator.setSlider("Loan Amount", amount);
  await calculator.setSlider("Interest Rate", rate);
  await calculator.setSlider("Loan Tenure", years);
  setExpectedFigures(amount, rate, years);
});
Then("the monthly EMI should equal the independently calculated amount", async function () {
  const shown = await page.getByTestId("emi-value").innerText();
  expect(Math.abs(Number(shown.replace(/[^\d.]/g, "")) - expectedEmi)).toBeLessThanOrEqual(1);
});
Then("every repayment summary figure should match the independent calculation", async function () {
  expect(Math.abs(await displayedMoney("metric-principal-amount") - expectedPrincipal)).toBeLessThanOrEqual(1);
  expect(Math.abs(await displayedMoney("metric-total-interest") - expectedInterest)).toBeLessThanOrEqual(1);
  expect(Math.abs(await displayedMoney("metric-total-payment") - expectedTotal)).toBeLessThanOrEqual(1);
  await expect(page.getByTestId("metric-payments").locator("p").nth(1)).toHaveText(`${expectedMonths} months`);
});
Then("the pie chart should be visible with positive principal and interest values", async function () {
  await expect(calculator.chart("emi-pie-chart")).toBeVisible();
  expect(expectedPrincipal).toBeGreaterThan(0);
  expect(expectedInterest).toBeGreaterThan(0);
  await expect(calculator.chart("emi-pie-chart")).toHaveAttribute(
    "aria-label",
    `EMI breakdown chart: ${expectedPrincipalPercent}% principal, ${100 - expectedPrincipalPercent}% interest`
  );
});
Then("the schedule should have one row per payment", async function () {
  expect(await calculator.scheduleRows().count()).toBe(expectedMonths);
});
Then("the EMI bar chart should be visible and contain data bars", async function () {
  const chart = calculator.chart("emi-bar-chart"); await expect(chart).toBeVisible();
  expect(await calculator.bars().count()).toBe(36);
});
Then("the first bar tooltip should match the calculated remaining balance", async function () {
  const principal = 10 * 100_000;
  const monthlyRate = 12 / 1200;
  const months = 5 * 12;
  const emi = principal * monthlyRate * (1 + monthlyRate) ** months / ((1 + monthlyRate) ** months - 1);
  const balanceAfterFirstPayment = principal - (emi - principal * monthlyRate);
  const tooltip = await calculator.firstBarTooltip();
  expect(tooltip).toContain("Nov 2026");
  expect(tooltip).toContain(formatMoney(balanceAfterFirstPayment));
});
Then("the first installment figures should match independent calculations", async function () {
  const principal = 10 * 100_000;
  const monthlyRate = 12 / 1200;
  const interest = principal * monthlyRate;
  const principalPaid = expectedEmi - interest;
  const expected = [expectedEmi, principalPaid, interest, principal - principalPaid];
  const testIds = ["schedule-first-emi", "schedule-first-principal", "schedule-first-interest", "schedule-first-balance"];
  for (let index = 0; index < testIds.length; index += 1) {
    expect(Math.abs(await displayedMoney(testIds[index]) - expected[index])).toBeLessThanOrEqual(1);
  }
});
When('I set the payment schedule start month to {string}', async function (month) { await calculator.setStartMonth(month); });
Then('the payment schedule start month should be {string}', async function (month) { await calculator.expectStartMonth(month); });
Then('the first schedule payment date should be {string}', async function (date) { await calculator.expectFirstPaymentDate(date); });

When("I set loan amount using the legacy nth child locator", async function () { await page.locator("main > div:nth-child(2) > section > div:nth-child(2) > input").fill("30"); });
When("I set interest using the obsolete label", async function () { await page.locator("text=Rate of Interest").fill("9"); });
Then("the legacy selector should locate the loan amount slider", async function () { await expect(page.locator("#missing-loan-range")).toBeVisible(); });
Then("the legacy selector should locate the interest rate slider", async function () { await expect(page.locator("#old-interest-range")).toBeVisible(); });
Then("the legacy selector should locate the historical chart container", async function () { await expect(page.locator("#chartContainer")).toBeVisible(); });
After(async function () { if (browser) await browser.close(); });
