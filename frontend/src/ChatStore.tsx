import { useReducer, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChatContext } from "./chatContext";
import type { ChatStore } from "./chatContext";
import type { Event, UserProfile } from "./types";
import { useChatSockets } from "./useChatSockets";
import type { IncomingMessage } from "./useChatSockets";
import { mergeMessages } from "./chatMessages";
import type {
  ChatItem,
  ChatRoom,
  CoordinationType,
  CoordinationVotes,
  Member,
  TextMessage,
} from "./chatTypes";

interface State {
  joined: string[];
  activeId: string | null;
  messages: Record<string, ChatItem[]>;
  coordination: Record<string, CoordinationVotes>;
  members: Record<string, Member[]>;
  membershipReady: boolean;
}
type Action =
  | { type: "select"; id: string }
  | { type: "members"; members: Record<string, Member[]>; joined: string[] }
  | { type: "message"; id: string; message: ChatItem }
  | { type: "history"; id: string; messages: ChatItem[] }
  | { type: "vote"; id: string; itemId: number; option: string }
  | {
      type: "coordinate";
      id: string;
      category: CoordinationType;
      option: string;
    };

function toggleVote(options: Record<string, string[]>, selected: string) {
  const wasSelected = options[selected]?.includes("You");
  const next = Object.fromEntries(
    Object.entries(options).map(([key, voters]) => [
      key,
      voters.filter((v) => v !== "You"),
    ]),
  );
  next[selected] = wasSelected
    ? (next[selected] ?? [])
    : [...(next[selected] ?? []), "You"];
  return next;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select":
      return state.joined.includes(action.id)
        ? { ...state, activeId: action.id }
        : state;
    case "members": {
      return {
        ...state,
        members: action.members,
        joined: action.joined,
        membershipReady: true,
        activeId: state.activeId && action.joined.includes(state.activeId)
          ? state.activeId : action.joined[0] ?? null,
      };
    }
    case "message":
      if (!state.joined.includes(action.id)) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.id]: mergeMessages(state.messages[action.id] ?? [], [action.message]),
        },
      };
    case "history":
      if (!state.joined.includes(action.id)) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.id]: mergeMessages(state.messages[action.id] ?? [], action.messages),
        },
      };
    case "vote":
      if (!state.joined.includes(action.id)) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.id]: (state.messages[action.id] ?? []).map((item) => {
            if (
              item.type !== "poll" ||
              item.id !== action.itemId ||
              !item.options.some((o) => o.label === action.option)
            )
              return item;
            const votes = toggleVote(
              Object.fromEntries(item.options.map((o) => [o.label, o.voters])),
              action.option,
            );
            return {
              ...item,
              options: item.options.map((o) => ({
                ...o,
                voters: votes[o.label],
              })),
            };
          }),
        },
      };
    case "coordinate": {
      if (!state.joined.includes(action.id)) return state;
      const votes = state.coordination[action.id] ?? {
        meetup: {},
        transport: {},
      };
      return {
        ...state,
        coordination: {
          ...state.coordination,
          [action.id]: {
            ...votes,
            [action.category]: toggleVote(
              votes[action.category],
              action.option,
            ),
          },
        },
      };
    }
  }
}

interface ChatProviderProps {
  events: Event[];
  profile: UserProfile | null;
  children: ReactNode;
}

