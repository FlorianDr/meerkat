import { WSContext } from "@hono/hono/ws";

export const roomMap = new Map<string, Set<WSContext>>();

export const broadcast = (
  room: string,
  data: string | Record<string, unknown>,
) => {
  const set = roomMap.get(room);
  if (set) {
    for (const ws of set) {
      ws.send(JSON.stringify(data));
    }
  }
};

export const join = (room: string, ws: WSContext) => {
  const set = roomMap.get(room) ?? new Set<WSContext>();
  set.add(ws);
  roomMap.set(room, set);
};

export const leave = (room: string, ws: WSContext) => {
  const set = roomMap.get(room);
  if (set) {
    set.delete(ws);
  }
};

export const shutdown = () => {
  for (const set of roomMap.values()) {
    for (const ws of set) {
      ws.close();
    }
  }
};
