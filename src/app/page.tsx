import Link from "next/link";
import { Button } from "@progress/kendo-react-buttons";

// Public landing page. Intentionally minimal for now — the marketing
// content will grow here later.
export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <span className="text-lg font-bold text-brand-700">evenner</span>
        <Link href="/login">
          <Button themeColor="primary" size="small">
            Sign in
          </Button>
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Your agentic event planner
        </h1>
        <p className="mt-4 max-w-md text-base text-gray-500 sm:text-lg">
          Plan, organise and run memorable events with an AI agent that learns
          what you and your attendees need.
        </p>
        <Link href="/login" className="mt-8">
          <Button themeColor="primary" size="large">
            Get started
          </Button>
        </Link>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-4 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} evenner · MIT licensed
      </footer>
    </div>
  );
}
