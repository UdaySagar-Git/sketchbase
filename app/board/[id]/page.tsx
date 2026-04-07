import { notFound } from "next/navigation";
import { getKeyHash, isBoardUnlocked, isWorkspaceUnlocked } from "@/lib/auth";
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

  // Board-level lock
  const isBoardLocked = !!board.passHash;
  const boardUnlocked = await isBoardUnlocked(id);

  // Workspace-level lock: if the workspace has a password, non-owners need to unlock it
  const workspace = board.project.workspace;
  const isWorkspaceLocked = !!workspace.passHash && !isOwner;
  const workspaceUnlocked = isWorkspaceLocked ? await isWorkspaceUnlocked(workspace.id) : true;

  // Access logic:
  // 1. Owners always have access
  // 2. Non-owners need workspace unlock (if workspace has password)
  // 3. Non-owners also need board unlock (if board has its own password)
  const hasWorkspaceAccess = isOwner || !isWorkspaceLocked || workspaceUnlocked;
  const hasBoardAccess = !isBoardLocked || isOwner || boardUnlocked;
  const hasAccess = hasWorkspaceAccess && hasBoardAccess;

  // Determine which lock to show (workspace lock takes priority)
  const showWorkspaceLock = !hasWorkspaceAccess;
  const showBoardLock = hasWorkspaceAccess && !hasBoardAccess;

  // If board has no tabs yet, create a default Excalidraw tab
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
      isLocked={showBoardLock}
      isWorkspaceLocked={showWorkspaceLock}
      isOwner={isOwner}
    />
  );
}
