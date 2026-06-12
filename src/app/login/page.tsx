import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/components/auth/LoginForm";

// Auth entry point. If already signed in, skip straight into the app.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(searchParams.next ?? "/events");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <Link href="/" className="text-lg font-bold text-brand-700">
          evenner
        </Link>
        <h1 className="mt-4 text-xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sign in with LinkedIn or your email and password.
        </p>

        <div className="mt-6">
          <LoginForm next={searchParams.next} />
        </div>
      </div>

      <p className="mt-6 max-w-sm text-center text-xs text-gray-400">
        By continuing you agree to evenner&apos;s terms. We only request the
        LinkedIn data you approve.
      </p>

      <p className="mt-6 max-w-sm text-center text-xs text-orange-400">
        Organiser <br/>

username: admin@evenner.app password: Admin@1357
        <br/>
Attendee <br/>

username: yoldas.ahmet@hotmail.com password: Admin@1357
      </p>
    </div>
  );
}
