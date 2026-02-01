import { getIO as getIOFromServer } from "../http/server.ts";

export function getIO() {
  return getIOFromServer();
}
