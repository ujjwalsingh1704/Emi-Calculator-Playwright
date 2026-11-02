/**
 * @typedef {{ number: number, date: string, payment: number, principal: number, interest: number, balance: number }} Repayment
 */

/** @param {number} principalLakhs @param {number} annualRate @param {number} years */
function validateInputs(principalLakhs, annualRate, years) {
  if (!Number.isFinite(principalLakhs) || principalLakhs <= 0) {
    throw new RangeError("Principal must be a positive finite number of lakh.");
  }
  if (!Number.isFinite(annualRate) || annualRate < 0) {
    throw new RangeError("Annual interest rate must be a non-negative finite number.");
  }
  if (!Number.isInteger(years) || years <= 0) {
    throw new RangeError("Loan term must be a positive whole number of years.");
  }
}

/**
 * Calculates an EMI for a reducing-balance loan.
 * @param {number} principalLakhs
 * @param {number} annualRate
 * @param {number} years
 * @returns {{ emi: number, total: number, interest: number }}
 */
function calculateEmi(principalLakhs, annualRate, years) {
  validateInputs(principalLakhs, annualRate, years);
  const principal = principalLakhs * 100_000;
  const months = years * 12;
  const monthlyRate = annualRate / 1200;
  const emi = monthlyRate === 0
    ? principal / months
    : principal * monthlyRate * (1 + monthlyRate) ** months / ((1 + monthlyRate) ** months - 1);
  const total = emi * months;
  return { emi, total, interest: total - principal };
}

/**
 * Builds the monthly reducing-balance repayment schedule.
 * @param {number} principalLakhs
 * @param {number} annualRate
 * @param {number} years
 * @param {string} startMonth YYYY-MM
 * @returns {Repayment[]}
 */
function buildRepaymentSchedule(principalLakhs, annualRate, years, startMonth) {
  validateInputs(principalLakhs, annualRate, years);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(startMonth)) {
    throw new RangeError("Schedule start month must use YYYY-MM format.");
  }

  const principal = principalLakhs * 100_000;
  const count = years * 12;
  const monthlyRate = annualRate / 1200;
  const payment = calculateEmi(principalLakhs, annualRate, years).emi;
  const [startYear, startMonthNumber] = startMonth.split("-").map(Number);
  let balance = principal;

  return Array.from({ length: count }, (_, index) => {
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(balance, payment - interest);
    balance = Math.max(0, balance - principalPaid);
    const date = new Date(Date.UTC(startYear, startMonthNumber - 1 + index, 1));
    return {
      number: index + 1,
      date: date.toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "UTC" }),
      payment: principalPaid + interest,
      principal: principalPaid,
      interest,
      balance
    };
  });
}

module.exports = { calculateEmi, buildRepaymentSchedule };
