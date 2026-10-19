/** Target server URL — overridden via LOAD_TARGET in Docker. */
export const BASE_URL = process.env.LOAD_TARGET ?? "http://localhost:3000";
