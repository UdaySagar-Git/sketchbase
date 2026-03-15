import { redirect } from "next/navigation";
import { getKeyHash } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import ProjectCard from "@/components/ProjectCard";
import NewProjectForm from "@/components/NewProjectForm";

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
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="text-lg font-medium">My Projects</h1>

        <NewProjectForm />

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
          <p className="mt-16 text-center text-zinc-400">
            No projects yet. Create one above to get started.
          </p>
        )}
      </div>
    </div>
  );
}
