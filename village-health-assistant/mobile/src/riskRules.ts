import type { Alert, AlertSeverity, AlertType, Patient, ReportSummary } from "./types";

const HIGH_RISK_PREGNANCY_BP_SYSTOLIC = 140;
const HIGH_RISK_PREGNANCY_BP_DIASTOLIC = 90;

function mkAlert(args: {
  patient: Patient;
  type: AlertType;
  severity: AlertSeverity;
}): Alert {
  return {
    id: `${args.patient.id}:${args.type}:${args.severity}`,
    patientId: args.patient.id,
    patientName: args.patient.name,
    type: args.type,
    severity: args.severity,
    status: "generated",
    synced: false,
    createdAt: Date.now(),
  };
}

export function generateAlertsForPatient(patient: Patient): Alert[] {
  const alerts: Alert[] = [];

  if (patient.pregnancyStatus === true) {
    if (
      patient.systolicBP >= HIGH_RISK_PREGNANCY_BP_SYSTOLIC ||
      patient.diastolicBP >= HIGH_RISK_PREGNANCY_BP_DIASTOLIC
    ) {
      alerts.push(
        mkAlert({
          patient,
          type: "High Risk Pregnancy",
          severity: "High",
        })
      );
    }
  }

  if (patient.tbSymptoms === true) {
    alerts.push(
      mkAlert({
        patient,
        type: "TB Follow-up Required",
        severity: "Medium",
      })
    );
  }

  if (patient.vaccinationStatus === "pending" || patient.vaccinationStatus === "missed") {
    alerts.push(
      mkAlert({
        patient,
        type: "Vaccination Pending",
        severity: "Medium",
      })
    );
  }

  return alerts;
}

export function computeLocalReportSummary(patients: Patient[]): ReportSummary {
  const totalPatients = patients.length;
  const pregnantPatients = patients.filter((p) => p.pregnancyStatus === true).length;
  const highRiskPregnancyCases = patients.filter(
    (p) =>
      p.pregnancyStatus === true &&
      (p.systolicBP >= HIGH_RISK_PREGNANCY_BP_SYSTOLIC ||
        p.diastolicBP >= HIGH_RISK_PREGNANCY_BP_DIASTOLIC)
  ).length;
  const tbSuspectedCases = patients.filter((p) => p.tbSymptoms === true).length;
  const vaccinationPendingCases = patients.filter(
    (p) => p.vaccinationStatus === "pending" || p.vaccinationStatus === "missed"
  ).length;

  return {
    totalPatients,
    pregnantPatients,
    highRiskPregnancyCases,
    tbSuspectedCases,
    vaccinationPendingCases,
  };
}

