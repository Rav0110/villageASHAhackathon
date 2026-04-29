import React, { useEffect, useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import type { Alert } from "../types";
import { loadAlerts } from "../storage";

export default function RiskAlertsScreen(props: {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    loadAlerts().then(setAlerts);
  }, []);

  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 32 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Risk Alerts</Text>

      {alerts.length === 0 ? (
        <Text>No alerts generated yet.</Text>
      ) : (
        alerts
          .slice()
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((a) => (
            <View
              key={a.id}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                padding: 12,
                borderRadius: 8,
                gap: 6,
              }}
            >
              <Text style={{ fontWeight: "700" }}>{a.patientName}</Text>
              <Text>Type: {a.type}</Text>
              <Text>Severity: {a.severity}</Text>
              <Text>Status: {a.status}</Text>
            </View>
          ))
      )}

      <Button title="Back" onPress={props.onBack} />
    </ScrollView>
  );
}

