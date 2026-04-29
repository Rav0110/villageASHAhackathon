import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { getBackendBaseUrl } from "../syncService";
import type { ScreenKey } from "../../App";

type BackendSummary = {
  totalPatients: number;
  pregnantPatients: number;
  highRiskPregnancyCases: number;
  tbSuspectedCases: number;
  vaccinationPendingCases: number;
};

type BackendAlert = {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  severity: string;
  status: string;
  createdAt: number;
};

type BackendPatient = {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  village: string;
  phone: string;
  pregnancyStatus: boolean;
  systolicBP: number;
  diastolicBP: number;
  vaccinationStatus: "pending" | "missed" | "completed";
  tbSymptoms: boolean;
  synced: boolean;
  createdAt: number;
  updatedAt: number;
};

export default function SupervisorDashboardScreen(props: {
  onNavigate: (screen: ScreenKey) => void;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const [summary, setSummary] = useState<BackendSummary | null>(null);
  const [alerts, setAlerts] = useState<BackendAlert[]>([]);
  const [patients, setPatients] = useState<BackendPatient[]>([]);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const base = getBackendBaseUrl();
      const [sRes, aRes, pRes] = await Promise.all([
        fetch(`${base}/api/reports/summary`),
        fetch(`${base}/api/alerts`),
        fetch(`${base}/api/patients`),
      ]);

      if (!sRes.ok) throw new Error(`Failed summary: ${sRes.status}`);
      if (!aRes.ok) throw new Error(`Failed alerts: ${aRes.status}`);
      if (!pRes.ok) throw new Error(`Failed patients: ${pRes.status}`);

      const sJson = (await sRes.json()) as BackendSummary;
      const aJson = (await aRes.json()) as BackendAlert[];
      const pJson = (await pRes.json()) as BackendPatient[];

      setSummary(sJson);
      setAlerts(aJson);
      setPatients(pJson);
      setLastRefreshed(new Date().toLocaleTimeString("en-IN"));
    } catch (e) {
      setError("Backend offline — showing last fetched data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <ScrollView
      style={{ backgroundColor: "#f5f6fa" }}
      contentContainerStyle={{ gap: 12, padding: 16, paddingBottom: 32 }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: "#1a5276",
          marginBottom: 12,
        }}
      >
        Supervisor Dashboard
      </Text>

      {loading ? <Text>Loading...</Text> : null}
      {error ? (
        <Text style={{ color: "#e67e22", fontSize: 13, fontWeight: "600" }}>
          {error}
        </Text>
      ) : null}

      {summary ? (
        <View style={{ gap: 10 }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              padding: 12,
              borderRadius: 8,
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ color: "#333" }}>
              Total patients: {summary.totalPatients}
            </Text>
            <Text style={{ color: "#333", marginTop: 4 }}>
              Pregnant patients: {summary.pregnantPatients}
            </Text>

            <Text style={{ color: "#333", marginTop: 4 }}>
              High-risk pregnancy cases:{" "}
              <Text style={{ color: "#e74c3c", fontWeight: "700" }}>
                {summary.highRiskPregnancyCases}
              </Text>
            </Text>

            <Text style={{ color: "#333", marginTop: 4 }}>
              TB suspected cases:{" "}
              <Text style={{ color: "#e74c3c", fontWeight: "700" }}>
                {summary.tbSuspectedCases}
              </Text>
            </Text>

            <Text style={{ color: "#333", marginTop: 4 }}>
              Vaccination pending cases:{" "}
              <Text style={{ color: "#e67e22", fontWeight: "700" }}>
                {summary.vaccinationPendingCases}
              </Text>
            </Text>
          </View>

          {lastRefreshed ? (
            <Text style={{ color: "#666", fontSize: 12 }}>
              Last refreshed: {lastRefreshed}
            </Text>
          ) : null}

          <Text style={{ fontWeight: "700", marginTop: 8 }}>Alert List</Text>

          {alerts.length === 0 ? (
            <Text>No alerts available.</Text>
          ) : (
            alerts
              .slice()
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((a) => (
                <View
                  key={a.id}
                  style={{
                    borderWidth: 1,
                    borderColor: "#eee",
                    padding: 12,
                    borderRadius: 8,
                    gap: 4,
                    backgroundColor: "#fff",
                  }}
                >
                  <Text style={{ fontWeight: "700", color: "#333" }}>
                    {a.patientName}
                  </Text>
                  <Text>Alert type: {a.type}</Text>
                  <Text>Severity: {a.severity}</Text>
                  <Text>Status: {a.status}</Text>
                </View>
              ))
          )}

          <Text style={{ fontWeight: "700", marginTop: 8 }}>
            Synced Patients ({patients.length})
          </Text>
          {patients.map((p) => (
            <View
              key={p.id}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 6,
                padding: 10,
                marginVertical: 3,
                backgroundColor: "#fff",
              }}
            >
              <Text style={{ fontWeight: "600", color: "#333" }}>
                {`${p.name} | Age: ${p.age} | ${p.village}`}
              </Text>
              <Text style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                {`BP: ${p.systolicBP}/${p.diastolicBP}  TB: ${
                  p.tbSymptoms ? "Yes" : "No"
                }  Vacc: ${p.vaccinationStatus}`}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <TouchableOpacity
        onPress={refresh}
        style={{
          backgroundColor: "#2980b9",
          padding: 14,
          borderRadius: 8,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Refresh</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={props.onBack}
        style={{ alignSelf: "flex-start", marginTop: 8 }}
      >
        <Text
          style={{
            color: "#2980b9",
            fontSize: 14,
            marginTop: 8,
            alignSelf: "flex-start",
          }}
        >
          ← Back
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

