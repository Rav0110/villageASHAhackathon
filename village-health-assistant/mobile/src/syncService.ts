import type { Alert, Patient, SyncPayload, Visit } from "./types";
import {
  countUnsyncedLocalData,
  loadAllLocalData,
  markAllLocalSynced,
  saveAlerts,
  savePatients,
  saveVisits,
} from "./storage";

const BACKEND_BASE_URL = "http://10.0.2.2:3000";

export function getBackendBaseUrl() {
  return BACKEND_BASE_URL;
}

export async function syncNow(): Promise<
  | { ok: true; synced: { patients: number; visits: number; alerts: number } }
  | { ok: false; message: string }
> {
  const { patients, visits, alerts } = await loadAllLocalData();

  const payload: SyncPayload = {
    patients: patients.filter((p) => !p.synced),
    visits: visits.filter((v) => !v.synced),
    alerts: alerts.filter((a) => !a.synced),
  };

  if (payload.patients.length === 0 && payload.visits.length === 0 && payload.alerts.length === 0) {
    return { ok: true, synced: { patients: 0, visits: 0, alerts: 0 } };
  }

  try {
    const resp = await fetch(`${BACKEND_BASE_URL}/api/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) throw new Error(`Backend sync failed: ${resp.status}`);

    await markAllLocalSynced();

    // Optional alignment: fetch backend data so supervisor/reports are consistent.
    // This keeps local lists accurate without relying on the mobile-generated alerts.
    try {
      const [pRes, vRes, aRes] = await Promise.all([
        fetch(`${BACKEND_BASE_URL}/api/patients`),
        fetch(`${BACKEND_BASE_URL}/api/visits`).catch(() => null),
        fetch(`${BACKEND_BASE_URL}/api/alerts`),
      ]);

      if (pRes && pRes.ok) {
        const nextPatients = (await pRes.json()) as Omit<Patient, "synced">[];
        await savePatients(
          nextPatients.map((p) => ({
            ...p,
            synced: true,
          }))
        );
      }
      if (vRes && vRes.ok) {
        const nextVisits = (await vRes.json()) as Omit<Visit, "synced">[];
        await saveVisits(
          nextVisits.map((v) => ({
            ...v,
            synced: true,
          }))
        );
      }
      if (aRes && aRes.ok) {
        const nextAlerts = (await aRes.json()) as Omit<Alert, "synced">[];
        await saveAlerts(
          nextAlerts.map((a) => ({
            ...a,
            synced: true,
          }))
        );
      }
    } catch {
      // If backend doesn't provide visits/alerts yet, still keep synced flags.
    }

    return {
      ok: true,
      synced: {
        patients: payload.patients.length,
        visits: payload.visits.length,
        alerts: payload.alerts.length,
      },
    };
  } catch {
    // Exact required message.
    return { ok: false, message: "Offline. Data saved locally." };
  }
}

