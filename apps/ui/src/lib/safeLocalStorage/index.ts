import { JsonParseError, JsonStringifyError } from "../errors";

export const safeLocalStorage = {
  get<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new JsonParseError({ caller: "safeLocalStorage.get", rawValue: raw });
    }
  },

  set<T>(key: string, data: T): void {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
    } catch {
      throw new JsonStringifyError({ caller: "safeLocalStorage.set" });
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },
};
