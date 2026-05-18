"use client";

import type { ReactNode } from "react";

interface HeadSilhouetteProps {
  facing: "left" | "right" | "front";
  label?: string;
  children: ReactNode;
  dim?: boolean;
  inflated?: boolean;
  size?: "md" | "lg";
}

const SIDE_PATH = `M 110 22
   C 172 22 202 60 202 112
   C 202 130 198 140 192 146
   L 200 158
   C 204 164 200 172 192 174
   L 184 176
   L 180 192
   C 179 200 172 204 164 204
   L 158 214
   C 155 222 148 224 140 222
   L 142 234
   C 143 244 138 250 130 252
   L 128 286
   L 40 286
   L 40 262
   C 24 252 16 236 12 218
   C 8 198 8 182 16 165
   C 6 154 4 138 8 122
   C 12 100 22 78 38 60
   C 56 38 82 22 110 22 Z`;

const FRONT_PATH = `M 110 30
   C 162 30 196 70 196 124
   C 196 154 188 178 174 196
   L 168 220
   C 165 228 158 232 150 232
   L 145 260
   C 144 270 138 276 130 278
   L 95 286
   L 90 286
   L 85 278
   C 80 276 74 270 73 260
   L 70 232
   C 62 232 55 228 52 220
   L 46 196
   C 32 178 24 154 24 124
   C 24 70 58 30 110 30 Z`;

export function HeadSilhouette({
  facing,
  label,
  children,
  dim = false,
  inflated = false,
  size = "md",
}: HeadSilhouetteProps) {
  const isFront = facing === "front";
  const flip = facing === "left" ? "scale-x-[-1]" : "";
  const gradId = `head-grad-${facing}-${size}`;
  const dims = size === "lg" ? { w: 320, h: 400 } : { w: 260, h: 320 };

  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <p className="text-sm font-medium tracking-wide text-zinc-200">{label}</p>
      )}
      <div
        className="relative"
        style={{ width: dims.w, height: dims.h }}
      >
        <svg
          viewBox="0 0 220 290"
          className={`absolute inset-0 h-full w-full ${flip}`}
          aria-hidden
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id={gradId} cx="42%" cy="32%" r="85%">
              <stop offset="0%" stopColor="#1e1e1e" />
              <stop offset="60%" stopColor="#0e0e0e" />
              <stop offset="100%" stopColor="#040404" />
            </radialGradient>
          </defs>
          <path
            d={isFront ? FRONT_PATH : SIDE_PATH}
            fill={`url(#${gradId})`}
            stroke="#222"
            strokeWidth="0.6"
          />
          {!isFront && (
            <ellipse cx="128" cy="138" rx="7" ry="11" fill="#0a0a0a" opacity="0.85" />
          )}
        </svg>
        <div
          className={`absolute transition-transform duration-500 ${
            inflated ? "scale-110" : "scale-100"
          } ${dim ? "opacity-45 saturate-[0.5]" : ""}`}
          style={
            isFront
              ? { left: "20%", top: "12%", width: "60%", height: "42%" }
              : { left: "12%", top: "14%", width: "72%", height: "46%" }
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
