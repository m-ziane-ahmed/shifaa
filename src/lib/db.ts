import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "store");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readStore<T>(file: string, fallback: T): T {
  ensureDir();
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) {
    writeStore(file, fallback);
    return fallback;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(file: string, data: T): void {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), "utf-8");
}

export function updateStore<T>(file: string, fallback: T, updater: (data: T) => T): T {
  const current = readStore(file, fallback);
  const next = updater(current);
  writeStore(file, next);
  return next;
}
