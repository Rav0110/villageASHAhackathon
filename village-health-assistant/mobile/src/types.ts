export type Role = "asha" | "supervisor";

export type Gender = "male" | "female" | "other";

export type VaccinationStatus = "pending" | "missed" | "completed" | string;

export type AlertSeverity = "High" | "Medium" | "Low";
export type AlertStatus = "generated";

export type PregnancyRiskType = "High Risk Pregnancy";
export type TbRiskType = "TB Follow-up Required";
export type VaccinationRiskType = "Vaccination Pending";

export type AlertType = PregnancyRiskType | TbRiskType | VaccinationRiskType;

export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  village: string;
  phone: string;

  pregnancyStatus: boolean;
  systolicBP: number;
  diastolicBP: number;

  vaccinationStatus: VaccinationStatus;
  tbSymptoms: boolean;

  synced: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Visit = {
  id: string;
  patientId: string;
  patientName?: string;

  note: string;
  systolicBP: number;
  diastolicBP: number;
  tbSymptoms: boolean;
  pregnancyCheck: boolean;

  synced: boolean;
  createdAt: number;
};

export type Alert = {
  id: string;
  patientId: string;
  patientName: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;

  synced: boolean;
  createdAt: number;
};

export type SyncPayload = {
  patients: Patient[];
  visits: Visit[];
  alerts: Alert[];
};

export type ReportSummary = {
  totalPatients: number;
  pregnantPatients: number;
  highRiskPregnancyCases: number;
  tbSuspectedCases: number;
  vaccinationPendingCases: number;
};

