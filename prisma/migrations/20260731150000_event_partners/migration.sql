-- CreateTable: implicit many-to-many join table between CommunityEvent and
-- BrandPartner, so each event can select its own subset of community
-- partners instead of always showing the full site-wide list.
CREATE TABLE "_EventPartners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EventPartners_AB_unique" ON "_EventPartners"("A", "B");

-- CreateIndex
CREATE INDEX "_EventPartners_B_index" ON "_EventPartners"("B");

-- AddForeignKey
ALTER TABLE "_EventPartners" ADD CONSTRAINT "_EventPartners_A_fkey" FOREIGN KEY ("A") REFERENCES "BrandPartner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventPartners" ADD CONSTRAINT "_EventPartners_B_fkey" FOREIGN KEY ("B") REFERENCES "CommunityEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
