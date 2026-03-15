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
          className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm transition-colors focus:ring-1 focus:ring-zinc-300 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
      >
        <Plus size={16} />
        <span>New Project</span>
      </button>
    </form>
  );
}
