"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCompany } from "./actions";

const LANES = [
  { value: "neurotech", label: "Neurotech" },
  { value: "biotech", label: "Biotech" },
  { value: "defense", label: "Defense" },
  { value: "ai_ml", label: "AI / ML" },
  { value: "academic_lab", label: "Academic" },
];

export default function NewCompanyForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const result = await createCompany(formData);
    setSaving(false);
    if (result.success) {
      setOpen(false);
      router.push(`/companies/${result.id}`);
    } else {
      setError(result.error ?? "Failed to create company");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 shadow-orbital transition-colors hover:bg-cyan-200"
      >
        + Add Company
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">New Company</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-muted hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1">Name *</label>
            <input
              name="name"
              required
              className="w-full rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
              placeholder="Acme Neurotech"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Career Page URL *</label>
            <input
              name="careerPageUrl"
              required
              type="url"
              className="w-full rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Lane *</label>
            <select
              name="lane"
              required
              defaultValue="neurotech"
              className="w-full rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
            >
              {LANES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Priority (1 = top) *</label>
            <select
              name="priority"
              required
              defaultValue="3"
              className="w-full rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
            >
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Cycle Opens (month #)</label>
            <input
              name="cycleOpensMonth"
              type="number"
              min={1}
              max={12}
              className="w-full rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
              placeholder="e.g. 9 for Sep"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Cycle Closes (month #)</label>
            <input
              name="cycleClosesMonth"
              type="number"
              min={1}
              max={12}
              className="w-full rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
              placeholder="e.g. 12 for Dec"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1">Roles Hired (comma-separated) *</label>
          <input
            name="rolesHiredBs"
            required
            className="w-full rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
            placeholder="research intern, ML intern"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200 disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create Company"}
          </button>
        </div>
      </form>
    </div>
  );
}
