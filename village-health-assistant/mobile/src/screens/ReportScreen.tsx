import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Share } from "react-native";
import type { Patient, ReportSummary } from "../types";
import { loadPatients } from "../storage";
import {
  generateGovernmentReportJson,
  generateGovernmentReportText,
} from "../reportService";
import type { ScreenKey } from "../../App";

export default function ReportScreen(props: {
  onNavigate: (screen: ScreenKey) => void;
  onBack: () => void;
}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);

  useEffect(() => {
    loadPatients().then((p) => {
      setPatients(p);
      const json = generateGovernmentReportJson(p);
      setSummary(json.summary);
    });
  }, []);

  const generatedDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  async function onShare() {
    if (!patients.length) return;
    await Share.share({
      message: generateGovernmentReportText(patients),
    });
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
        Government Report
      </Text>

      {summary ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          <View
            style={{
              backgroundColor: "#1a5276",
              padding: 12,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "700",
                fontSize: 14,
              }}
            >
              GOVERNMENT HEALTH SUMMARY REPORT
            </Text>
            <Text style={{ color: "#fff", marginTop: 4, fontSize: 12 }}>
              Generated: {generatedDate}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ fontWeight: "600" }}>Total Patients Registered:</Text>
            <Text>{summary.totalPatients}</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ fontWeight: "600" }}>Pregnant Patients:</Text>
            <Text>{summary.pregnantPatients}</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ fontWeight: "600" }}>
              High-Risk Pregnancy Cases:
            </Text>
            <Text>{summary.highRiskPregnancyCases}</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ fontWeight: "600" }}>TB Suspected Cases:</Text>
            <Text>{summary.tbSuspectedCases}</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 10,
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ fontWeight: "600" }}>
              Vaccination Pending / Missed:
            </Text>
            <Text>{summary.vaccinationPendingCases}</Text>
          </View>
        </View>
      ) : (
        <Text>No patients found.</Text>
      )}

      <TouchableOpacity
        onPress={onShare}
        style={{
          backgroundColor: "#2980b9",
          padding: 14,
          borderRadius: 8,
          alignItems: "center",
          width: "100%",
          marginTop: 4,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          Share / Export Report
        </Text>
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

