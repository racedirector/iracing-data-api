import { readFileSync, writeFileSync, existsSync } from "node:fs";
import type { GetOptions, Key, SimpleStore, Value } from "./index";

/**
 * A minimal disk-backed implementation of the {@link SimpleStore} interface.
 *
 * Persists a JSON object mapping keys to values at the provided file path.
 *
 * The entire store is read once at initialization and rewritten after any
 * mutation (`set`, `del`, `clear`).
 */
export class DiskStore<K extends Key = string, V extends Value = Value>
  implements SimpleStore<K, V>
{
  private state = new Map<K, V>();
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.load();
  }

  /** Load existing state from disk if present. */
  private load() {
    if (!existsSync(this.filePath)) return;

    try {
      const raw = readFileSync(this.filePath, "utf8");
      const data = JSON.parse(raw) as Record<string, V>;

      for (const [k, v] of Object.entries(data)) {
        // cast key because JSON keys are always strings
        this.state.set(k as K, v);
      }
    } catch (err) {
      console.warn(
        `[SimpleDiskStorage] Failed to load store from "${this.filePath}":`,
        err
      );
    }
  }

  /** Persist state to disk as a plain JSON object. */
  private persist() {
    try {
      const obj: Record<string, V> = {};
      for (const [k, v] of this.state.entries()) {
        obj[String(k)] = v;
      }
      writeFileSync(this.filePath, JSON.stringify(obj, null, 2), "utf8");
    } catch (err) {
      console.warn(
        `[SimpleDiskStorage] Failed to persist store to "${this.filePath}":`,
        err
      );
    }
  }

  get(key: K, _options?: GetOptions) {
    return this.state.get(key);
  }

  set(key: K, value: V) {
    this.state.set(key, value);
    this.persist();
  }

  del(key: K) {
    this.state.delete(key);
    this.persist();
  }

  clear() {
    this.state.clear();
    this.persist();
  }
}
