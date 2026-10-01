"use client";

import { getScoreColor, getScoreLabel } from "@/lib/score";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export default function ScoreGauge({ score, size = 140 }: ScoreGaugeProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  const getStrokeColor = (score: number): string => {
    if (score >= 90) return "var(--emerald-400)";
    if (score >= 70) return "var(--teal-400)";
    if (score >= 50) return "var(--yellow-400)";
    if (score >= 30) return "var(--orange-400)";
    return "var(--red-400)";
  };

  return (
    <div
      className="score-gauge flex flex-col items-center gap-2"
      style={{ width: size, height: size + 40 }}
      role="meter"
      aria-label={`Accessibility score: ${score} out of 100, ${getScoreLabel(score)}`}
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          className="overflow-visible"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={score === 0 ? "rgba(239, 68, 68, 0.3)" : "var(--navy-700)"}
            strokeWidth={10}
            strokeDasharray={score === 0 ? "4 4" : undefined}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={getStrokeColor(score)}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={score === 0 ? circumference : offset}
            style={{
              transition: "stroke-dashoffset 1s ease-out, stroke 0.3s",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: getStrokeColor(score) }}
          >
            {score}
          </span>
          <span className="text-xs font-semibold text-[var(--gray-300)] mt-0.5">
            / 100
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className={`text-sm font-semibold ${getScoreColor(score)}`}>
          {getScoreLabel(score)}
        </p>
        <p className="text-xs text-[var(--gray-500)]">Estimated Score</p>
      </div>
    </div>
  );
}
