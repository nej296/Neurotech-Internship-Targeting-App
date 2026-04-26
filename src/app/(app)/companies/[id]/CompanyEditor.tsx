"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  updateCompanyField,
  deleteCompany,
  createApplication,
  deleteApplication,
} from "../actions";
import type { PrepChecklistItem, FitAnalysisResult } from "@/types";
import GapAnalyzer from "@/components/GapAnalyzer";

const LANES = [
  { value: "neurotech", label: "Neurotech" },
  { value: "biotech", label: "Biotech" },
  { value: "defense", label: "Defense" },
  { value: "ai_ml", label: "AI / ML" },
  { value: "academic_lab", label: "Academic" },
];

const STATUS_LABELS: Record<string, string> = {
  target: "Target",
  applied: "Applied",
  screen: "Screen",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
};

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface Application {
  id: string;
  roleTitle: string;
  roleUrl: string | null;
  jdText: string | null;
  status: string;
  appliedAt: Date | null;
  fitAnalysisJson: string | null;
}

interface CompanyEditorProps {
  company: {
    id: string;
    name: string;
    lane: string;
    priority: number;
    careerPageUrl: string;
    cycleOpensMonth: number | null;
    cycleClosesMonth: number | null;
    rolesHiredBs: string;
    notes: string | null;
    warmIntros: string | null;
    prepChecklistJson: string | null;
    whyMe: string | null;
    applications: Application[];
  };
}

