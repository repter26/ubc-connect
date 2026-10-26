CREATE TABLE "Membership" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "avatar" TEXT NOT NULL,
  "year" TEXT NOT NULL,
  CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Membership_sessionId_eventId_key" ON "Membership"("sessionId", "eventId");
CREATE INDEX "Membership_roomId_idx" ON "Membership"("roomId");
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
