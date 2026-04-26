"use client";

import { useState } from "react";
import { createProject } from "./actions";

export default function NewProjectForm() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const result = await createProject(new FormData(e.currentTarget));
    setSaving(false);
    if (result.success) {
      setOpen(false);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(result.error ?? "Failed to create project");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 shadow-orbital transition-colors hover:bg-cyan-200"
      >
        + Add Project
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">New Project</h3>
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
              placeholder="Neural decoder for EEG"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Status</label>
            <select
              name="status"
              defaultValue="idea"
              className="w-full rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
            >
              <option value="idea">Idea</option>
              <option value="in_progress">In Progress</option>
              <option value="shipped">Shipped</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">
            Description *
          </label>
          <textarea
            name="description"
            required
            rows={2}
            className="w-full resize-none rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
            placeholder="What it does, what stack it uses, what it demonstrates…"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">GitHub URL</label>
          <input
            name="githubUrl"
            type="url"
            className="w-full rounded border border-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
            placeholder="https://github.com/…"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200 disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
