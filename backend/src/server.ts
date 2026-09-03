import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();

const event: Event = {
  id: "1",
  title: "AMS Clubs Days Spring 2025",
  organizer: "AMS UBC",
  source: "ams",
  category: "Social",

  startsAt: "2025-02-18T10:00:00-08:00",
  endsAt: "2025-02-18T16:00:00-08:00",
  timezone: "America/Vancouver",

  location: "Main Mall, UBC",
  address: "Main Mall, Vancouver, BC V6T 1Z4",

  imageUrl: "photo-1523580494863-6f3031224c94",
  tags: ["free", "clubs", "networking"],

  description:
    "Meet over 200 student clubs at UBC's biggest clubs showcase of the year.",

  sourceUrl: "https://www.ams.ubc.ca/events/",

  attendees: 847,

  going: [
    { name: "Priya S.", avatar: "P", mutual: true },
    { name: "Marcus W.", avatar: "M", mutual: true },
    { name: "Jamie L.", avatar: "J", mutual: false },
    { name: "Aisha K.", avatar: "A", mutual: false },
  ],

  matchScore: 95,

  meetupPoint: "Main Library steps (north entrance)",
  transit: "UBC Bus Loop → walk 5 min south on Main Mall",
};

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/events", (_request, response) => {
  response.json([event]);
});

app.listen(3000, () => {
  console.log("Backend running at http://localhost:3000");
});
