import { createContext, useContext } from "react";
import type { ChatRoom, CoordinationType, CoordinationVotes } from "./chatTypes";

export interface ChatStore {
  rooms: ChatRoom[];
  joinedRooms: ChatRoom[];
  activeId: string | null;
  membershipPending: boolean;
  coordination: Record<string, CoordinationVotes>;
  selectRoom: (id: string) => void;
  joinRoom: (id: string) => Promise<boolean>;
  leaveRoom: (id: string) => Promise<boolean>;
  sendText: (id: string, text: string) => void;
  sendPoll: (id: string, template: { question: string; options: string[] }) => void;
  votePoll: (id: string, itemId: number, option: string) => void;
  voteCoordination: (id: string, category: CoordinationType, option: string) => void;
}
export const ChatContext = createContext<ChatStore | null>(null);

export function useChatStore() {
  const store = useContext(ChatContext);
  if (!store) throw new Error("useChatStore requires ChatProvider");
  return store;
}
