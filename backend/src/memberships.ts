import type { Server, Socket } from "socket.io";
import { prisma } from "./db.js";

// Order snapshots and mutations so an older database read cannot overwrite a
// newer roster. Serializable transactions also protect capacity in the database.
let queue: Promise<unknown> = Promise.resolve();
export function membershipTask(task: () => Promise<void>) {
  queue = queue.then(task).catch((error) => console.error("Membership update failed:", error));
}

export async function publishMembers(io: Server, socket?: Socket) {
  const rooms = await prisma.room.findMany({
    select: { id: true, eventId: true, memberships: {
      orderBy: { id: "asc" },
      select: { sessionId: true, name: true, avatar: true, year: true },
    } },
  });
  const payload = { rooms: rooms.map(({ id, eventId, memberships }) => ({
    roomId: id, eventId, members: memberships,
  })) };
  if (socket) socket.emit("room:members", payload);
  else io.emit("room:members", payload);
}

type Reply = (result: { ok: boolean; message?: string }) => void;
export function registerMemberships(io: Server, socket: Socket) {
  function command(join: boolean, payload: unknown, reply?: Reply) {
    if (typeof reply !== "function") return;
    if (!payload || typeof payload !== "object" || !("roomId" in payload) || typeof payload.roomId !== "string") {
      reply({ ok: false, message: "Choose a valid room." });
      return;
    }
    const roomId = payload.roomId;
    membershipTask(async () => {
      try {
        for (let attempt = 0; ; attempt++) {
          try {
            await prisma.$transaction(async (db) => {
              const room = await db.room.findUnique({ where: { id: roomId } });
              if (!room) throw new Error("This room is no longer available.");
              const key = { sessionId: socket.data.senderId as string, eventId: room.eventId };
              if (!join) {
                await db.membership.deleteMany({ where: { ...key, roomId } });
                return;
              }
              if (!socket.data.profileReady) throw new Error("Complete your profile before joining a room.");
              const current = await db.membership.findUnique({ where: { sessionId_eventId: key } });
              if (current?.roomId === roomId) return;
              const count = await db.membership.count({ where: { roomId } });
              if (count >= room.capacity) throw new Error("This room is full. Choose another room.");
              await db.membership.upsert({
                where: { sessionId_eventId: key },
                create: { ...key, roomId, ...socket.data.profile },
                update: { roomId, ...socket.data.profile },
              });
            }, { isolationLevel: "Serializable" });
            break;
          } catch (error) {
            if (attempt < 2 && error && typeof error === "object" && "code" in error && error.code === "P2034") continue;
            throw error;
          }
        }
        // Remove obsolete chat subscriptions for all connections of this session.
        const memberships = await prisma.membership.findMany({ where: { sessionId: socket.data.senderId } });
        const allowed = new Set(memberships.map((member) => `chat:${member.roomId}`));
        for (const connection of io.sockets.sockets.values()) {
          if (connection.data.senderId !== socket.data.senderId) continue;
          for (const channel of connection.rooms) {
            if (channel.startsWith("chat:") && !allowed.has(channel)) await connection.leave(channel);
          }
        }
        await publishMembers(io);
        reply({ ok: true });
      } catch (error) {
        console.error("Membership command failed:", error);
        reply({ ok: false, message: error instanceof Error && !('code' in error)
          ? error.message : "Could not update your room. Please try again." });
      }
    });
  }
  socket.on("membership:join", (payload, reply) => command(true, payload, reply));
  socket.on("membership:leave", (payload, reply) => command(false, payload, reply));
}
