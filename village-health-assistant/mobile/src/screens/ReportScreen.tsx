import React, { useEffect, useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import * as Clipboard from "expo-clipboard";
import type { Patient } from "../types";
import { loadPatients } from "../storage";
import {
  generateGovernmentReportJson,
  generateGovernmentReportText,
} from "../reportService";

export default function ReportScreen(props: {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reportText, setReportText] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    loadPatients().then((p) => {
      setPatients(p);
      setReportText(generateGovernmentReportText(p));
    });
  }, []);

  async function copyReport() {
    if (!reportText) return;
    await Clipboard.setStringAsync(reportText);
    setStatus("Report copied.");
  }

  async function exportJson() {
    const json = JSON.stringify(generateGovernmentReportJson(patients), null, 2);
    await Clipboard.setStringAsync(json);
    setStatus("JSON exported (copied to clipboard).");
  }

  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 32 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Government Report</Text>

      {reportText ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontFamily: "monospace" }}>{reportText}</Text>
        </View>
      ) : (
        <Text>No patients found.</Text>
      )}

      {status ? <Text>{status}</Text> : null}

      <Button title="Copy report" onPress={copyReport} />
      <Button title="Export JSON" onPress={exportJson} />
      <Button title="Back" onPress={props.onBack} />
    </ScrollView>
  );
}

