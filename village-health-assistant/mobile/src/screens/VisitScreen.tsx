import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import type { Patient, Visit } from "../types";
import type { ScreenKey } from "../../App";
import {
  loadAlerts,
  loadPatients,
  loadVisits,
  saveAlerts,
  savePatients,
  saveVisits,
} from "../storage";
import { generateAlertsForPatient } from "../riskRules";

export default function VisitScreen(props: {
  onNavigate: (screen: ScreenKey) => void;
  onBack: () => void;
}) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? null,
    [patients, selectedPatientId]
  );

  const [note, setNote] = useState<string>("");
  const [systolicBP, setSystolicBP] = useState<string>("");
  const [diastolicBP, setDiastolicBP] = useState<string>("");
  const [tbSymptoms, setTbSymptoms] = useState<boolean>(false);
  const [pregnancyCheck, setPregnancyCheck] = useState<boolean>(false);
  const [voiceMode, setVoiceMode] = useState<boolean>(false);
  const [rawTranscript, setRawTranscript] = useState<string>("");
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");

  useEffect(() => {
    loadPatients().then(setPatients);
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;
    setSystolicBP(String(selectedPatient.systolicBP));
    setDiastolicBP(String(selectedPatient.diastolicBP));
    setTbSymptoms(selectedPatient.tbSymptoms);
    setPregnancyCheck(selectedPatient.pregnancyStatus);
  }, [selectedPatient]);

  function parseTranscript(text: string) {
    // BP extraction: match patterns like "150/95" or "BP 140/90"
    const bpMatch = text.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
    const systolic = bpMatch ? parseInt(bpMatch[1], 10) : null;
    const diastolic = bpMatch ? parseInt(bpMatch[2], 10) : null;

    // TB detection: Hindi/English keywords
    const tbKeywords = [
      "tb",
      "tuberculosis",
      "खांसी",
      "कफ",
      "cough",
      "fever",
      "बुखार",
    ];
    const hasTb = tbKeywords.some((kw) => text.toLowerCase().includes(kw));

    setVoiceTranscript(text);
    setVoiceMode(false);
    setNote(text);
    setSystolicBP((prev) => (systolic !== null ? String(systolic) : prev));
    setDiastolicBP((prev) => (diastolic !== null ? String(diastolic) : prev));
    setTbSymptoms((prev) => (hasTb ? true : prev));
  }

  async function onSaveVisit() {
    if (!selectedPatient) return;

    const systolic = Number(systolicBP);
    const diastolic = Number(diastolicBP);
    if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) return;

    const now = Date.now();
    const visit: Visit = {
      id: `v_${now}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      note,
      systolicBP: systolic,
      diastolicBP: diastolic,
      tbSymptoms,
      pregnancyCheck,
      synced: false,
      createdAt: now,
    };

    const [existingVisits, existingPatients, existingAlerts] = await Promise.all([
      loadVisits(),
      loadPatients(),
      loadAlerts(),
    ]);

    // Save visit.
    await saveVisits([...existingVisits, visit]);

    // Update patient risk inputs using visit readings.
    const updatedPatient: Patient = {
      ...selectedPatient,
      systolicBP: systolic,
      diastolicBP: diastolic,
      tbSymptoms,
      pregnancyStatus: pregnancyCheck,
      updatedAt: now,
    };

    const nextPatients = existingPatients.map((p) =>
      p.id === updatedPatient.id ? updatedPatient : p
    );
    await savePatients(nextPatients);

    // Replace generated alerts for that patient.
    const nextAlerts = [
      ...existingAlerts.filter((a) => a.patientId !== updatedPatient.id),
      ...generateAlertsForPatient(updatedPatient),
    ];
    await saveAlerts(nextAlerts);

    props.onBack();
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
        Record Visit
      </Text>

      <Text style={{ fontSize: 12, color: "#666", fontWeight: "600" }}>
        Select a patient:
      </Text>

      <View style={{ gap: 8 }}>
        {patients.map((p) => {
          const isSelected = selectedPatientId === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => setSelectedPatientId(p.id)}
              style={{
                borderWidth: 1,
                borderColor: isSelected ? "#2980b9" : "#ddd",
                backgroundColor: isSelected ? "#d6eaf8" : "#fff",
                borderRadius: 6,
                padding: 12,
                marginVertical: 3,
              }}
            >
              <Text style={{ fontWeight: "700", color: "#333" }}>
                {p.name}
              </Text>
              <Text style={{ color: "#666" }}>{p.village}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedPatient ? (
        <View style={{ gap: 12 }}>
          <View
            style={{
              backgroundColor: "#ebf5fb",
              padding: 10,
              borderRadius: 6,
            }}
          >
            <Text>{`Patient: ${selectedPatient.name} | Village: ${selectedPatient.village} | Age: ${selectedPatient.age}`}</Text>
          </View>

          <View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#333",
                marginBottom: 2,
              }}
            >
              Health Note
            </Text>
            <TextInput
              placeholder="Type visit note"
              value={note}
              onChangeText={setNote}
              style={{
                borderWidth: 1,
                borderColor: "#bbb",
                borderRadius: 6,
                padding: 10,
                fontSize: 15,
                backgroundColor: "#fff",
              }}
              multiline
              numberOfLines={3}
            />
          </View>

          <View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#333",
                marginBottom: 2,
              }}
            >
              Systolic BP (mmHg)
            </Text>
            <TextInput
              placeholder="e.g. 120"
              value={systolicBP}
              onChangeText={setSystolicBP}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: "#bbb",
                borderRadius: 6,
                padding: 10,
                fontSize: 15,
                backgroundColor: "#fff",
              }}
            />
          </View>

          <View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#333",
                marginBottom: 2,
              }}
            >
              Diastolic BP (mmHg)
            </Text>
            <TextInput
              placeholder="e.g. 80"
              value={diastolicBP}
              onChangeText={setDiastolicBP}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: "#bbb",
                borderRadius: 6,
                padding: 10,
                fontSize: 15,
                backgroundColor: "#fff",
              }}
            />
          </View>

          <View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#333",
                marginBottom: 2,
              }}
            >
              TB Symptoms
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Switch value={tbSymptoms} onValueChange={setTbSymptoms} />
            </View>
          </View>

          <View>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#333",
                marginBottom: 2,
              }}
            >
              Pregnancy Check
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Switch
                value={pregnancyCheck}
                onValueChange={setPregnancyCheck}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setVoiceMode(true)}
            style={{
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 8,
              padding: 14,
              marginTop: 6,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#2980b9", fontWeight: "600", fontSize: 15 }}>
              🎤  Voice Input (Hindi/English)
            </Text>
          </TouchableOpacity>

          {voiceMode ? (
            <View style={{ gap: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#333" }}>
                Type or paste the health note:
              </Text>
              <TextInput
                placeholder=""
                value={rawTranscript}
                onChangeText={setRawTranscript}
                multiline
                numberOfLines={4}
                style={{
                  borderWidth: 1,
                  borderColor: "#bbb",
                  borderRadius: 6,
                  padding: 10,
                  fontSize: 15,
                  backgroundColor: "#fff",
                  minHeight: 110,
                }}
              />
              <Text style={{ fontSize: 12, color: "#666" }}>
                Example: "मरीज गर्भवती है। BP 150/95। खांसी और बुखार है।"
              </Text>
              <TouchableOpacity
                onPress={() => parseTranscript(rawTranscript)}
                style={{
                  backgroundColor: "#2980b9",
                  padding: 14,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  Parse Note
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {voiceTranscript ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#27ae60",
                borderRadius: 8,
                padding: 10,
                backgroundColor: "#fff",
                marginTop: 6,
              }}
            >
              <Text style={{ color: "#27ae60", fontWeight: "700" }}>
                ✓ Parsed note
              </Text>
              <Text style={{ color: "#27ae60", marginTop: 4 }}>
                {voiceTranscript}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={onSaveVisit}
            style={{
              backgroundColor: "#27ae60",
              padding: 14,
              borderRadius: 8,
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              Save Visit Locally
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={props.onBack}
            style={{ alignSelf: "flex-start" }}
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
        </View>
      ) : (
        <Text>Select a patient to continue.</Text>
      )}
    </ScrollView>
  );
}

