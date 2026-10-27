"use client";

import { useMemo, useState } from "react";

type LoanTab = "Home Loan" | "Personal Loan";
const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

function calculate(principalLakhs: number, annualRate: number, years: number) {
  const principal = principalLakhs * 100_000;
  const months = years * 12;
  const monthlyRate = annualRate / 1200;
  const emi = monthlyRate === 0 ? principal / months : principal * monthlyRate * (1 + monthlyRate) ** months / ((1 + monthlyRate) ** months - 1);
  return { emi, total: emi * months, interest: emi * months - principal };
}

export default function HomePage() {
  const [tab, setTab] = useState<LoanTab>("Home Loan");
  const [amount, setAmount] = useState(25);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(10);
  const [startMonth, setStartMonth] = useState("2026-11");
  const result = useMemo(() => calculate(amount, rate, years), [amount, rate, years]);
  const months = years * 12;
  const principalPercent = Math.round((amount * 100_000 / result.total) * 100);

  function chooseTab(value: LoanTab) {
    setTab(value);
    if (value === "Personal Loan") { setAmount(10); setRate(12); setYears(5); }
    else { setAmount(25); setRate(10); setYears(10); }
  }

  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
    <header className="mb-9 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
      <div><p className="mb-2 text-sm font-semibold uppercase tracking-[.2em] text-teal-700">Money, made clear</p><h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">EMI Calculator</h1><p className="mt-2 text-slate-600">Plan your monthly payment and see the full repayment picture.</p></div>
      <div className="rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800">Updated for 2026</div>
    </header>
    <nav aria-label="Loan type" className="mb-6 flex gap-2">
      {(["Home Loan", "Personal Loan"] as LoanTab[]).map((name) => <button key={name} type="button" role="tab" aria-selected={tab === name} onClick={() => chooseTab(name)} className={`rounded-lg px-5 py-3 text-sm font-semibold ${tab === name ? "bg-teal-700 text-white shadow" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>{name}</button>)}
    </nav>
    <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
      <section aria-label="Loan inputs" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 text-xl font-bold text-slate-900">Loan details</h2>
        <InputSlider label="Loan Amount" id="loan-amount" value={amount} min={1} max={tab === "Home Loan" ? 100 : 50} step={1} suffix=" L" onChange={setAmount} />
        <InputSlider label="Interest Rate" id="interest-rate" value={rate} min={1} max={20} step={0.1} suffix="%" onChange={setRate} />
        <InputSlider label="Loan Tenure" id="loan-tenure" value={years} min={1} max={30} step={1} suffix=" Years" onChange={setYears} />
        <label htmlFor="start-month" className="mt-3 block text-sm font-medium text-slate-700">Schedule showing EMI payments starting from</label>
        <input id="start-month" aria-label="Schedule start month" type="month" value={startMonth} onChange={(event) => setStartMonth(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-100" />
      </section>
      <section aria-label="EMI report" className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-slate-300">Your monthly EMI</p><p data-testid="emi-value" className="mt-1 text-4xl font-bold tracking-tight">{money(result.emi)}</p></div><div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-teal-200">{tab} · {years} years</div></div>
        <div className="mt-7 grid grid-cols-2 gap-4"><Metric label="Principal amount" value={money(amount * 100_000)} /><Metric label="Total interest" value={money(result.interest)} /><Metric label="Total payment" value={money(result.total)} /><Metric label="Payments" value={`${months} months`} /></div>
        <div className="mt-8 grid items-center gap-6 sm:grid-cols-[180px_1fr]">
          <div role="img" aria-label={`EMI breakdown chart: ${principalPercent}% principal, ${100 - principalPercent}% interest`} data-testid="emi-pie-chart" className="relative mx-auto grid h-40 w-40 place-items-center rounded-full" style={{ background: `conic-gradient(#2dd4bf 0% ${principalPercent}%, #fbbf24 ${principalPercent}% 100%)` }}><div className="grid h-24 w-24 place-items-center rounded-full bg-slate-900 text-center"><span className="text-xs text-slate-300">Principal<br />vs interest</span></div></div>
          <div><h3 className="font-semibold">Payment breakdown</h3><p className="mt-1 text-sm text-slate-300">How your total repayment is split.</p><Legend color="bg-teal-400" label="Principal" value={money(amount * 100_000)} /><Legend color="bg-amber-400" label="Interest" value={money(result.interest)} /></div>
        </div>
        <div className="mt-7 border-t border-white/15 pt-5"><h3 className="mb-3 font-semibold">Balance over time</h3><div role="img" aria-label="Loan balance bar chart" data-testid="emi-bar-chart" className="flex h-24 items-end gap-1" title="Remaining principal by month">{Array.from({ length: Math.min(months, 36) }, (_, index) => { const fraction = 1 - (index + 1) / Math.min(months, 36); return <div key={index} title={`Month ${index + 1}: ${money(amount * 100_000 * fraction)}`} className="min-w-1 flex-1 rounded-t bg-teal-400/80 hover:bg-teal-300" style={{ height: `${Math.max(8, fraction * 100)}%` }} />; })}</div><p className="mt-2 text-xs text-slate-400">First {Math.min(months, 36)} payments · hover a bar for remaining principal</p></div>
      </section>
    </div>
    <footer className="mt-6 text-center text-xs text-slate-500">Illustrative estimates. Actual terms depend on your lender.</footer>
  </main>;
}

function InputSlider({ label, id, value, min, max, step, suffix, onChange }: { label: string; id: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (value: number) => void }) {
  return <div className="mb-6"><div className="mb-2 flex items-center justify-between"><label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label><span className="rounded-md bg-slate-100 px-3 py-1.5 font-semibold text-slate-900">{value}{suffix}</span></div><input id={id} aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full accent-teal-700" /><div className="flex justify-between text-xs text-slate-400"><span>{min}{suffix}</span><span>{max}{suffix}</span></div></div>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div data-testid={`metric-${label.toLowerCase().replace(/\s+/g, "-")}`} className="rounded-xl bg-white/5 p-3"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
function Legend({ color, label, value }: { color: string; label: string; value: string }) { return <div className="mt-3 flex items-center gap-2 text-sm"><span className={`h-2.5 w-2.5 rounded-full ${color}`} /><span className="flex-1 text-slate-300">{label}</span><span>{value}</span></div>; }
