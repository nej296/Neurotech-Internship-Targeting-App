"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LampContainer } from "@/components/ui/lamp";

const features = [
  {
    title: "Cycle Calendar",
    desc: "See when every target company opens recruiting. Never miss a window again.",
  },
  {
    title: "AI Fit Analysis",
    desc: "Paste a JD, get an honest score with specific gaps and actions to close them.",
  },
  {
    title: "Pipeline Kanban",
    desc: "Drag applications through stages. See what's stale, what needs follow-up.",
  },
  {
    title: "Why Me Generator",
    desc: "AI-written pitch paragraphs that reference your actual projects — no generic filler.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-slate-950 min-h-screen">
      {/* Hero with Lamp */}
      <LampContainer>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <h1 className="mt-8 bg-gradient-to-br from-slate-200 to-slate-400 py-4 bg-clip-text text-center text-5xl font-semibold tracking-tight text-transparent md:text-7xl leading-tight">
            Target. Track.
            <br />
            Convert.
          </h1>
          <p className="mt-4 max-w-xl text-center text-base text-slate-400 md:text-lg">
            Stop sending generic applications into the void. A targeting and
            timing tool built for neurotech, biotech, defense, and AI/ML
            internships.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/dashboard"
              className="rounded-full bg-cyan-500 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:bg-cyan-400 hover:shadow-cyan-400/30"
            >
              Enter App
            </Link>
            <Link
              href="/companies"
              className="rounded-full border border-slate-700 px-8 py-3 text-sm font-medium text-slate-300 transition-all hover:border-slate-500 hover:text-white"
            >
              Browse Targets
            </Link>
          </div>
        </motion.div>
      </LampContainer>

      {/* Features */}
      <div className="mx-auto max-w-5xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-cyan-400">
            What it does
          </h2>
          <p className="mt-2 text-center text-3xl font-semibold text-white">
            Four problems, one focused tool
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm"
            >
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-slate-800 py-16 text-center">
        <p className="text-sm text-slate-500">
          Built for a computational neuroscience student at George Mason
          University.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Open Dashboard →
        </Link>
      </div>
    </div>
  );
}
