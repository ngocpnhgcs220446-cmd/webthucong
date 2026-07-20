/*
  Warnings:

  - You are about to drop the column `image` on the `Service` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "price" TEXT,
    "duration" TEXT,
    "groupSize" TEXT,
    "location" TEXT,
    "timeSlots" TEXT,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "gallery" TEXT NOT NULL,
    "highlights" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "includes" TEXT NOT NULL,
    "suitableFor" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "minGuests" INTEGER,
    "maxGuests" INTEGER,
    "defaultEstimatedPrice" REAL,
    "groupName" TEXT,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "freeCancellation" BOOLEAN NOT NULL DEFAULT true,
    "cancellationPolicy" TEXT,
    "reserveNowPayLater" BOOLEAN NOT NULL DEFAULT true,
    "reservePolicy" TEXT,
    "availabilityNote" TEXT,
    "instructorDescription" TEXT,
    "languages" TEXT,
    "wheelchairAccessible" BOOLEAN NOT NULL DEFAULT false,
    "smallGroup" BOOLEAN NOT NULL DEFAULT false,
    "groupLimit" INTEGER,
    "excludes" TEXT,
    "notAllowed" TEXT,
    "whatToBring" TEXT,
    "knowBeforeYouGo" TEXT,
    "experienceTags" TEXT,
    "bookingTags" TEXT,
    "priorityTags" TEXT,
    "meetingPointTitle" TEXT,
    "meetingPointDescription" TEXT,
    "googleMapsUrl" TEXT,
    "mapEmbed" TEXT,
    "rating" REAL NOT NULL DEFAULT 5.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Service" ("active", "availabilityNote", "bookingTags", "cancellationPolicy", "category", "createdAt", "defaultEstimatedPrice", "description", "duration", "excludes", "experienceTags", "featured", "freeCancellation", "fullDescription", "gallery", "googleMapsUrl", "groupLimit", "groupName", "groupSize", "highlights", "id", "includes", "instructorDescription", "knowBeforeYouGo", "languages", "location", "mapEmbed", "maxGuests", "meetingPointDescription", "meetingPointTitle", "minGuests", "notAllowed", "price", "priorityTags", "rating", "reserveNowPayLater", "reservePolicy", "reviewCount", "shortDescription", "slug", "smallGroup", "sortOrder", "subtitle", "suitableFor", "timeSlots", "title", "updatedAt", "whatToBring", "wheelchairAccessible") SELECT "active", "availabilityNote", "bookingTags", "cancellationPolicy", "category", "createdAt", "defaultEstimatedPrice", "description", "duration", "excludes", "experienceTags", "featured", "freeCancellation", "fullDescription", "gallery", "googleMapsUrl", "groupLimit", "groupName", "groupSize", "highlights", "id", "includes", "instructorDescription", "knowBeforeYouGo", "languages", "location", "mapEmbed", "maxGuests", "meetingPointDescription", "meetingPointTitle", "minGuests", "notAllowed", "price", "priorityTags", "rating", "reserveNowPayLater", "reservePolicy", "reviewCount", "shortDescription", "slug", "smallGroup", "sortOrder", "subtitle", "suitableFor", "timeSlots", "title", "updatedAt", "whatToBring", "wheelchairAccessible" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
