"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { updateOrganiserCompany } from "@/app/(app)/profile/actions";
import type { Profile } from "@/lib/types";

const SIZES = ["Just me", "2–10", "11–50", "51–200", "200+"];

// Editable company/organisation details shown on an organiser's profile.
export default function OrganiserCompanyCard({
  profile,
}: {
  profile: Profile;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [size, setSize] = useState(profile.company_size ?? SIZES[1]);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function action(formData: FormData) {
    formData.set("company_size", size);
    startTransition(async () => {
      const res = await updateOrganiserCompany(formData);
      if (!res.ok) {
        setError(res.error ?? "Something went wrong");
        setStatus("error");
        return;
      }
      setError(null);
      setStatus("saved");
      router.refresh();
    });
  }

  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-sm animate-fade-up delay-1">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-white">🏢 Company / organisation</h2>
        {status === "saved" && (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            Saved
          </span>
        )}
      </div>
      <p className="mb-4 text-sm text-slate-400">
        Shown to attendees on the events you organise.
      </p>

      <form action={action} className="flex flex-col gap-3">
        <Field label="Company / organisation name">
          <Input
            name="company_name"
            defaultValue={profile.company_name ?? ""}
            placeholder="e.g. Evenner Labs GmbH"
          />
        </Field>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Field label="Your role" className="flex-1">
            <Input
              name="company_role"
              defaultValue={profile.company_role ?? ""}
              placeholder="e.g. Head of Developer Relations"
            />
          </Field>
          <Field label="Team size" className="sm:w-40">
            <DropDownList
              data={SIZES}
              value={size}
              onChange={(e) => setSize(e.value)}
            />
          </Field>
        </div>
        <Field label="Website">
          <Input
            name="company_website"
            defaultValue={profile.company_website ?? ""}
            placeholder="https://your-organisation.com"
          />
        </Field>
        <Field label="About the organisation">
          <TextArea
            name="company_about"
            defaultValue={profile.company_about ?? ""}
            placeholder="What kind of events do you run, and for whom?"
            rows={3}
          />
        </Field>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button
          type="submit"
          themeColor="primary"
          disabled={pending}
          className="self-start"
        >
          {pending ? "Saving…" : "Save details"}
        </Button>
      </form>
    </section>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ""}`}>
      <span className="text-xs font-medium text-slate-400">{label}</span>
      {children}
    </label>
  );
}
