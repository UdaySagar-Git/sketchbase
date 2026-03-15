-- CreateEnum
CREATE TYPE "TabType" AS ENUM ('EXCALIDRAW', 'BLOCKNOTE', 'TLDRAW', 'MINDMAP');

-- CreateTable
CREATE TABLE "Tab" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TabType" NOT NULL,
    "content" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "boardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tab_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tab" ADD CONSTRAINT "Tab_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
