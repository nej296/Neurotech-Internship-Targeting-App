"use client";

import { useState } from "react";
import { updateProjectField, deleteProject } from "./actions";
import type { ProjectStatus } from "@/types";

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; bg: string }
> = {
  idea: { label: "Idea", color: "#cbd5e1", bg: "rgba(148,163,184,0.12)" },
  in_progress: { label: "In Progress", color: "#67e8f9", bg: "rgba(34,211,238,0.14)" },
  shipped: { label: "Shipped", color: "#86efac", bg: "rgba(52,211,153,0.14)" },
};

const LANE_OPTIONS = [
  { value: "neurotech", label: "Neurotech" },
  { value: "biotech", label: "Biotech" },
  { value: "defense", label: "Defense" },
  { value: "ai_ml", label: "AI / ML" },
  { value: "academic_lab", label: "Academic" },
];

interface Project {
  id: string;
  name: string;
  status: string;
  description: string;
  githubUrl: string | null;
  relevantTo: string | null;
}

function ProjectRow({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(project.status as ProjectStatus);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [githubUrl, setGithubUrl] = useState(project.githubUrl ?? "");
  const [relevantLanes, setRelevantLanes] = useState<string[]>(
    project.relevantTo
      ? project.relevantTo.split(",").map((s) => s.trim()).filter(Boolean)
      : []
  );
  const [deleting, setDeleting] = useState(false);

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.idea;

  async function handleBlur(field: string, value: string) {
    await updateProjectField(project.id, field, value || null);
  }

  async function cycleStatus() {
    const order: ProjectStatus[] = ["idea", "in_progress", "shipped"];
    const next = order[(order.indexOf(status) + 1) % order.length];
    setStatus(next);
    await updateProjectField(project.id, "status", next);
  }

  async function toggleLane(lane: string) {
    const updated = relevantLanes.includes(lane)
      ? relevantLanes.filter((l) => l !== lane)
      : [...relevantLanes, lane];
    setRelevantLanes(updated);
    await updateProjectField(
      project.id,
      "relevantTo",
      updated.join(",") || null
    );
  }

  async function handleDelete() {
    if (!confirm(`Delete "${project.name}"?`)) return;
    setDeleting(true);
    await deleteProject(project.id);
  }

  return (
    <div className="border-b border-white/10 last:border-b-0">
      {/* Row summary */}
      <div
        className="flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-cyan-300/5"
        onClick={() => setExpanded((v) => !v)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            cycleStatus();
          }}
          className="shrink-0 text-xs px-2 py-0.5 rounded font-medium transition-colors"
          style={{ background: cfg.bg, color: cfg.color }}
          title="Click to cycle status"
        >
          {cfg.label}
        </button>

        <span className="flex-1 truncate text-sm font-medium text-white">{name}</span>

        {relevantLanes.length > 0 && (
          <div className="flex gap-1 shrink-0">
            {relevantLanes.map((l) => (
              <span
                key={l}
                className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-xs text-muted"
              >
                {LANE_OPTIONS.find((o) => o.value === l)?.label ?? l}
              </span>
            ))}
          </div>
        )}

        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 text-xs text-accent hover:underline"
          >
            GitHub →
          </a>
        )}

        <span className="shrink-0 text-xs text-muted">
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="space-y-4 border-t border-white/10 bg-black/20 px-4 pb-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1 font-medium uppercase tracking-wide">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => handleBlur("name", e.target.value)}
                className="w-full rounded border border-border px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1 font-medium uppercase tracking-wide">
                GitHub URL
              </label>
              <input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                onBlur={(e) => handleBlur("githubUrl", e.target.value)}
                placeholder="https://github.com/…"
                className="w-full rounded border border-border px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1 font-medium uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={(e) => handleBlur("description", e.target.value)}
              rows={3}
              className="w-full resize-none rounded border border-border px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-2 font-medium uppercase tracking-wide">
              Relevant To
            </label>
            <div className="flex flex-wrap gap-2">
              {LANE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleLane(opt.value)}
                  className={`text-xs px-3 py-1 rounded border transition-colors ${
                    relevantLanes.includes(opt.value)
                      ? "border-accent bg-accent text-slate-950"
                      : "border-white/10 text-muted hover:border-cyan-300/60"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-muted transition-colors hover:text-red-300 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete project"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <p className="rounded-[2rem] border border-white/10 bg-surface py-8 text-center text-sm text-muted">
        No projects yet. Add one above.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-surface shadow-2xl shadow-black/20 backdrop-blur-xl">
      {projects.map((p) => (
        <ProjectRow key={p.id} project={p} />
      ))}
    </div>
  );
}
