-- CreateTable
CREATE TABLE "ApplicationCodeSequence" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "lastNumber" INTEGER NOT NULL DEFAULT 0,
    "lastYear" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationCodeSequence_pkey" PRIMARY KEY ("id")
);
