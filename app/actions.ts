"use server";

import { prisma } from "@/lib/prisma";
import { hashKey } from "@/lib/hash";
import {
  getKeyHash,
  setKeyHash,
  clearKeyHash,
  isBoardUnlocked,
  setBoardUnlocked,
  timingSafeEqual,
} from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  MSG_ENTER_WORKSPACE_KEY,
  MSG_WORKSPACE_REQUIRES_PASSWORD,
  MSG_INCORRECT_PASSWORD,
  MSG_CURRENT_PASSWORD_REQUIRED,
  MSG_CURRENT_PASSWORD_INCORRECT,
  MSG_PASSWORD_UPDATED,
  MSG_PASSWORD_REMOVED,
  MSG_PROJECT_NAME_REQUIRED,
  MSG_BOARD_NAME_REQUIRED,
} from "@/lib/messages";

// --- Auth ---

export async function enterWorkspace(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const key = formData.get("key") as string;
  const password = formData.get("password") as string | null;

  if (!key || key.trim().length === 0) {
    return { error: MSG_ENTER_WORKSPACE_KEY };
  }

  const keyHash = await hashKey(key.trim());
  const existing = await prisma.workspace.findUnique({ where: { keyHash } });

  if (existing) {
    if (existing.passHash) {
      if (!password) {
        return { error: MSG_WORKSPACE_REQUIRES_PASSWORD };
      }
      const inputHash = await hashKey(password);
      if (!timingSafeEqual(inputHash, existing.passHash)) {
        return { error: MSG_INCORRECT_PASSWORD };
      }
    }
  } else {
    const passHash = password && password.length > 0 ? await hashKey(password) : null;
    await prisma.workspace.create({
      data: { keyHash, passHash },
    });
  }

  await setKeyHash(keyHash);
  redirect("/dashboard");
}

export async function leaveWorkspace() {
  await clearKeyHash();
  redirect("/");
}

export async function updateWorkspacePassword(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const keyHash = await getKeyHash();
  if (!keyHash) redirect("/");

  const currentPassword = formData.get("currentPassword") as string | null;
  const newPassword = formData.get("newPassword") as string | null;

  const workspace = await prisma.workspace.findUnique({ where: { keyHash } });
  if (!workspace) redirect("/");

  if (workspace.passHash) {
    if (!currentPassword) {
      return { error: MSG_CURRENT_PASSWORD_REQUIRED };
    }
    const currentHash = await hashKey(currentPassword);
    if (!timingSafeEqual(currentHash, workspace.passHash)) {
      return { error: MSG_CURRENT_PASSWORD_INCORRECT };
    }
  }

  const newPassHash = newPassword && newPassword.length > 0 ? await hashKey(newPassword) : null;

  await prisma.workspace.update({
    where: { keyHash },
    data: { passHash: newPassHash },
  });

  if (newPassHash) {
    return { success: MSG_PASSWORD_UPDATED };
  }
  return { success: MSG_PASSWORD_REMOVED };
}

export async function deleteWorkspace() {
  const keyHash = await getKeyHash();
  if (!keyHash) redirect("/");

  const workspace = await prisma.workspace.findUnique({ where: { keyHash } });
  if (!workspace) redirect("/");

  await prisma.workspace.delete({ where: { id: workspace.id } });
  await clearKeyHash();
  redirect("/");
}

export async function getWorkspaceSettings() {
  const keyHash = await getKeyHash();
  if (!keyHash) return null;

  const workspace = await prisma.workspace.findUnique({ where: { keyHash } });
  if (!workspace) return null;

  return {
    id: workspace.id,
    hasPassword: !!workspace.passHash,
    createdAt: workspace.createdAt.toISOString(),
  };
}

export async function getWorkspaceNav() {
  const keyHash = await getKeyHash();
  if (!keyHash) return null;

  const workspace = await prisma.workspace.findUnique({
    where: { keyHash },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: {
          boards: {
            orderBy: { updatedAt: "desc" },
            select: { id: true, name: true, passHash: true },
          },
        },
      },
    },
  });

  if (!workspace) return null;

  return workspace.projects.map(
    (p: {
      id: string;
      name: string;
      emoji: string | null;
      boards: { id: string; name: string; passHash: string | null }[];
    }) => ({
      id: p.id,
      name: p.name,
      emoji: p.emoji,
      boards: p.boards.map((b: { id: string; name: string; passHash: string | null }) => ({
        id: b.id,
        name: b.name,
        isLocked: !!b.passHash,
      })),
    })
  );
}

// --- Helpers ---

async function requireKeyHash(): Promise<string> {
  const keyHash = await getKeyHash();
  if (!keyHash) redirect("/");
  return keyHash;
}