function InlineField({
  label,
  value,
  field,
  companyId,
  type = "text",
  multiline = false,
  placeholder = "",
}: {
  label: string;
  value: string;
  field: string;
  companyId: string;
  type?: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  const [current, setCurrent] = useState(value);
  const [saving, setSaving] = useState(false);

  async function handleBlur() {
    if (current === value) return;
    setSaving(true);
    await updateCompanyField(companyId, field, current || null);
    setSaving(false);
  }

  const inputClass =
    "w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm transition-colors hover:border-border focus:border-accent focus:outline-none";

  return (
    <div>
      <label className="block text-xs text-muted mb-1 font-medium uppercase tracking-wide">
        {label}
        {saving && <span className="ml-2 text-accent">Saving…</span>}
      </label>
      {multiline ? (
        <textarea
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={4}
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </div>
  );
}

function PrepChecklist({
  companyId,
  initialJson,
}: {
  companyId: string;
  initialJson: string | null;
}) {
  const [items, setItems] = useState<PrepChecklistItem[]>(() => {
    try {
      return initialJson ? JSON.parse(initialJson) : [];
    } catch {
      return [];
    }
  });
  const [newItem, setNewItem] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function save(updated: PrepChecklistItem[]) {
    setItems(updated);
    await updateCompanyField(companyId, "prepChecklistJson", JSON.stringify(updated));
  }

  async function addItem() {
    if (!newItem.trim()) return;
    const updated = [...items, { item: newItem.trim(), done: false }];
    setNewItem("");
    await save(updated);
  }

  async function toggle(idx: number) {
    const updated = items.map((item, i) =>
      i === idx ? { ...item, done: !item.done } : item
    );
    await save(updated);
  }

  async function removeItem(idx: number) {
    const updated = items.filter((_, i) => i !== idx);
    await save(updated);
  }

  return (
    <div>
      <label className="block text-xs text-muted mb-2 font-medium uppercase tracking-wide">
        Prep Checklist
      </label>
      <div className="space-y-1 mb-2">
        {items.length === 0 && (
          <p className="text-xs text-muted italic">No items yet.</p>
        )}
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 group">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggle(idx)}
              className="mt-0.5 accent-accent"
            />
            <span
              className={`flex-1 text-sm ${
                item.done ? "line-through text-muted" : ""
              }`}
            >
              {item.item}
            </span>
            <button
              onClick={() => removeItem(idx)}
              className="text-xs text-muted opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Add item…"
          className="flex-1 rounded border border-border px-2 py-1 text-xs focus:border-accent focus:outline-none"
        />
        <button
          onClick={addItem}
          className="rounded-full border border-white/10 px-3 py-1 text-xs transition-colors hover:border-cyan-300/60"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function WhyMeSection({
  companyId,
  initial,
}: {
  companyId: string;
  initial: string | null;
}) {
  const [text, setText] = useState(initial ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setText(data.whyMe);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-muted font-medium uppercase tracking-wide">
          Why Me
        </label>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-200 disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>
      {loading && (
        <p className="text-xs text-muted italic mb-2">
          Calling Claude, this may take 10–15s…
        </p>
      )}
      {error && <p className="mb-2 text-xs text-red-300">{error}</p>}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={async () => {
          await updateCompanyField(companyId, "whyMe", text || null);
        }}
        rows={5}
        placeholder="Click Generate to create a targeted pitch, or write your own."
        className="w-full resize-none rounded border border-border px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
      />
    </div>
  );
}

function ApplicationCard({
  app,
  companyId,
  onDelete,
}: {
  app: Application;
  companyId: string;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [jd, setJd] = useState(app.jdText ?? "");
  const [analyzing, setAnalyzing] = useState(false);
  const [fitData, setFitData] = useState<FitAnalysisResult | null>(() => {
    try {
      return app.fitAnalysisJson ? JSON.parse(app.fitAnalysisJson) : null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!jd.trim()) {
      setError("Paste a job description first.");
      return;
    }
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch("/api/analyze-fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          applicationId: app.id,
          jdText: jd,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setFitData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setAnalyzing(false);
    }
  }

  const statusBg =
    app.status === "offer"
      ? "#dcfce7"
      : app.status === "rejected" || app.status === "ghosted"
      ? "#fee2e2"
      : app.status === "interview"
      ? "#dbeafe"
      : "#f3f4f6";
  const statusColor =
    app.status === "offer"
      ? "#166534"
      : app.status === "rejected" || app.status === "ghosted"
      ? "#991b1b"
      : app.status === "interview"
      ? "#1e40af"
      : "#374151";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      {/* Summary row */}
      <div
        className="group flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-cyan-300/5"
        onClick={() => setExpanded((v) => !v)}
      >
        <span
          className="text-xs px-2 py-0.5 rounded font-medium shrink-0"
          style={{ background: statusBg, color: statusColor }}
        >
          {STATUS_LABELS[app.status] ?? app.status}
        </span>

        <span className="flex-1 truncate text-sm font-medium text-white">
          {app.roleTitle}
        </span>

        {fitData && (
          <span className="text-xs font-semibold tabular-nums text-muted shrink-0">
            {fitData.fitScore}/100
          </span>
        )}

        {app.appliedAt && (
          <span className="text-xs text-muted tabular-nums shrink-0">
            {new Date(app.appliedAt).toLocaleDateString()}
          </span>
        )}

        <span className="text-xs text-muted shrink-0">
          {expanded ? "▲" : "▼"}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(app.id);
          }}
          className="shrink-0 text-xs text-muted opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"
        >
          ×
        </button>
      </div>

      {/* Expanded: JD + Analyze Fit */}
      {expanded && (
        <div className="space-y-4 border-t border-white/10 bg-black/20 px-4 py-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted">
                Job Description
              </label>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !jd.trim()}
                className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-200 disabled:opacity-50"
              >
                {analyzing ? "Analyzing…" : "Analyze Fit"}
              </button>
            </div>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              rows={8}
              placeholder="Paste the full job description here, then click Analyze Fit."
              className="w-full resize-y rounded border border-border px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none"
            />
            {analyzing && (
              <p className="text-xs text-muted italic mt-1">
                Running analysis with Claude — this takes 10–15 seconds…
              </p>
            )}
            {error && (
              <p className="mt-1 text-xs text-red-300">{error}</p>
            )}
          </div>

          {/* Fit analysis results */}
          {fitData && (
            <div className="border-t border-white/10 pt-4">
              <GapAnalyzer data={fitData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ApplicationsSection({
  companyId,
  applications,
}: {
  companyId: string;
  applications: Application[];
}) {
  const [role, setRole] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!role.trim()) return;
    setSaving(true);
    await createApplication(companyId, role.trim(), url.trim() || undefined);
    setRole("");
    setUrl("");
    setAdding(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this application?")) return;
    await deleteApplication(id, companyId);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs text-muted font-medium uppercase tracking-wide">
          Applications ({applications.length})
        </label>
        <button
          onClick={() => setAdding((v) => !v)}
          className="rounded-full border border-white/10 px-3 py-1 text-xs transition-colors hover:border-cyan-300/60"
        >
          {adding ? "Cancel" : "+ Add"}
        </button>
      </div>

      {adding && (
        <div className="mb-3 space-y-2 rounded-2xl border border-white/10 bg-black/20 p-3">
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role title *"
            className="w-full rounded border border-border px-2 py-1 text-sm focus:border-accent focus:outline-none"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Job posting URL (optional)"
            className="w-full rounded border border-border px-2 py-1 text-sm focus:border-accent focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleAdd}
              disabled={saving || !role.trim()}
              className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-200 disabled:opacity-50"
            >
              {saving ? "Adding…" : "Add Application"}
            </button>
          </div>
        </div>
      )}

      {applications.length === 0 && !adding && (
        <p className="text-xs text-muted italic">No applications yet.</p>
      )}

      <div className="space-y-2">
        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            app={app}
            companyId={companyId}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default function CompanyEditor({ company }: CompanyEditorProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete ${company.name}? This cannot be undone.`)) return;
    setDeleting(true);
    await deleteCompany(company.id);
    router.push("/companies");
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-surface p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <input
            defaultValue={company.name}
            onBlur={async (e) => {
              await updateCompanyField(company.id, "name", e.target.value);
            }}
            className="-ml-1 w-full rounded border border-transparent bg-transparent px-1 text-3xl font-semibold tracking-tight text-white transition-colors hover:border-border focus:border-accent focus:outline-none"
          />
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="ml-4 shrink-0 text-xs text-muted transition-colors hover:text-red-300 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: main fields */}
        <div className="space-y-5 lg:col-span-2">
          <div className="grid grid-cols-2 gap-5">
            {/* Lane */}
            <div>
              <label className="block text-xs text-muted mb-1 font-medium uppercase tracking-wide">
                Lane
              </label>
              <select
                defaultValue={company.lane}
                onChange={async (e) => {
                  await updateCompanyField(company.id, "lane", e.target.value);
                }}
                className="w-full rounded border border-border px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
              >
                {LANES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs text-muted mb-1 font-medium uppercase tracking-wide">
                Priority
              </label>
              <select
                defaultValue={company.priority}
                onChange={async (e) => {
                  await updateCompanyField(
                    company.id,
                    "priority",
                    parseInt(e.target.value, 10)
                  );
                }}
                className="w-full rounded border border-border px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
              >
                {[1, 2, 3, 4, 5].map((p) => (
                  <option key={p} value={p}>
                    {p} — {p === 1 ? "Top target" : p === 5 ? "Stretch" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Cycle opens */}
            <div>
              <label className="block text-xs text-muted mb-1 font-medium uppercase tracking-wide">
                Cycle Opens
              </label>
              <select
                defaultValue={company.cycleOpensMonth ?? ""}
                onChange={async (e) => {
                  await updateCompanyField(
                    company.id,
                    "cycleOpensMonth",
                    e.target.value ? parseInt(e.target.value, 10) : null
                  );
                }}
                className="w-full rounded border border-border px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
              >
                <option value="">Rolling</option>
                {MONTH_NAMES.slice(1).map((m, i) => (
                  <option key={i + 1} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Cycle closes */}
            <div>
              <label className="block text-xs text-muted mb-1 font-medium uppercase tracking-wide">
                Cycle Closes
              </label>
              <select
                defaultValue={company.cycleClosesMonth ?? ""}
                onChange={async (e) => {
                  await updateCompanyField(
                    company.id,
                    "cycleClosesMonth",
                    e.target.value ? parseInt(e.target.value, 10) : null
                  );
                }}
                className="w-full rounded border border-border px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
              >
                <option value="">Rolling</option>
                {MONTH_NAMES.slice(1).map((m, i) => (
                  <option key={i + 1} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <InlineField
            label="Career Page URL"
            value={company.careerPageUrl}
            field="careerPageUrl"
            companyId={company.id}
            type="url"
          />

          <InlineField
            label="Roles Hired (comma-separated)"
            value={company.rolesHiredBs}
            field="rolesHiredBs"
            companyId={company.id}
            placeholder="research intern, ML intern"
          />

          <InlineField
            label="Notes"
            value={company.notes ?? ""}
            field="notes"
            companyId={company.id}
            multiline
            placeholder="Strategy, differentiators, things to lead with…"
          />

          <WhyMeSection companyId={company.id} initial={company.whyMe} />

          <div className="border-t border-white/10 pt-5">
            <ApplicationsSection
              companyId={company.id}
              applications={company.applications}
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <InlineField
            label="Warm Intros"
            value={company.warmIntros ?? ""}
            field="warmIntros"
            companyId={company.id}
            multiline
            placeholder="Name, how you know them, last contact…"
          />

          <PrepChecklist
            companyId={company.id}
            initialJson={company.prepChecklistJson}
          />

          <div className="border-t border-white/10 pt-4">
            <a
              href={company.careerPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline"
            >
              Open career page →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
