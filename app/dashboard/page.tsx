import { redirect } from "next/navigation";
import { getKeyHash } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProject } from "@/app/actions";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";

export default async function DashboardPage() {
  const keyHash = await getKeyHash();
  if (!keyHash) redirect("/");

  const workspace = await prisma.workspace.findUnique({
    where: { keyHash },
    include: {
      projects: {
        include: { _count: { select: { boards: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!workspace) redirect("/");

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Projects</h1>
        </div>

        {/* New Project Form */}
        <form action={createProject} className="mt-6 flex gap-3">
          <input
            type="text"
            name="emoji"
            placeholder="📁"
            maxLength={2}
            className="w-16 rounded-lg border border-zinc-300 px-3 py-2 text-center text-lg"
          />
          <input
            type="text"
            name="name"
            placeholder="Project name"
            required
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 focus:border-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-5 py-2 font-medium text-white transition-colors hover:bg-zinc-700"
          >
            New Project
          </button>
        </form>

        {/* Projects Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspace.projects.map(
            (project: {
              id: string;
              name: string;
              emoji: string | null;
              _count: { boards: number };
            }) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                emoji={project.emoji}
                boardCount={project._count.boards}
              />
            )
          )}
        </div>

        {workspace.projects.length === 0 && (
          <p className="mt-12 text-center text-zinc-400">
            No projects yet. Create one above to get started.
          </p>
        )}
      </div>
    </div>
  );
}
