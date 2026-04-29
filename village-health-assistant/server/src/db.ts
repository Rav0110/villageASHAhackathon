// These shims avoid requiring `@types/node` for the hackathon boilerplate.
// Install real Node types in a production project.
// @ts-ignore
import fs from "fs";
// @ts-ignore
import path from "path";
import type { Alert, Database, Patient, SyncPayload, Visit } from "./types";

declare const __dirname: string;

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

function ensureDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function readDb(): Database {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    return { patients: [], visits: [], alerts: [] };
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  if (!raw.trim()) return { patients: [], visits: [], alerts: [] };
  return JSON.parse(raw) as Database;
}

export function writeDb(db: Database) {
  ensureDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

function upsertById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of existing) map.set(item.id, item);
  for (const item of incoming) map.set(item.id, item);
  return Array.from(map.values());
}

export function upsertFromSyncPayload(payload: SyncPayload): { counts: { patients: number; visits: number; alerts: number } } {
  const db = readDb();

  const patients = upsertById<Patient>(db.patients, payload.patients);
  const visits = upsertById<Visit>(db.visits, payload.visits);
  const alerts = upsertById<Alert>(db.alerts, payload.alerts);

  const next: Database = { patients, visits, alerts };
  writeDb(next);

  return {
    counts: {
      patients: payload.patients.length,
      visits: payload.visits.length,
      alerts: payload.alerts.length,
    },
  };
}

