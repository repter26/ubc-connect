import type { Event } from "./types";

export interface PollOption {
  label: string;
  voters: string[];
}
export interface PollMessage {
  id: number;
  type: "poll";
  user: string;
  avatar: string;
  time: string;
  question: string;
  options: PollOption[];
}
export interface TextMessage {
  id: number;
  type: "text";
  user: string;
  avatar: string;
  text: string;
  time: string;
}
export interface SystemMessage {
  id: number;
  type: "system";
  text: string;
}
export type ChatItem = PollMessage | TextMessage | SystemMessage;

export interface Member {
  name: string;
  avatar: string;
  year: string;
  you?: boolean;
  trust?: "trusted" | "regular" | "caution" | "restricted";
  strikes?: number;
}

export interface ChatRoom {
  /** Frontend key; backendRoomId retains the event API room ID. */
  id: string;
  kind: "event" | "interest";
  backendRoomId?: string;
  eventId?: string;
  event?: Event;
  name: string;
  emoji: string;
  interest: string;
  capacity: number;
  description: string;
  members: Member[];
  chat: ChatItem[];
}
export type CoordinationType = "meetup" | "transport";
export type CoordinationVotes = Record<CoordinationType, Record<string, string[]>>;
