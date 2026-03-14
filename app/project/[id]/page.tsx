import { redirect } from "next/navigation";
import { getKeyHash } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBoard } from "@/app/actions";
import Navbar from "@/components/Navbar";
import BoardCard from "@/components/BoardCard";
import { formatDateShort } from "@/lib/date";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const keyHash = await getKeyHash();
  if (!keyHash) redirect("/");

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      workspace: true,
      boards: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!project || project.workspace.keyHash !== keyHash) redirect("/dashboard");

  return (
    <div className="min-h-screen">
      <Navbar
        breadcrumbs={[{ label: project.emoji ? `${project.emoji} ${project.name}` : project.name }]}
      />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-bold">
          {project.emoji && <span className="mr-2">{project.emoji}</span>}
          {project.name}
        </h1>

        {/* New Board Form */}
        <form action={createBoard} className="mt-6 flex gap-3">
          <input type="hidden" name="projectId" value={id} />
          <input
            type="text"
            name="name"
            placeholder="Board name"
            required
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-500 focus:outline-none"
          />
          <input
            type="password"
            name="password"
            placeholder="Password (optional)"
            className="w-48 rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-5 py-2 font-medium text-white transition-colors hover:bg-zinc-700"
          >
            New Board
          </button>
        </form>

        {/* Boards Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.boards.map((board) => (
            <BoardCard
              key={board.id}
              id={board.id}
              name={board.name}
              isLocked={!!board.passHash}
              updatedAt={formatDateShort(board.updatedAt)}
            />
          ))}
        </div>

        {project.boards.length === 0 && (
          <p className="mt-12 text-center text-zinc-400">
            No boards yet. Create one above to start drawing.
          </p>
        )}
      </div>
    </div>
  );
}
