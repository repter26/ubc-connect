import type { ChatItem } from "./chatTypes";

// History may overlap messages received live while the database was read.
export function mergeMessages(existing: ChatItem[], incoming: ChatItem[]) {
  const messages = new Map<string | number, ChatItem>();
  for (const item of [...existing, ...incoming]) messages.set(item.id, item);
  const timestamp = (item: ChatItem) =>
    item.type === "text" && item.createdAt
      ? Date.parse(item.createdAt)
      : typeof item.id === "number" ? item.id : 0;
  return [...messages.values()].sort((a, b) => timestamp(a) - timestamp(b));
}