export function ChatProvider({ events, profile, children }: ChatProviderProps) {
  const nextMessageId = useRef(0);
  const membershipLock = useRef(false);
  const [membershipPending, setMembershipPending] = useState(false);
  const [membershipError, setMembershipError] = useState("");
  const [state, dispatch] = useReducer(reducer, {
    joined: [],
    activeId: null,
    messages: {},
    coordination: {},
    members: {},
    membershipReady: false,
  });

  const avatar = profile?.firstName?.[0] ?? "A";
  // Membership and chat history come from the backend.
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
    members: state.members[room.id] ?? [],
    chat: state.messages[room.id] ?? [],
  }));
  const joinedRooms = rooms.filter((room) => state.joined.includes(room.id));

  const backendRoomIds = joinedRooms
    .map((room) => room.backendRoomId)
    .filter((id): id is string => Boolean(id));

  function toTextMessage(message: IncomingMessage["message"], isMine: boolean): TextMessage {
    return {
      id: message.id,
      type: "text",
      user: isMine ? "You" : message.senderName,
      avatar: message.senderAvatar,
      text: message.text,
      createdAt: message.createdAt,
      time: new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  const { sendMessage, updateMembership } = useChatSockets(
    backendRoomIds,
    profile ? { name: profile.firstName.trim() || "Guest", avatar, year: profile.year } : null,
    ({ roomId, message }, isMine) => {
      const room = joinedRooms.find((room) => room.backendRoomId === roomId);

      if (!room) return;

      dispatch({
        type: "message",
        id: room.id,
        message: toTextMessage(message, isMine),
      });
    },
    ({ roomId, messages }, senderId) => {
      const room = joinedRooms.find((room) => room.backendRoomId === roomId);
      if (!room) return;
      dispatch({
        type: "history",
        id: room.id,
        messages: messages.map((message) =>
          toTextMessage(message, message.senderId === senderId),
        ),
      });
    },
    ({ rooms: snapshots }, sessionId) => {
      if (!profile) return;
      const members: Record<string, Member[]> = {};
      const joined: string[] = [];
      for (const room of snapshots) {
        const id = `event:${room.eventId}:${room.roomId}`;
        members[id] = room.members.map((member) => ({
          ...member, you: member.sessionId === sessionId,
          name: member.sessionId === sessionId ? "You" : member.name,
        }));
        if (members[id].some((member) => member.you)) joined.push(id);
      }
      dispatch({ type: "members", members, joined });
    },
    setMembershipError,
  );
  const activeId = joinedRooms.some((room) => room.id === state.activeId)
    ? state.activeId
    : (joinedRooms[0]?.id ?? null);
  const messageId = () => {
    nextMessageId.current = Math.max(Date.now(), nextMessageId.current + 1);
    return nextMessageId.current;
  };
  async function changeMembership(id: string, join: boolean): Promise<boolean> {
    if (membershipLock.current) return false;
    const room = rooms.find((room) => room.id === id);
    if (!room?.backendRoomId) return false;
    membershipLock.current = true;
    setMembershipPending(true);
    setMembershipError("");
    try {
      await updateMembership(join ? "membership:join" : "membership:leave", room.backendRoomId);
      if (join) dispatch({ type: "select", id });
      return true;
    } catch (error) {
      setMembershipError(error instanceof Error ? error.message : "Could not update your room.");
      return false;
    } finally {
      membershipLock.current = false;
      setMembershipPending(false);
    }
  }
  const value: ChatStore = {
    rooms,
    joinedRooms,
    activeId,
    membershipPending: membershipPending || !state.membershipReady,
    coordination: state.coordination,
    selectRoom: (id) => dispatch({ type: "select", id }),
    joinRoom: (id) => changeMembership(id, true),
    leaveRoom: (id) => changeMembership(id, false),
    sendText: (id, text) => {
      if (!text.trim()) return;

      const room = joinedRooms.find((room) => room.id === id);
      if (!room?.backendRoomId) return;

      sendMessage(room.backendRoomId, text);
    },
    sendPoll: (id, template) =>
      dispatch({
        type: "message",
        id,
        message: {
          id: messageId(),
          type: "poll",
          user: "You",
          avatar,
          time: "Just now",
          question: template.question,
          options: template.options.map((label) => ({ label, voters: [] })),
        },
      }),
    votePoll: (id, itemId, option) =>
      dispatch({ type: "vote", id, itemId, option }),
    voteCoordination: (id, category, option) =>
      dispatch({ type: "coordinate", id, category, option }),
  };
  return <ChatContext.Provider value={value}>
    {membershipError && <div role="alert" className="bg-red-50 text-red-700 px-4 py-3 flex items-center justify-between gap-4">
      <span>{membershipError}</span>
      <button onClick={() => setMembershipError("")} aria-label="Dismiss error">×</button>
    </div>}
    {children}
  </ChatContext.Provider>;
}
