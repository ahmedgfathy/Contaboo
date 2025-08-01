/*
  Warnings:

  - A unique constraint covering the columns `[name_ar,name_en]` on the table `features` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "features_name_ar_name_en_key" ON "features"("name_ar", "name_en");
