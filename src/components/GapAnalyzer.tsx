"use client";

import type { FitAnalysisResult } from "@/types";

function scoreColor(score: number): string {
  if (score >= 70) return "#166534";
  if (score >= 50) return "#854d0e";
  if (score >= 30) return "#c2410c";
  return "#991b1b";
}

function scoreBg(score: number): string {
  if (score >= 70) return "#dcfce7";
  if (score >= 50) return "#fef9c3";
  if (score >= 30) return "#ffedd5";
  return "#fee2e2";
}

export default function GapAnalyzer({ data }: { data: FitAnalysisResult }) {
  return (
    <div className="space-y-4">
      {/* Score + summary */}
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 w-16 h-16 rounded flex flex-col items-center justify-center"
          style={{
            background: scoreBg(data.fitScore),
            color: scoreColor(data.fitScore),
          }}
        >
          <span className="text-2xl font-bold tabular-nums leading-none">
            {data.fitScore}
          </span>
          <span className="text-[10px] font-medium mt-0.5">/100</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed flex-1 pt-1">
          {data.oneLineSummary}
        </p>
      </div>

      {/* Matched */}
      {data.matchedRequirements.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
            Matched Requirements
          </h4>
          <ul className="space-y-1">
            {data.matchedRequirements.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-green-600 shrink-0 mt-0.5">&#10003;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps */}
      {data.gaps.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
            Gaps
          </h4>
          <ul className="space-y-1">
            {data.gaps.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-amber-600 shrink-0 mt-0.5">&#9888;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Actions */}
      {data.recommendedActions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
            Recommended Actions
          </h4>
          <ol className="space-y-1 list-decimal list-inside">
            {data.recommendedActions.map((item, i) => (
              <li key={i} className="text-sm">
                {item}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
