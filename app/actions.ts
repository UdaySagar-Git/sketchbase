"use server";

import { prisma } from "@/lib/prisma";
import { hashKey } from "@/lib/hash";
import { getKeyHash, setKeyHash, clearKeyHash } from "@/lib/auth";
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
    // Existing workspace — verify password if one is set
    if (existing.passHash) {
      if (!password) {
        return { error: MSG_WORKSPACE_REQUIRES_PASSWORD };
      }
      const inputHash = await hashKey(password);
      if (inputHash !== existing.passHash) {
        return { error: MSG_INCORRECT_PASSWORD };
      }
    }
  } else {
    // New workspace — create it, optionally with a password
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

  // Verify current password if workspace has one
  if (workspace.passHash) {
    if (!currentPassword) {
      return { error: MSG_CURRENT_PASSWORD_REQUIRED };
    }
    const currentHash = await hashKey(currentPassword);
    if (currentHash !== workspace.passHash) {
      return { error: MSG_CURRENT_PASSWORD_INCORRECT };
    }
  }

  // Set or remove password
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
  const keyHash = await requireKeyHash();
  await verifyBoardOwnership(id, keyHash);

  await prisma.board.update({
    where: { id },
    data: { content: content as object },
  });
}

export async function verifyBoardPassword(boardId: string, password: string) {
  const keyHash = await requireKeyHash();
  await verifyBoardOwnership(boardId, keyHash);

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board || !board.passHash) return { success: true };

  const inputHash = await hashKey(password);
  if (inputHash !== board.passHash) {
    return { success: false, error: MSG_INCORRECT_PASSWORD };
  }

  return { success: true };
}
