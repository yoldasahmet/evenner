import Link from "next/link";
import { Button } from "@progress/kendo-react-buttons";
import Hero from "@/components/landing/Hero";
import AgendaSection from "@/components/landing/AgendaSection";
import RecsSection from "@/components/landing/RecsSection";
import FeatureGrid from "@/components/landing/FeatureGrid";

// Public landing page: animated tour of the attendee experience — live
// speech-to-text companion, AI-personalised agendas and post-event
// recommendations.
export default function LandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* transparent overlay nav — lives on top of the dark hero */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4">
          <span className="flex items-center gap-2.5 text-lg font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-400 text-sm shadow-lg shadow-brand-700/40">
              ⚡
            </span>
            evenner<span className="text-brand-500">.</span>
          </span>
          <nav className="hidden items-center gap-7 text-sm text-gray-300 sm:flex">
            <a href="#agenda" className="transition hover:text-white">
              Your agenda
            </a>
            <a href="#after" className="transition hover:text-white">
              After the event
            </a>
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
          </nav>
          <Link
            href="/login"
            className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur transition hover:border-white/40 hover:bg-white/20"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <div id="agenda">
          <AgendaSection />
        </div>
        <div id="after">
          <RecsSection />
        </div>
        <div id="features">
          <FeatureGrid />
        </div>

        {/* closing CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-20">
          <div className="bg-aurora animate-fade-up relative overflow-hidden rounded-3xl px-6 py-14 text-center text-white shadow-xl">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your next event deserves an evenn.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-brand-100 sm:text-base">
              Sign in, answer a few questions, and walk into the venue with a
              plan that was made for you.
            </p>
            <Link href="/login" className="mt-7 inline-block">
              <Button themeColor="light" size="large">
                Create my evenn →
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} evenner · MIT licensed
      </footer>
    </div>
  );
}
