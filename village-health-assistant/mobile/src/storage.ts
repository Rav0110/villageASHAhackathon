import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Alert, Patient, Visit } from "./types";

const KEYS = {
  patients: "vha_patients",
  visits: "vha_visits",
  alerts: "vha_alerts",
} as const;

async function readJsonArray<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonArray<T>(key: string, value: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadPatients(): Promise<Patient[]> {
  return readJsonArray<Patient>(KEYS.patients);
}

export async function savePatients(patients: Patient[]): Promise<void> {
  await writeJsonArray(KEYS.patients, patients);
}

export async function loadVisits(): Promise<Visit[]> {
  return readJsonArray<Visit>(KEYS.visits);
}

export async function saveVisits(visits: Visit[]): Promise<void> {
  await writeJsonArray(KEYS.visits, visits);
}

export async function loadAlerts(): Promise<Alert[]> {
  return readJsonArray<Alert>(KEYS.alerts);
}

export async function saveAlerts(alerts: Alert[]): Promise<void> {
  await writeJsonArray(KEYS.alerts, alerts);
}

export async function loadAllLocalData(): Promise<{
  patients: Patient[];
  visits: Visit[];
  alerts: Alert[];
}> {
  const [patients, visits, alerts] = await Promise.all([
    loadPatients(),
    loadVisits(),
    loadAlerts(),
  ]);

  return { patients, visits, alerts };
}

export async function countUnsyncedLocalData(): Promise<{
  patients: number;
  visits: number;
  alerts: number;
  total: number;
}> {
  const [patients, visits, alerts] = await Promise.all([
    loadPatients(),
    loadVisits(),
    loadAlerts(),
  ]);

  const up = patients.filter((p) => !p.synced).length;
  const uv = visits.filter((v) => !v.synced).length;
  const ua = alerts.filter((a) => !a.synced).length;

  return { patients: up, visits: uv, alerts: ua, total: up + uv + ua };
}

export async function markAllLocalSynced(): Promise<void> {
  const [patients, visits, alerts] = await Promise.all([
    loadPatients(),
    loadVisits(),
    loadAlerts(),
  ]);

  const nextPatients = patients.map((p) => ({ ...p, synced: true }));
  const nextVisits = visits.map((v) => ({ ...v, synced: true }));
  const nextAlerts = alerts.map((a) => ({ ...a, synced: true }));

  await Promise.all([
    savePatients(nextPatients),
    saveVisits(nextVisits),
    saveAlerts(nextAlerts),
  ]);
}

export async function clearAllLocalData(): Promise<void> {
  // Clear only demo-local offline-first data (patients, visits, alerts).
  await Promise.all([
    AsyncStorage.removeItem(KEYS.patients),
    AsyncStorage.removeItem(KEYS.visits),
    AsyncStorage.removeItem(KEYS.alerts),
  ]);
}

