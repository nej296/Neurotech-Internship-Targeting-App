"use client";

import { useState } from "react";
import { updateProjectField, deleteProject } from "./actions";
import type { ProjectStatus } from "@/types";

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; bg: string }
> = {
  idea: { label: "Idea", color: "#6b7280", bg: "#f3f4f6" },
  in_progress: { label: "In Progress", color: "#1e40af", bg: "#dbeafe" },
  shipped: { label: "Shipped", color: "#166534", bg: "#dcfce7" },
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
    <div className="border-b border-border last:border-b-0">
      {/* Row summary */}
      <div
        className="flex items-center gap-4 px-4 py-3 hover:bg-surface transition-colors cursor-pointer"
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

        <span className="flex-1 text-sm font-medium truncate">{name}</span>

        {relevantLanes.length > 0 && (
          <div className="flex gap-1 shrink-0">
            {relevantLanes.map((l) => (
              <span
                key={l}
                className="text-xs px-1.5 py-0.5 rounded bg-surface border border-border text-muted"
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
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-border bg-surface">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1 font-medium uppercase tracking-wide">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => handleBlur("name", e.target.value)}
                className="w-full border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:border-accent bg-white"
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
                className="w-full border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:border-accent bg-white"
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
              className="w-full border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:border-accent resize-none bg-white"
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
                      ? "border-accent bg-accent text-white"
                      : "border-border text-muted hover:border-foreground"
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
              className="text-xs text-muted hover:text-red-600 transition-colors disabled:opacity-50"
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
      <p className="text-sm text-muted py-8 text-center">
        No projects yet. Add one above.
      </p>
    );
  }

  return (
    <div className="border border-border rounded overflow-hidden">
      {projects.map((p) => (
        <ProjectRow key={p.id} project={p} />
      ))}
    </div>
  );
}