async function verifyProjectOwnership(projectId: string, keyHash: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: true },
  });
  if (!project || project.workspace.keyHash !== keyHash) {
    throw new Error("Unauthorized");
  }
  return project;
}

async function verifyBoardOwnership(boardId: string, keyHash: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: { project: { include: { workspace: true } } },
  });
  if (!board || board.project.workspace.keyHash !== keyHash) {
    throw new Error("Unauthorized");
  }
  return board;
}

/**
 * Check if the caller has access to the given board.
 * Access is granted if:
 *  - The board is public (no passHash), OR
 *  - The caller is the workspace owner (has keyHash cookie), OR
 *  - The board has been unlocked via password (httpOnly cookie)
 */
async function verifyBoardAccess(boardId: string) {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: { project: { include: { workspace: true } } },
  });
  if (!board) throw new Error("Board not found");

  // Public board — no password required
  if (!board.passHash) return board;

  // Workspace owner always has access
  const keyHash = await getKeyHash();
  if (keyHash && board.project.workspace.keyHash === keyHash) return board;

  // Check board unlock cookie
  const unlocked = await isBoardUnlocked(boardId);
  if (unlocked) return board;

  throw new Error("Unauthorized");
}

// --- Projects ---

export async function createProject(formData: FormData) {
  const keyHash = await requireKeyHash();
  const name = formData.get("name") as string;
  const emoji = (formData.get("emoji") as string) || null;

  if (!name || name.trim().length === 0) {
    throw new Error(MSG_PROJECT_NAME_REQUIRED);
  }

  const workspace = await prisma.workspace.findUnique({
    where: { keyHash },
  });
  if (!workspace) redirect("/");

  await prisma.project.create({
    data: {
      name: name.trim(),
      emoji,
      workspaceId: workspace.id,
    },
  });

  revalidatePath("/dashboard");
}

export async function deleteProject(id: string) {
  const keyHash = await requireKeyHash();
  await verifyProjectOwnership(id, keyHash);

  await prisma.project.delete({ where: { id } });
  revalidatePath("/dashboard");
}

export async function renameProject(id: string, name: string) {
  const keyHash = await requireKeyHash();
  await verifyProjectOwnership(id, keyHash);

  await prisma.project.update({
    where: { id },
    data: { name },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/project/${id}`);
}

// --- Boards ---

export async function createBoard(formData: FormData) {
  const keyHash = await requireKeyHash();
  const projectId = formData.get("projectId") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string | null;

  if (!name || name.trim().length === 0) {
    throw new Error(MSG_BOARD_NAME_REQUIRED);
  }

  await verifyProjectOwnership(projectId, keyHash);

  const passHash = password && password.length > 0 ? await hashKey(password) : null;

  await prisma.board.create({
    data: {
      name: name.trim(),
      projectId,
      passHash,
    },
  });

  revalidatePath(`/project/${projectId}`);
}

export async function deleteBoard(id: string) {
  const keyHash = await requireKeyHash();
  const board = await verifyBoardOwnership(id, keyHash);

  await prisma.board.delete({ where: { id } });
  revalidatePath(`/project/${board.projectId}`);
}

export async function renameBoard(id: string, name: string) {
  const keyHash = await requireKeyHash();
  const board = await verifyBoardOwnership(id, keyHash);

  await prisma.board.update({
    where: { id },
    data: { name },
  });

  revalidatePath(`/project/${board.projectId}`);
}

export async function saveBoard(id: string, content: unknown) {
  await verifyBoardAccess(id);

  await prisma.board.update({
    where: { id },
    data: { content: content as object },
  });
}

/**
 * Verify board password and unlock the board.
 * Sets an httpOnly cookie so the server knows the board is unlocked.
 * Returns the board content on success so the client can render it.
 */
export async function unlockBoard(
  boardId: string,
  password: string
): Promise<{
  success: boolean;
  error?: string;
  content?: Record<string, unknown> | null;
}> {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) return { success: false, error: "Board not found" };
  if (!board.passHash) return { success: true, content: board.content as Record<string, unknown> };

  const inputHash = await hashKey(password);
  if (!timingSafeEqual(inputHash, board.passHash)) {
    return { success: false, error: MSG_INCORRECT_PASSWORD };
  }

  // Set server-side unlock cookie
  await setBoardUnlocked(boardId);

  return { success: true, content: board.content as Record<string, unknown> };
}

// Keep for backward compat — but unlockBoard is preferred
export async function verifyBoardPassword(boardId: string, password: string) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) return { success: false, error: "Board not found" };
  if (!board.passHash) return { success: true };

  const inputHash = await hashKey(password);
  if (!timingSafeEqual(inputHash, board.passHash)) {
    return { success: false, error: MSG_INCORRECT_PASSWORD };
  }

  await setBoardUnlocked(boardId);
  return { success: true };
}
