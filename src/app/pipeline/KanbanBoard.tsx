"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { moveApplication } from "./actions";
import type { ApplicationStatus } from "@/types";

const COLUMNS: { status: ApplicationStatus; label: string }[] = [
  { status: "target", label: "Target" },
  { status: "applied", label: "Applied" },
  { status: "screen", label: "Screen" },
  { status: "interview", label: "Interview" },
  { status: "offer", label: "Offer" },
  { status: "rejected", label: "Rejected" },
  { status: "ghosted", label: "Ghosted" },
];

interface AppCard {
  id: string;
  roleTitle: string;
  status: string;
  lastActivityAt: Date;
  followUpDueAt: Date | null;
  company: { id: string; name: string };
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

function isOverdue(date: Date | null): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

function KanbanCard({
  app,
  onDragStart,
}: {
  app: AppCard;
  onDragStart: (id: string) => void;
}) {
  const days = daysSince(app.lastActivityAt);
  const overdue = isOverdue(app.followUpDueAt);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(app.id)}
      className="bg-white border border-border rounded p-3 cursor-grab active:cursor-grabbing select-none hover:border-accent/50 transition-colors"
    >
      <Link
        href={`/companies/${app.company.id}`}
        onClick={(e) => e.stopPropagation()}
        className="block text-xs text-muted hover:text-accent mb-1 transition-colors"
      >
        {app.company.name}
      </Link>
      <p className="text-sm font-medium leading-snug mb-2">{app.roleTitle}</p>
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs tabular-nums ${
            days > 14 ? "text-amber-600 font-medium" : "text-muted"
          }`}
        >
          {days === 0 ? "Today" : `${days}d ago`}
        </span>
        {overdue && (
          <span className="text-xs text-red-600 font-medium">Follow-up due</span>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  cards,
  onDragStart,
  onDrop,
  isDragOver,
  onDragOver,
  onDragLeave,
}: {
  column: { status: ApplicationStatus; label: string };
  cards: AppCard[];
  onDragStart: (id: string) => void;
  onDrop: (status: ApplicationStatus) => void;
  isDragOver: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
}) {
  return (
    <div className="flex flex-col min-w-[200px] flex-1">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {column.label}
        </span>
        <span className="text-xs text-muted tabular-nums">{cards.length}</span>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver();
        }}
        onDragLeave={onDragLeave}
        onDrop={(e) => {
          e.preventDefault();
          onDrop(column.status);
        }}
        className={`flex-1 min-h-[200px] rounded border-2 transition-colors p-2 space-y-2 ${
          isDragOver
            ? "border-accent bg-accent-light"
            : "border-transparent bg-surface"
        }`}
      >
        {cards.map((app) => (
          <KanbanCard key={app.id} app={app} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  applications: AppCard[];
}

export default function KanbanBoard({ applications }: KanbanBoardProps) {
  const [apps, setApps] = useState(applications);
  const [dragOver, setDragOver] = useState<ApplicationStatus | null>(null);
  const draggingId = useRef<string | null>(null);

  function handleDragStart(id: string) {
    draggingId.current = id;
  }

  async function handleDrop(targetStatus: ApplicationStatus) {
    const id = draggingId.current;
    if (!id) return;

    const app = apps.find((a) => a.id === id);
    if (!app || app.status === targetStatus) {
      setDragOver(null);
      return;
    }

    // Optimistic update
    setApps((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: targetStatus, lastActivityAt: new Date() }
          : a
      )
    );
    setDragOver(null);
    draggingId.current = null;

    await moveApplication(id, targetStatus);
  }

  const byStatus = (status: string) => apps.filter((a) => a.status === status);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => (
        <KanbanColumn
          key={col.status}
          column={col}
          cards={byStatus(col.status)}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          isDragOver={dragOver === col.status}
          onDragOver={() => setDragOver(col.status)}
          onDragLeave={() => setDragOver(null)}
        />
      ))}
    </div>
  );
}
