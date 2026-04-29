import React, { useEffect, useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import { getBackendBaseUrl } from "../syncService";

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

export default function SupervisorDashboardScreen(props: {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [summary, setSummary] = useState<BackendSummary | null>(null);
  const [alerts, setAlerts] = useState<BackendAlert[]>([]);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const base = getBackendBaseUrl();
      const [sRes, aRes] = await Promise.all([
        fetch(`${base}/api/reports/summary`),
        fetch(`${base}/api/alerts`),
      ]);

      if (!sRes.ok) throw new Error(`Failed summary: ${sRes.status}`);
      if (!aRes.ok) throw new Error(`Failed alerts: ${aRes.status}`);

      const sJson = (await sRes.json()) as BackendSummary;
      const aJson = (await aRes.json()) as BackendAlert[];

      setSummary(sJson);
      setAlerts(aJson);
    } catch (e) {
      setError("Could not fetch synced data from backend.");
      setSummary(null);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 32 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>
        Supervisor Dashboard
      </Text>

      {loading ? <Text>Loading...</Text> : null}
      {error ? <Text>{error}</Text> : null}

      {summary ? (
        <View style={{ gap: 10 }}>
          <Text>Summary</Text>

          <View style={{ borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8 }}>
            <Text>Total patients: {summary.totalPatients}</Text>
            <Text>Total alerts: {alerts.length}</Text>
            <Text>High-risk pregnancy cases: {summary.highRiskPregnancyCases}</Text>
            <Text>TB suspected cases: {summary.tbSuspectedCases}</Text>
            <Text>Vaccination pending cases: {summary.vaccinationPendingCases}</Text>
          </View>

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
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>{a.patientName}</Text>
                  <Text>Alert type: {a.type}</Text>
                  <Text>Severity: {a.severity}</Text>
                  <Text>Status: {a.status}</Text>
                </View>
              ))
          )}
        </View>
      ) : null}

      <Button title="Refresh" onPress={refresh} />
      <Button title="Back" onPress={props.onBack} />
    </ScrollView>
  );
}

