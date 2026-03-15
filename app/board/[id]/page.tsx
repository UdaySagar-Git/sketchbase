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
      tabs: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!board) notFound();

  const keyHash = await getKeyHash();
  const isOwner = !!keyHash && board.project.workspace.keyHash === keyHash;
  const isLocked = !!board.passHash;

  const hasAccess = !isLocked || isOwner || (await isBoardUnlocked(id));

  // If board has no tabs yet, create a default Excalidraw tab
  // migrating existing board.content into it
  let tabs = board.tabs;
  if (hasAccess && tabs.length === 0) {
    const defaultTab = await prisma.tab.create({
      data: {
        name: "Drawing",
        type: "EXCALIDRAW",
        boardId: id,
        order: 0,
        content: board.content ?? undefined,
      },
    });
    tabs = [defaultTab];
  }

  const initialTabs = hasAccess
    ? tabs.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        order: t.order,
        content: t.content,
      }))
    : [];

  return (
    <BoardClient
      boardId={board.id}
      boardName={board.name}
      projectName={board.project.name}
      projectEmoji={board.project.emoji}
      projectId={board.projectId}
      initialTabs={initialTabs}
      isLocked={isLocked && !isOwner && !(await isBoardUnlocked(id))}
      isOwner={isOwner}
    />
  );
}
