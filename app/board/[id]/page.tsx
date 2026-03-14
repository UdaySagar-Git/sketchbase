import { notFound } from "next/navigation";
import { getKeyHash, isBoardUnlocked } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BoardClient from "./board-client";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const board = await prisma.board.findUnique({
    where: { id },
    include: {
      project: {
        include: { workspace: true },
      },
    },
  });

  if (!board) notFound();

  const keyHash = await getKeyHash();
  const isOwner = !!keyHash && board.project.workspace.keyHash === keyHash;
  const isLocked = !!board.passHash;

  // Only serve board content if:
  // - Board is public (no password), OR
  // - User is the workspace owner, OR
  // - Board has been unlocked via password (server-side cookie)
  let initialData: Record<string, unknown> | null = null;
  if (!isLocked || isOwner || (await isBoardUnlocked(id))) {
    initialData = board.content as Record<string, unknown> | null;
  }

  return (
    <BoardClient
      boardId={board.id}
      boardName={board.name}
      projectName={board.project.name}
      projectEmoji={board.project.emoji}
      projectId={board.projectId}
      initialData={initialData}
      isLocked={isLocked && !isOwner && !(await isBoardUnlocked(id))}
      isOwner={isOwner}
    />
  );
}
