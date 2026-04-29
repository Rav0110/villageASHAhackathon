import express from "express";
import cors from "cors";
import { computeReportSummary, generateAlertsForPatient } from "./riskRules";
import { readDb, upsertFromSyncPayload, writeDb } from "./db";
import type { SyncPayload } from "./types";
import type { Alert } from "./types";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/sync", (req, res) => {
  const payload = req.body as Partial<SyncPayload>;

  if (!payload || !Array.isArray(payload.patients) || !Array.isArray(payload.visits) || !Array.isArray(payload.alerts)) {
    res.status(400).json({ error: "Invalid payload. Expected patients, visits, alerts arrays." });
    return;
  }

  // Upsert raw payload into the JSON DB.
  const result = upsertFromSyncPayload(payload as SyncPayload);

  // Optional safety: ensure alerts are consistent with patients (minimal re-generation).
  // This keeps supervisor reports aligned even if mobile missed regeneration.
  const db = readDb();
  const regenerated: Alert[] = [];
  for (const patient of db.patients) regenerated.push(...generateAlertsForPatient(patient));
  // Store regenerated alerts (unique by id handled by upsert, but here we just overwrite).
  // Minimal: we keep the alert objects computed by the rules.
  const nextDb = { ...db, alerts: regenerated };
  writeDb(nextDb);

  res.json({ ok: true, ...result, alertsRegenerated: regenerated.length });
});

app.get("/api/patients", (_req, res) => {
  const db = readDb();
  res.json(db.patients);
});

app.get("/api/alerts", (_req, res) => {
  const db = readDb();
  res.json(db.alerts);
});

app.get("/api/reports/summary", (_req, res) => {
  const db = readDb();
  const summary = computeReportSummary(db.patients);
  res.json(summary);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Village Health Assistant backend running on http://localhost:${PORT}`);
});

