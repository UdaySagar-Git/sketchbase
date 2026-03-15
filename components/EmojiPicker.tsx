"use client";

import { useState, useRef, useEffect } from "react";

const EMOJI_CATEGORIES: { label: string; icon: string; emojis: string[] }[] = [
  {
    label: "Smileys",
    icon: "😀",
    emojis: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😎",
      "🤓",
      "🧐",
      "🤔",
      "🤗",
      "😏",
      "😶",
      "🫡",
      "🤫",
      "🫠",
    ],
  },
  {
    label: "Objects",
    icon: "📦",
    emojis: [
      "📁",
      "📂",
      "📝",
      "📋",
      "📌",
      "📎",
      "🔖",
      "📚",
      "📓",
      "📕",
      "📗",
      "📘",
      "📙",
      "🗂️",
      "🗃️",
      "🗄️",
      "💼",
      "🎒",
      "🧰",
      "🔧",
      "🔨",
      "🛠️",
      "⚙️",
      "🔩",
    ],
  },
  {
    label: "Tech",
    icon: "💻",
    emojis: [
      "💻",
      "🖥️",
      "⌨️",
      "🖱️",
      "💾",
      "📱",
      "🔋",
      "🔌",
      "💡",
      "🔦",
      "📡",
      "🛰️",
      "🤖",
      "🧠",
      "⚡",
      "🔬",
      "🧪",
      "🧬",
      "🔭",
      "📊",
      "📈",
      "📉",
      "🗺️",
      "🧭",
    ],
  },
  {
    label: "Nature",
    icon: "🌿",
    emojis: [
      "🌱",
      "🌿",
      "🍀",
      "🌵",
      "🌴",
      "🌳",
      "🌲",
      "🍁",
      "🍂",
      "🌸",
      "🌺",
      "🌻",
      "🌹",
      "🌷",
      "💐",
      "🍄",
      "🐝",
      "🦋",
      "🐛",
      "🐌",
      "🌈",
      "⭐",
      "🌙",
      "☀️",
    ],
  },
  {
    label: "Fun",
    icon: "🎮",
    emojis: [
      "🎮",
      "🕹️",
      "🎯",
      "🎲",
      "🧩",
      "🎨",
      "🎭",
      "🎪",
      "🎬",
      "🎤",
      "🎵",
      "🎶",
      "🎸",
      "🥁",
      "🎺",
      "🏆",
      "🥇",
      "🏅",
      "🎖️",
      "🏁",
      "🚀",
      "✈️",
      "🛸",
      "🎡",
    ],
  },
  {
    label: "Food",
    icon: "🍕",
    emojis: [
      "🍕",
      "🍔",
      "🌮",
      "🍣",
      "🍜",
      "🍩",
      "🍪",
      "🎂",
      "🍰",
      "🧁",
      "🍫",
      "🍬",
      "☕",
      "🍵",
      "🧋",
      "🥤",
      "🍷",
      "🍺",
      "🥂",
      "🧃",
      "🍎",
      "🍊",
      "🍋",
      "🍇",
    ],
  },
  {
    label: "Symbols",
    icon: "💎",
    emojis: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "💎",
      "🔥",
      "✨",
      "💫",
      "🌟",
      "💥",
      "💯",
      "♻️",
      "🏷️",
      "🔑",
      "🗝️",
      "🛡️",
      "⚔️",
      "🎗️",
      "🔮",
      "🪄",
    ],
  },
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export default function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-14 items-center justify-center rounded-lg border border-zinc-200 bg-white text-xl transition-colors duration-150 hover:bg-zinc-50"
      >
        {value || "📁"}
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-zinc-200/60 bg-white/80 shadow-lg backdrop-blur-xl sm:w-80">
          {/* Category tabs */}
          <div className="flex gap-0.5 border-b border-zinc-100 px-2 pt-2 pb-1">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`flex-1 rounded-lg px-1 py-1.5 text-center text-sm transition-colors duration-150 ${
                  activeTab === i ? "bg-zinc-100" : "hover:bg-zinc-50"
                }`}
                title={cat.label}
              >
                {cat.icon}
              </button>
            ))}
          </div>

          {/* Label */}
          <div className="px-3 pt-2 pb-1">
            <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
              {EMOJI_CATEGORIES[activeTab].label}
            </span>
          </div>

          {/* Emoji grid */}
          <div className="grid grid-cols-8 gap-0.5 px-2 pb-3">
            {EMOJI_CATEGORIES[activeTab].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onChange(emoji);
                  setOpen(false);
                }}
                className="flex aspect-square items-center justify-center rounded-lg text-xl transition-colors duration-150 hover:bg-zinc-100"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
