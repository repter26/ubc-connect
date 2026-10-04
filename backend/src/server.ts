import express from "express";
import cors from "cors";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import { prisma } from "./db.js";
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
  socket.on("message", (data) => {
    console.log("Received message:", data);
    socket.broadcast.emit("message", data);
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
