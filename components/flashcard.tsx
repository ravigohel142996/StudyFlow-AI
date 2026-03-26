"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

interface FlashcardProps {
  question: string;
  answer: string;
  index: number;
}

export function Flashcard({ question, answer, index }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  const colors = [
    "from-violet-600 to-purple-700",
    "from-cyan-600 to-blue-700",
    "from-emerald-600 to-teal-700",
    "from-amber-600 to-orange-700",
    "from-pink-600 to-rose-700",
  ];

  const color = colors[index % colors.length];

  return (
    <div
      className="flashcard-scene w-full h-44 cursor-pointer select-none"
      onClick={() => setFlipped(!flipped)}
    >
      <div className={`flashcard-card ${flipped ? "flipped" : ""}`}>
        {/* Front — Question */}
        <div
          className={`flashcard-front bg-gradient-to-br ${color} p-5 flex flex-col justify-between`}
        >
          <div className="flex items-start justify-between">
            <span className="text-white/60 text-xs font-medium uppercase tracking-wider">
              Question {index + 1}
            </span>
            <RotateCcw className="w-4 h-4 text-white/60" />
          </div>
          <p className="text-white font-medium text-base leading-relaxed">
            {question}
          </p>
          <p className="text-white/50 text-xs">Click to reveal answer</p>
        </div>

        {/* Back — Answer */}
        <div className="flashcard-back bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-emerald-400 text-xs font-medium uppercase tracking-wider">
              Answer
            </span>
            <RotateCcw className="w-4 h-4 text-white/40" />
          </div>
          <p className="text-white text-sm leading-relaxed">{answer}</p>
          <p className="text-white/30 text-xs">Click to see question</p>
        </div>
      </div>
    </div>
  );
}
