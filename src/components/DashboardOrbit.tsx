"use client";

import { Building2, CalendarClock, ClipboardList, Radio, Route } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

interface DashboardOrbitProps {
  targetCount: number;
  openingSoonCount: number;
  followUpsDueCount: number;
  staleAppsCount: number;
  activeCount: number;
}

function clampEnergy(value: number) {
  return Math.max(18, Math.min(100, value));
}

export default function DashboardOrbit({
  targetCount,
  openingSoonCount,
  followUpsDueCount,
  staleAppsCount,
  activeCount,
}: DashboardOrbitProps) {
  const timelineData = [
    {
      id: 1,
      title: "Targets",
      date: `${targetCount} total`,
      content:
        "Your curated company map across neurotech, biotech, defense, academic labs, and AI/ML.",
      category: "Database",
      icon: Building2,
      relatedIds: [2, 5],
      status: targetCount > 0 ? ("completed" as const) : ("pending" as const),
      energy: clampEnergy(targetCount * 6),
    },
    {
      id: 2,
      title: "Cycles",
      date: `${openingSoonCount} soon`,
      content:
        openingSoonCount > 0
          ? "Recruiting windows are approaching. Prioritize warm intros and application prep."
          : "No immediate cycle pressure in the current dashboard window.",
      category: "Timing",
      icon: CalendarClock,
      relatedIds: [1, 3],
      status:
        openingSoonCount > 0 ? ("in-progress" as const) : ("pending" as const),
      energy: clampEnergy(openingSoonCount * 24),
    },
    {
      id: 3,
      title: "Follow Ups",
      date: `${followUpsDueCount} due`,
      content:
        followUpsDueCount > 0
          ? "These conversations need action this week before they go cold."
          : "Follow-up queue is clear for the next seven days.",
      category: "Outreach",
      icon: Radio,
      relatedIds: [2, 4],
      status:
        followUpsDueCount > 0
          ? ("in-progress" as const)
          : ("completed" as const),
      energy: clampEnergy(followUpsDueCount * 28),
    },
    {
      id: 4,
      title: "Stale Apps",
      date: `${staleAppsCount} aging`,
      content:
        staleAppsCount > 0
          ? "Applications with 14+ days of silence are ready for a decision: follow up, refresh, or close."
          : "No stale active applications detected.",
      category: "Risk",
      icon: ClipboardList,
      relatedIds: [3, 5],
      status: staleAppsCount > 0 ? ("pending" as const) : ("completed" as const),
      energy: clampEnergy(staleAppsCount * 30),
    },
    {
      id: 5,
      title: "Pipeline",
      date: `${activeCount} active`,
      content:
        "Your live application flow from target to offer. Drag the board when status changes.",
      category: "Execution",
      icon: Route,
      relatedIds: [1, 4],
      status: activeCount > 0 ? ("in-progress" as const) : ("pending" as const),
      energy: clampEnergy(activeCount * 18),
    },
  ];

  return <RadialOrbitalTimeline timelineData={timelineData} />;
}
