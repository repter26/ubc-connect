import { useCallback, useEffect, useEffectEvent, useRef } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

interface SocketProfile {
  name: string;
  avatar: string;
  year: string;
}

export interface RoomMembers {
  rooms: {
    roomId: string;
    eventId: string;
    members: { sessionId: string; name: string; avatar: string; year: string }[];
  }[];
}

export interface IncomingMessage {
  roomId: string;
  message: {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    text: string;
    createdAt: string;
  };
}
export interface RoomHistory {
  roomId: string;
  messages: IncomingMessage["message"][];
}
export function useChatSockets(
  roomIds: string[],
  profile: SocketProfile | null,
  onMessage: (payload: IncomingMessage, isMine: boolean) => void,
  onHistory: (payload: RoomHistory, senderId: string) => void,
  onMembers: (payload: RoomMembers, sessionId: string) => void,
  onError: (message: string) => void,
) {
  const name = profile?.name;
  const avatar = profile?.avatar;
  const year = profile?.year;
  const handleMessage = useEffectEvent(
    (payload: IncomingMessage, isMine: boolean) => {
      onMessage(payload, isMine);
    },
  );
  const socketRef = useRef<Socket | null>(null);
  const subscribedRooms = useRef(new Set<string>());
  const handleHistory = useEffectEvent(onHistory);
  const handleMembers = useEffectEvent(onMembers);
  const handleError = useEffectEvent(onError);
  const roomIdsKey = JSON.stringify([...new Set(roomIds)].sort());

  useEffect(() => {
    let sessionId = sessionStorage.getItem("chat:sessionId");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem("chat:sessionId", sessionId);
    }
    const socket = io(import.meta.env.VITE_API_URL, {
      autoConnect: false,
      auth: { sessionId },
    });

    socketRef.current = socket;

    function handleConnect() {
      console.log("Chat connected:", socket.id);
    }

    function handleConnectError(error: Error) {
      console.error("Chat connection failed:", error.message);
    }

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);

    function handleNewMessage(payload: IncomingMessage) {
      const isMine = payload.message.senderId === sessionId;
      handleMessage(payload, isMine);
    }

    function handleRoomHistory(payload: RoomHistory) {
      handleHistory(payload, sessionId!);
    }

    function handleChatError(payload: { message: string }) {
      handleError(payload.message);
    }

    function handleRoomMembers(payload: RoomMembers) {
      handleMembers(payload, sessionId!);
    }

    socket.on("message:new", handleNewMessage);
    socket.on("room:history", handleRoomHistory);
    socket.on("chat:error", handleChatError);
    socket.on("room:members", handleRoomMembers);
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("message:new", handleNewMessage);
      socket.off("room:history", handleRoomHistory);
      socket.off("chat:error", handleChatError);
      socket.off("room:members", handleRoomMembers);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Register the profile before joining rooms, including after reconnecting.
  // This also handles onboarding completing after the socket first connects.
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    function updateProfile() {
      if (name !== undefined) socket!.emit("profile:update", { name, avatar, year });
    }

    socket.on("connect", updateProfile);
    if (socket.connected) updateProfile();

    return () => {
      socket.off("connect", updateProfile);
    };
  }, [name, avatar, year]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const subscribedRoomIds: string[] = JSON.parse(roomIdsKey);
    const nextRooms = new Set(subscribedRoomIds);

    function joinRooms() {
      for (const roomId of subscribedRoomIds) {
        socket!.emit("room:join", { roomId });
      }
    }

    // Runs after both initial connection and reconnection.
    socket.on("connect", joinRooms);

    // Update only changed subscriptions; adding a room should not interrupt
    // messages in rooms this connection already belongs to.
    if (socket.connected) {
      for (const roomId of subscribedRooms.current) {
        if (!nextRooms.has(roomId)) socket.emit("room:leave", { roomId });
      }
      for (const roomId of nextRooms) {
        if (!subscribedRooms.current.has(roomId)) socket.emit("room:join", { roomId });
      }
    }
    subscribedRooms.current = nextRooms;

    return () => {
      socket.off("connect", joinRooms);

    };
  }, [roomIdsKey]);

  const sendMessage = useCallback((roomId: string, text: string) => {
    const socket = socketRef.current;
    const trimmedText = text.trim();

    if (!socket?.connected || !trimmedText) return false;

    socket.emit("message:send", {
      roomId,
      text: trimmedText,
    });

    return true;
  }, []);

  const updateMembership = useCallback(async (event: "membership:join" | "membership:leave", roomId: string) => {
    const socket = socketRef.current;
    if (!socket?.connected) throw new Error("You’re offline. Reconnect before changing rooms.");
    let result: { ok: boolean; message?: string };
    try {
      result = await socket.timeout(10000).emitWithAck(event, { roomId });
    } catch {
      throw new Error("Room update was not confirmed. Reconnect to check your membership before trying again.");
    }
    if (!result.ok) throw new Error(result.message || "Could not update your room.");
  }, []);

  return { sendMessage, updateMembership };
}
