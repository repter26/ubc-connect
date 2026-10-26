import express from "express";
import cors from "cors";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { prisma } from "./db.js";
import { randomUUID } from "node:crypto";
import { membershipTask, publishMembers, registerMemberships } from "./memberships.js";
const AMS_DEFAULT_IMAGE =
  "https://amsclubs.ca/alma-mater-society/wp-content/uploads/sites/619/2024/09/Copy-of-AMS-Logo-Square-scaled.jpg";
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

io.on("connection", (socket) => {
  console.log(socket.id);

  // Temporary, self-reported identity for this connection until auth exists.
  socket.data.profile = { name: "Guest", avatar: "?", year: "" };
  socket.data.profileReady = false;
  // A per-tab anonymous identity survives refreshes; this is not authentication.
  const sessionId: unknown = socket.handshake.auth.sessionId;
  socket.data.senderId =
    typeof sessionId === "string" && /^[\da-f-]{36}$/i.test(sessionId)
      ? sessionId
      : randomUUID();
  const roomRequests = new Map<string, number>();
  registerMemberships(io, socket);

  socket.on("profile:update", (payload: unknown) => {
    if (!payload || typeof payload !== "object") return;
    if (!("name" in payload) || typeof payload.name !== "string") return;

    const name = payload.name.trim().slice(0, 80) || "Guest";
    const avatar =
      "avatar" in payload && typeof payload.avatar === "string"
        ? Array.from(payload.avatar.trim())[0]
        : undefined;

    socket.data.profile = {
      name,
      avatar: avatar || Array.from(name)[0] || "?",
      year: "year" in payload && typeof payload.year === "string" ? payload.year.trim().slice(0, 30) : "",
    };
    socket.data.profileReady = true;
    membershipTask(async () => {
      try {
        await prisma.membership.updateMany({
          where: { sessionId: socket.data.senderId }, data: socket.data.profile,
        });
        await publishMembers(io);
      } catch (error) {
        console.error("Failed to sync memberships:", error);
        socket.emit("chat:error", { message: "Could not load room members. Please reconnect and try again." });
      }
    });
  });

  socket.on("room:join", async (payload: unknown) => {
    if (!payload || typeof payload !== "object" || !("roomId" in payload)) return;
    const { roomId } = payload;
    if (typeof roomId !== "string" || !roomId) return;
    const requestId = (roomRequests.get(roomId) ?? 0) + 1;
    roomRequests.set(roomId, requestId);

    membershipTask(async () => {
      try {
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room || !socket.connected || roomRequests.get(roomId) !== requestId) return;
        const membership = await prisma.membership.findFirst({
          where: { roomId, sessionId: socket.data.senderId },
        });
        if (!membership || !socket.connected || roomRequests.get(roomId) !== requestId) return;
        await socket.join(`chat:${roomId}`);
        // Subscribe before reading so concurrent live messages cannot be missed.
        const messages = await prisma.message.findMany({
          where: { roomId },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        });
        if (roomRequests.get(roomId) === requestId && socket.rooms.has(`chat:${roomId}`)) {
          socket.emit("room:history", { roomId, messages });
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
        socket.emit("chat:error", { roomId, message: "Could not load chat history. Try rejoining the room." });
      }
    });
  });

  // This only unsubscribes the connection; saved membership is explicit.
  socket.on("room:leave", async (payload: unknown) => {
    if (!payload || typeof payload !== "object" || !("roomId" in payload)) return;
    const { roomId } = payload;
    if (typeof roomId !== "string" || !roomId) return;
    roomRequests.set(roomId, (roomRequests.get(roomId) ?? 0) + 1);

    await socket.leave(`chat:${roomId}`);
    console.log(`${socket.id} left chat:${roomId}`);
  });

  socket.on("message:send", async (payload: unknown) => {
    if (!payload || typeof payload !== "object") return;

    if (!("roomId" in payload) || !("text" in payload)) return;

    const { roomId, text } = payload;

    if (typeof roomId !== "string" || typeof text !== "string") return;

    const trimmedText = text.trim();
    if (!trimmedText) return;

    const channel = `chat:${roomId}`;

    // Only connections subscribed to this room may send to it.
    if (!socket.rooms.has(channel)) return;

    try {
      const member = await prisma.membership.findFirst({
        where: { roomId, sessionId: socket.data.senderId },
      });
      if (!member) return;
      const message = await prisma.message.create({
        data: {
          roomId,
          senderId: socket.data.senderId,
          senderName: socket.data.profile.name,
          senderAvatar: socket.data.profile.avatar,
          text: trimmedText,
        },
      });
      // Only display messages after they have been saved successfully.
      io.to(channel).emit("message:new", { roomId, message });
    } catch (error) {
      console.error("Failed to save chat message:", error);
      socket.emit("chat:error", { roomId, message: "Could not save your message. Please try again." });
    }
  });
});

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/events", async (_request, response) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        startsAt: "asc",
      },
      include: { rooms: true },
    });

    const results = events.map((event) => ({
      ...event,
      // Features we haven't built yet
      attendees: 0,
      going: [],
      matchScore: null,
      meetupPoint: null,
      transit: null,
    }));

    response.json(results);
  } catch (error) {
    console.error("Failed to retrieve events:", error);

    response.status(500).json({
      message: "Failed to retrieve events",
    });
  }
});

httpServer.listen(3000, () => {
  console.log("Backend running at http://localhost:3000");
});
