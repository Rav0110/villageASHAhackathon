import type { Patient, ReportSummary } from "./types";
import { computeLocalReportSummary } from "./riskRules";

function formatLine(label: string, value: number) {
  return `${label}: ${value}`;
}

export function generateGovernmentReportText(patients: Patient[]): string {
  const summary: ReportSummary = computeLocalReportSummary(patients);

  return [
    "Government Summary Report",
    formatLine("Total patients", summary.totalPatients),
    formatLine("Pregnant patients", summary.pregnantPatients),
    formatLine("High-risk pregnancy cases", summary.highRiskPregnancyCases),
    formatLine("TB suspected cases", summary.tbSuspectedCases),
    formatLine("Vaccination pending cases", summary.vaccinationPendingCases),
  ].join("\n");
}

export function generateGovernmentReportJson(patients: Patient[]) {
  const summary: ReportSummary = computeLocalReportSummary(patients);
  return {
    generatedAt: Date.now(),
    summary,
  };
}

