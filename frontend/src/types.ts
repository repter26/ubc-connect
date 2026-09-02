export type View =
  | "landing"
  | "onboarding"
  | "feed"
  | "event"
  | "chats"
  | "profile";

export interface UserProfile {
  firstName: string;
  lastName: string;
  year: string;
  faculty: string;
  interests: string[];
  vibe: string;
  socialStyle: string;
}

export type EventSource = "ams" | "ubc" | "instagram" | "club-website";

export type EventAttendee = {
  name: string;
  avatar: string;
  mutual: boolean;
};

export type Event = {
  id: string;

  // Event information
  title: string;
  organizer: string;
  source: EventSource;
  category: string;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  location: string;
  address: string | null;
  imageUrl: string | null;
  tags: string[];
  description: string;
  sourceUrl: string;

  // UBC Connect information
  attendees: number;
  going: EventAttendee[];

  // Personalized information
  matchScore: number | null;

  // Group coordination
  meetupPoint: string | null;
  transit: string | null;
};
