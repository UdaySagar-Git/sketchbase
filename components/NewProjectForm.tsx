"use client";

import { useState } from "react";
import { createProject } from "@/app/actions";
import EmojiPicker from "@/components/EmojiPicker";
import { Plus } from "@/components/icons";

export default function NewProjectForm() {
  const [emoji, setEmoji] = useState("");

  return (
    <form
      action={(fd) => {
        fd.set("emoji", emoji);
        createProject(fd);
        setEmoji("");
      }}
      className="mt-6 flex flex-col gap-3 sm:flex-row"
    >
      <div className="flex flex-1 gap-3">
        <EmojiPicker value={emoji} onChange={setEmoji} />
        <input
          type="text"
          name="name"
          placeholder="Project name"
          required
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:outline-none sm:py-2"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 font-medium text-white transition-all hover:bg-zinc-700 active:scale-[0.98] sm:py-2"
      >
        <Plus size={16} />
        <span>New Project</span>
      </button>
    </form>
  );
}
