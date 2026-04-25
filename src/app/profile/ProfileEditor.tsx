"use client";

import { useState } from "react";
import { updateProfileField, updateSkills } from "./actions";
import type { SkillEntry } from "@/types";

const LEVEL_LABELS = ["", "Beginner", "Basic", "Proficient", "Advanced", "Expert"];

function SaveField({
  label,
  field,
  initialValue,
  rows,
  placeholder,
}: {
  label: string;
  field: "resumeText" | "educationText";
  initialValue: string;
  rows: number;
  placeholder: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleBlur() {
    if (value === initialValue) return;
    setSaving(true);
    await updateProfileField(field, value);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </label>
        {saving && <span className="text-xs text-accent">Saving…</span>}
        {saved && !saving && <span className="text-xs text-green-600">Saved</span>}
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        rows={rows}
        placeholder={placeholder}
        className="w-full border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent resize-y"
      />
    </div>
  );
}

function SkillsEditor({ initialJson }: { initialJson: string }) {
  const [skills, setSkills] = useState<SkillEntry[]>(() => {
    try {
      return JSON.parse(initialJson);
    } catch {
      return [];
    }
  });
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(updated: SkillEntry[]) {
    setSkills(updated);
    setSaving(true);
    await updateSkills(JSON.stringify(updated));
    setSaving(false);
  }

  async function addSkill() {
    if (!newSkill.trim()) return;
    const trimmed = newSkill.trim();
    if (skills.some((s) => s.skill.toLowerCase() === trimmed.toLowerCase())) return;
    const updated = [...skills, { skill: trimmed, level: 3 }];
    setNewSkill("");
    await save(updated);
  }

  async function setLevel(idx: number, level: number) {
    const updated = skills.map((s, i) => (i === idx ? { ...s, level } : s));
    await save(updated);
  }

  async function removeSkill(idx: number) {
    const updated = skills.filter((_, i) => i !== idx);
    await save(updated);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-medium uppercase tracking-wide text-muted">
          Skills
        </label>
        {saving && <span className="text-xs text-accent">Saving…</span>}
      </div>

      <div className="border border-border rounded overflow-hidden mb-3">
        {skills.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted italic">
            No skills added yet.
          </p>
        ) : (
          skills.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 px-4 py-2.5 border-b border-border last:border-b-0 group"
            >
              <span className="flex-1 text-sm">{s.skill}</span>

              {/* Level pips */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(idx, l)}
                    title={LEVEL_LABELS[l]}
                    className={`w-4 h-4 rounded-sm transition-colors ${
                      l <= s.level
                        ? "bg-accent"
                        : "bg-border hover:bg-muted/40"
                    }`}
                  />
                ))}
                <span className="ml-2 text-xs text-muted w-16">
                  {LEVEL_LABELS[s.level]}
                </span>
              </div>

              <button
                onClick={() => removeSkill(idx)}
                className="opacity-0 group-hover:opacity-100 text-xs text-muted hover:text-red-500 transition-opacity"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSkill()}
          placeholder="Add skill (e.g. PyTorch, spike sorting, MEA analysis)…"
          className="flex-1 border border-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
        />
        <button
          onClick={addSkill}
          disabled={!newSkill.trim()}
          className="text-sm px-4 py-1.5 border border-border rounded hover:border-foreground disabled:opacity-40 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}

interface ProfileEditorProps {
  profile: {
    resumeText: string;
    skillsJson: string;
    educationText: string;
  };
}

export default function ProfileEditor({ profile }: ProfileEditorProps) {
  return (
    <div className="space-y-8 max-w-3xl">
      <SkillsEditor initialJson={profile.skillsJson} />

      <div className="border-t border-border pt-8">
        <SaveField
          label="Education"
          field="educationText"
          initialValue={profile.educationText}
          rows={4}
          placeholder="B.S. Computational Neuroscience, George Mason University, expected May 2026. GPA: 3.8. Relevant coursework: …"
        />
      </div>

      <div className="border-t border-border pt-8">
        <SaveField
          label="Master Resume (plain text)"
          field="resumeText"
          initialValue={profile.resumeText}
          rows={24}
          placeholder="Paste your full resume here. This feeds the AI fit analyzer and pitch generator — the more detail, the better the output."
        />
        <p className="mt-2 text-xs text-muted">
          Saves automatically on blur. Used by the fit analyzer and Why Me generator.
        </p>
      </div>
    </div>
  );
}
