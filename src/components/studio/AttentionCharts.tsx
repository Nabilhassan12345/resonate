"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import type { TimelinePoint } from "@/lib/tribe/types";

interface AttentionChartsProps {
  timeline: TimelinePoint[];
  currentTime: number;
  visible: boolean;
}

export function AttentionCharts({ timeline, currentTime, visible }: AttentionChartsProps) {
  const data = timeline.map((p) => ({
    t: p.t,
    attention: Math.round(p.attention * 100),
    emotion: Math.round(p.emotion * 100),
  }));

  if (!visible || !timeline.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-800 text-xs text-zinc-600">
        Run Analyze to generate attention curves
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: visible ? 1 : 0.3, y: visible ? 0 : 12 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="w-full">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
          Attention · 0–20s
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="t" tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: 8,
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="attention"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              isAnimationActive={visible}
            />
            <ReferenceLine x={currentTime} stroke="#fff" strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
          Emotional engagement
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="t" tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: 8,
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="emotion"
              stroke="#eab308"
              strokeWidth={2}
              dot={false}
              isAnimationActive={visible}
            />
            <ReferenceLine x={currentTime} stroke="#fff" strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
