import React from "react";
import { View, Text, Button } from "react-native";

export default function ASHADashboardScreen(props: {
  onNavigate: (screen: string) => void;
}) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>
        ASHA Dashboard
      </Text>
      <Button title="Add Patient" onPress={() => props.onNavigate("addPatient")} />
      <Button title="Record Visit" onPress={() => props.onNavigate("visit")} />
      <Button title="Risk Alerts" onPress={() => props.onNavigate("riskAlerts")} />
      <Button title="Sync Data" onPress={() => props.onNavigate("sync")} />
      <Button title="Generate Report" onPress={() => props.onNavigate("report")} />
    </View>
  );
}

