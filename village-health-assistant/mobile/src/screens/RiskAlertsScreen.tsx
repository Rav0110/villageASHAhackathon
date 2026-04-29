import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import type { Alert } from "../types";
import { loadAlerts } from "../storage";
import type { ScreenKey } from "../../App";

export default function RiskAlertsScreen(props: {
  onNavigate: (screen: ScreenKey) => void;
  onBack: () => void;
}) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    loadAlerts().then(setAlerts);
  }, []);

  function severityColors(severity: Alert["severity"]) {
    if (severity === "High") {
      return { border: "#e74c3c", bar: "#e74c3c", badgeBg: "#e74c3c" };
    }
    if (severity === "Medium") {
      return { border: "#e67e22", bar: "#e67e22", badgeBg: "#e67e22" };
    }
    return { border: "#f1c40f", bar: "#f1c40f", badgeBg: "#f1c40f" };
  }

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
        Risk Alerts
      </Text>

      <Text style={{ fontSize: 15, fontWeight: "600", color: "#333" }}>
        Total Alerts: {alerts.length}
      </Text>

      {alerts.length === 0 ? (
        <Text style={{ color: "#27ae60", fontWeight: "600" }}>
          ✅ No risk alerts. All patients are currently safe.
        </Text>
      ) : (
        alerts
          .slice()
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((a) => {
            const c = severityColors(a.severity);
            return (
              <View
                key={a.id}
                style={{
                  borderWidth: 1,
                  borderColor: c.border,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: "#fff",
                }}
              >
                <View style={{ flexDirection: "row", flex: 1 }}>
                  <View
                    style={{
                      width: 4,
                      borderRadius: 2,
                      backgroundColor: c.bar,
                      marginTop: 4,
                    }}
                  />
                  <View style={{ flex: 1, paddingLeft: 10, gap: 4 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontWeight: "700", color: "#333" }}>
                        {a.patientName}
                      </Text>
                      <View
                        style={{
                          backgroundColor: c.badgeBg,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: "700",
                          }}
                        >
                          {a.severity}
                        </Text>
                      </View>
                    </View>

                    <Text>Type: {a.type}</Text>
                    <Text>Status: {a.status}</Text>
                  </View>
                </View>
              </View>
            );
          })
      )}

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

