import { createContext, useContext } from "react";
import type { ChatRoom, CoordinationType, CoordinationVotes } from "./chatTypes";

export interface ChatStore {
  rooms: ChatRoom[];
  joinedRooms: ChatRoom[];
  activeId: string | null;
  going: Record<string, boolean>;
  coordination: Record<string, CoordinationVotes>;
  selectRoom: (id: string) => void;
  joinRoom: (id: string) => boolean;
  leaveRoom: (id: string) => void;
  sendText: (id: string, text: string) => void;
  sendPoll: (id: string, template: { question: string; options: string[] }) => void;
  votePoll: (id: string, itemId: number, option: string) => void;
  voteCoordination: (id: string, category: CoordinationType, option: string) => void;
  toggleAttendance: (eventId: string) => void;
}
export const ChatContext = createContext<ChatStore | null>(null);

export function useChatStore() {
  const store = useContext(ChatContext);
  if (!store) throw new Error("useChatStore requires ChatProvider");
  return store;
}
