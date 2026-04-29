import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { countUnsyncedLocalData, loadAlerts, loadPatients } from "../storage";
import type { ScreenKey } from "../../App";

export default function ASHADashboardScreen(props: {
  onNavigate: (screen: ScreenKey) => void;
  refreshKey?: number;
}) {
  const [patientCount, setPatientCount] = useState<number>(0);
  const [alertCount, setAlertCount] = useState<number>(0);
  const [unsyncedCount, setUnsyncedCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    Promise.all([loadPatients(), loadAlerts(), countUnsyncedLocalData()])
      .then(([patients, alerts, c]) => {
        if (!mounted) return;
        setPatientCount(patients.length);
        setAlertCount(alerts.length);
        setUnsyncedCount(c.total);
      })
      .catch(() => {
        // Keep dashboard functional even if AsyncStorage read fails.
      });
    return () => {
      mounted = false;
    };
  }, [props.refreshKey]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f6fa", padding: 16 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: "#1a5276",
          marginBottom: 12,
        }}
      >
        ASHA Dashboard
      </Text>

      <View
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 8,
          padding: 12,
          backgroundColor: "#f8f9fa",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: "#333", fontWeight: "600" }}>
            Patients: {patientCount}{" "}
          </Text>
          <Text style={{ color: "#333", fontWeight: "600" }}>
            Alerts: {alertCount}
          </Text>
        </View>
        <Text style={{ color: "#333", marginTop: 6, fontWeight: "600" }}>
          Unsynced records: {unsyncedCount}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => props.onNavigate("addPatient")}
        style={{
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#2980b9",
          borderRadius: 8,
          padding: 14,
          marginVertical: 4,
        }}
      >
        <Text style={{ color: "#2980b9", fontWeight: "600", fontSize: 15 }}>
          Add Patient
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => props.onNavigate("visit")}
        style={{
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#2980b9",
          borderRadius: 8,
          padding: 14,
          marginVertical: 4,
        }}
      >
        <Text style={{ color: "#2980b9", fontWeight: "600", fontSize: 15 }}>
          Record Visit
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => props.onNavigate("riskAlerts")}
        style={{
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#2980b9",
          borderRadius: 8,
          padding: 14,
          marginVertical: 4,
        }}
      >
        <Text style={{ color: "#2980b9", fontWeight: "600", fontSize: 15 }}>
          Risk Alerts
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => props.onNavigate("sync")}
        style={{
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#2980b9",
          borderRadius: 8,
          padding: 14,
          marginVertical: 4,
        }}
      >
        <Text style={{ color: "#2980b9", fontWeight: "600", fontSize: 15 }}>
          Sync Data
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => props.onNavigate("report")}
        style={{
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#2980b9",
          borderRadius: 8,
          padding: 14,
          marginVertical: 4,
        }}
      >
        <Text style={{ color: "#2980b9", fontWeight: "600", fontSize: 15 }}>
          Generate Report
        </Text>
      </TouchableOpacity>
    </View>
  );
}

