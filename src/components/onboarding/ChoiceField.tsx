"use client";

// Choice picker for onboarding questions. Single-select stores the chosen
// label; multi-select stores a comma-separated list and toggles chips.

function parseMulti(value: string): string[] {
  return value
    ? value.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
}

export default function ChoiceField({
  choices,
  multi,
  value,
  onChange,
}: {
  choices: string[];
  multi?: boolean;
  value: string;
  onChange: (val: string) => void;
}) {
  const selected = multi ? parseMulti(value) : [value];

  function toggle(choice: string) {
    if (!multi) {
      onChange(choice);
      return;
    }
    const next = selected.includes(choice)
      ? selected.filter((c) => c !== choice)
      : [...selected, choice];
    onChange(next.join(", "));
  }

  return (
    <div className={multi ? "flex flex-wrap gap-2" : "flex flex-col gap-2"}>
      {choices.map((choice) => {
        const active = selected.includes(choice);
        const base = multi
          ? "rounded-full px-4 py-2 text-sm"
          : "rounded-xl px-4 py-3 text-left text-sm";
        return (
          <button
            key={choice}
            type="button"
            onClick={() => toggle(choice)}
            className={`${base} border font-medium transition active:scale-[0.98] ${
              active
                ? "border-brand-600 bg-brand-50 text-brand-700 shadow-sm"
                : "border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:bg-brand-50/40"
            }`}
          >
            {multi && <span className="mr-1">{active ? "✓" : "+"}</span>}
            {choice}
          </button>
        );
      })}
    </div>
  );
}
