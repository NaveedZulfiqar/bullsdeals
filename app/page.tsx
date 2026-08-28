import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, FileCheck2, Handshake, ShieldCheck } from "lucide-react";

const services = [
  {
    icon: Handshake,
    title: "Deal coordination",
    text: "Keep brokerage transactions, commissions and agent details organized in one dependable place.",
  },
  {
    icon: FileCheck2,
    title: "Clear administration",
    text: "Give your team a consistent workflow for records, reporting and day-to-day brokerage operations.",
  },
  {
    icon: ShieldCheck,
    title: "Secure agent access",
    text: "Agents apply online, receive administrator approval and maintain their own professional profile.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#17213f]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Bulls Deals home">
          <Image src="/logo.png" alt="The Realty Bulls" width={150} height={54} className="h-11 w-auto object-contain" priority />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#17213f] transition hover:bg-white">
            Log in
          </Link>
          <Link href="/register" className="rounded-full bg-[#17213f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#25315a] sm:px-5">
            Register as agent
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[680px] w-full max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:py-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#c65f0c]">
            <Building2 className="h-4 w-4" /> Brokerage operations, simplified
          </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.045em] text-[#17213f] sm:text-6xl lg:text-7xl">
            More clarity behind every real estate deal.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Bulls Deals brings agents and brokerage administration together—so profiles, transactions and essential records stay accurate and easy to manage.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ef7516] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-[#dc670e]">
              Join as an agent <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-[#17213f] transition hover:border-slate-300 hover:shadow-sm">
              Access your account
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-orange-200/40 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white bg-[#17213f] p-8 shadow-2xl shadow-slate-300/60 sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-400">What we do</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">A better operating rhythm for modern brokerages.</h2>
            <p className="mt-5 leading-7 text-slate-300">
              From onboarding new agents to keeping brokerage information current, our portal helps the whole team work from the same trusted source.
            </p>
            <div className="mt-9 space-y-4">
              {services.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white"><Icon className="h-5 w-5" /></div>
                  <div><h3 className="font-bold text-white">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-300">{text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/80 px-5 py-7 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} The Realty Bulls. Brokerage operations with confidence.
      </footer>
    </main>
  );
}
