import type { Patient, ReportSummary } from "./types";
import { computeLocalReportSummary } from "./riskRules";

export function generateGovernmentReportText(patients: Patient[]): string {
  const summary: ReportSummary = computeLocalReportSummary(patients);
  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return [
    "==============================",
    "GOVERNMENT HEALTH SUMMARY REPORT",
    `Generated: ${date}`,
    "National Health Mission (NHM)",
    "==============================",
    `Total Patients Registered  : ${summary.totalPatients}`,
    `Pregnant Patients          : ${summary.pregnantPatients}`,
    `High-Risk Pregnancy Cases  : ${summary.highRiskPregnancyCases}`,
    `TB Suspected Cases         : ${summary.tbSuspectedCases}`,
    `Vaccination Pending/Missed : ${summary.vaccinationPendingCases}`,
    "==============================",
  ].join("\n");
}

export function generateGovernmentReportJson(patients: Patient[]) {
  const summary: ReportSummary = computeLocalReportSummary(patients);
  return {
    generatedAt: Date.now(),
    summary,
  };
}

