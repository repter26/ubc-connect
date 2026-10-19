import { useReducer, useRef } from "react";
import type { ReactNode } from "react";
import { ChatContext } from "./chatContext";
import type { ChatStore } from "./chatContext";
import type { Event, UserProfile } from "./types";
import type {
  ChatItem, ChatRoom, CoordinationType, CoordinationVotes, Member,
} from "./chatTypes";

interface State {
  joined: string[];
  activeId: string | null;
  messages: Record<string, ChatItem[]>;
  coordination: Record<string, CoordinationVotes>;
  going: Record<string, boolean>;
}
type Action =
  | { type: "select"; id: string }
  | { type: "join"; room: ChatRoom; rooms: ChatRoom[] }
  | { type: "leave"; room: ChatRoom }
  | { type: "message"; id: string; message: ChatItem }
  | { type: "vote"; id: string; itemId: number; option: string }
  | { type: "coordinate"; id: string; category: CoordinationType; option: string }
  | { type: "attendance"; eventId: string };

function toggleVote(options: Record<string, string[]>, selected: string) {
  const wasSelected = options[selected]?.includes("You");
  const next = Object.fromEntries(
    Object.entries(options).map(([key, voters]) => [
      key, voters.filter((v) => v !== "You"),
    ]),
  );
  next[selected] = wasSelected
    ? next[selected] ?? []
    : [...(next[selected] ?? []), "You"];
  return next;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select":
      return state.joined.includes(action.id)
        ? { ...state, activeId: action.id }
        : state;
    case "join": {
      const room = action.room;
      if (state.joined.includes(room.id)) return { ...state, activeId: room.id };
      if (room.members.length >= room.capacity) return state;
      const replaced = new Set(
        action.rooms.filter((r) =>
          room.kind === "event" && r.kind === "event" && r.eventId === room.eventId,
        ).map((r) => r.id),
      );
      return {
        ...state,
        joined: [...state.joined.filter((id) => !replaced.has(id)), room.id],
        activeId: room.id,
        going: room.eventId ? { ...state.going, [room.eventId]: true } : state.going,
      };
    }
    case "leave": {
      if (!state.joined.includes(action.room.id)) return state;
      const joined = state.joined.filter((id) => id !== action.room.id);
      return {
        ...state,
        joined,
        activeId: state.activeId === action.room.id
          ? joined[0] ?? null
          : state.activeId,
        going: action.room.eventId
          ? { ...state.going, [action.room.eventId]: false }
          : state.going,
      };
    }
    case "message":
      if (!state.joined.includes(action.id)) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.id]: [...(state.messages[action.id] ?? []), action.message],
        },
      };
    case "vote":
      if (!state.joined.includes(action.id)) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.id]: (state.messages[action.id] ?? []).map((item) => {
            if (item.type !== "poll" || item.id !== action.itemId ||
              !item.options.some((o) => o.label === action.option)) return item;
            const votes = toggleVote(
              Object.fromEntries(item.options.map((o) => [o.label, o.voters])),
              action.option,
            );
            return {
              ...item,
              options: item.options.map((o) => ({ ...o, voters: votes[o.label] })),
            };
          }),
        },
      };
    case "coordinate": {
      if (!state.joined.includes(action.id)) return state;
      const votes = state.coordination[action.id] ?? { meetup: {}, transport: {} };
      return {
        ...state,
        coordination: {
          ...state.coordination,
          [action.id]: {
            ...votes,
            [action.category]: toggleVote(votes[action.category], action.option),
          },
        },
      };
    }
    case "attendance":
      return {
        ...state,
        going: { ...state.going, [action.eventId]: !state.going[action.eventId] },
      };
  }
}

interface ChatProviderProps {
  events: Event[];
  profile: UserProfile | null;
  children: ReactNode;
}

export function ChatProvider({ events, profile, children }: ChatProviderProps) {
  const nextMessageId = useRef(0);
  const [state, dispatch] = useReducer(reducer, {
    joined: [],
    activeId: null,
    messages: {},
    coordination: {},
    going: {},
  });
  const me: Member = {
    name: "You",
    avatar: profile?.firstName?.[0] ?? "A",
    year: profile?.year ?? "3rd",
    you: true,
  };
  // Event metadata comes from the events API; membership and chat are local
  // until backend integration. Keep the original room ID for that integration.
  const eventRooms: ChatRoom[] = events.flatMap((event) =>
    (event.rooms ?? []).map((room) => ({
      id: `event:${event.id}:${room.id}`,
      backendRoomId: room.id,
      kind: "event",
      eventId: event.id,
      event,
      name: room.name,
      emoji: "📅",
      interest: event.category,
      capacity: room.capacity,
      description: `Meet up for ${event.title}`,
      members: [],
      chat: [],
    })),
  );
  const rooms = eventRooms.map((room) => ({
    ...room,
    members: [
      ...room.members.filter((member) => !member.you),
      ...(state.joined.includes(room.id) ? [me] : []),
    ],
    chat: state.messages[room.id] ?? [],
  }));
  const joinedRooms = rooms.filter((room) => state.joined.includes(room.id));
  const activeId = joinedRooms.some((room) => room.id === state.activeId)
    ? state.activeId
    : joinedRooms[0]?.id ?? null;
  const messageId = () => {
    nextMessageId.current = Math.max(Date.now(), nextMessageId.current + 1);
    return nextMessageId.current;
  };
  const value: ChatStore = {
    rooms,
    joinedRooms,
    activeId,
    going: state.going,
    coordination: state.coordination,
    selectRoom: (id) => dispatch({ type: "select", id }),
    joinRoom: (id) => {
      const room = rooms.find((r) => r.id === id);
      if (!room || (!state.joined.includes(id) && room.members.length >= room.capacity)) {
        return false;
      }
      dispatch({ type: "join", room, rooms });
      return true;
    },
    leaveRoom: (id) => {
      const room = rooms.find((r) => r.id === id);
      if (room) dispatch({ type: "leave", room });
    },
    sendText: (id, text) => {
      if (!text.trim()) return;
      dispatch({
        type: "message", id,
        message: {
          id: messageId(), type: "text", user: "You", avatar: me.avatar,
          text: text.trim(), time: "Just now",
        },
      });
    },
    sendPoll: (id, template) => dispatch({
      type: "message", id,
      message: {
        id: messageId(), type: "poll", user: "You", avatar: me.avatar,
        time: "Just now", question: template.question,
        options: template.options.map((label) => ({ label, voters: [] })),
      },
    }),
    votePoll: (id, itemId, option) => dispatch({ type: "vote", id, itemId, option }),
    voteCoordination: (id, category, option) =>
      dispatch({ type: "coordinate", id, category, option }),
    toggleAttendance: (eventId) => dispatch({ type: "attendance", eventId }),
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
