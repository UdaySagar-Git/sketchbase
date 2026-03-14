import { redirect } from "next/navigation";
import { getKeyHash } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BoardClient from "./board-client";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const keyHash = await getKeyHash();
  if (!keyHash) redirect("/");

  const board = await prisma.board.findUnique({
    where: { id },
    include: {
      project: {
        include: { workspace: true },
      },
    },
  });

  if (!board || board.project.workspace.keyHash !== keyHash) redirect("/dashboard");

  return (
    <BoardClient
      boardId={board.id}
      boardName={board.name}
      projectName={board.project.name}
      projectEmoji={board.project.emoji}
      projectId={board.projectId}
      initialData={board.content as Record<string, unknown> | null}
      isLocked={!!board.passHash}
    />
  );
}
