const assert = require("node:assert/strict");
const { test } = require("node:test");
const { buildRepaymentSchedule, calculateEmi } = require("../../lib/emi.js");

function closeTo(actual, expected, tolerance = 0.005) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} to be within ${tolerance} of ${expected}`);
}

test("calculates the specified home-loan EMI examples", () => {
  closeTo(calculateEmi(25, 10, 10).emi, 33037.68422044048);
  closeTo(calculateEmi(50, 7.5, 15).emi, 46350.61800013655);
});

test("returns principal, total repayment, and interest consistently", () => {
  const result = calculateEmi(25, 10, 10);
  closeTo(result.total, result.emi * 120);
  closeTo(result.interest, result.total - 2_500_000);
  closeTo(result.total - result.interest, 2_500_000);
});

test("handles a zero-interest loan", () => {
  const result = calculateEmi(1, 0, 1);
  closeTo(result.emi, 100_000 / 12);
  closeTo(result.total, 100_000);
  closeTo(result.interest, 0);
});

test("builds the complete reducing-balance schedule and closes the balance", () => {
  const schedule = buildRepaymentSchedule(10, 12, 5, "2026-11");
  assert.equal(schedule.length, 60);
  assert.equal(schedule[0].date, "Nov 2026");
  closeTo(schedule[0].interest, 10_000);
  closeTo(schedule[0].principal, 12_244.447684901763);
  closeTo(schedule[0].balance, 987_755.5523150982);

  const totalPrincipal = schedule.reduce((sum, payment) => sum + payment.principal, 0);
  const totalInterest = schedule.reduce((sum, payment) => sum + payment.interest, 0);
  closeTo(totalPrincipal, 1_000_000, 0.0001);
  closeTo(totalInterest, calculateEmi(10, 12, 5).interest, 0.0001);
  assert.ok(schedule.at(-1).balance < 0.0001);
});

test("rolls schedule dates into the next year", () => {
  const schedule = buildRepaymentSchedule(1, 0, 1, "2026-12");
  assert.equal(schedule[0].date, "Dec 2026");
  assert.equal(schedule[1].date, "Jan 2027");
});

test("rejects invalid calculator inputs and malformed start months", () => {
  assert.throws(() => calculateEmi(0, 10, 1), RangeError);
  assert.throws(() => calculateEmi(1, -1, 1), RangeError);
  assert.throws(() => calculateEmi(1, 10, 0), RangeError);
  assert.throws(() => buildRepaymentSchedule(1, 10, 1, "2026-13"), RangeError);
});
