import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  Switch,
  ScrollView,
} from "react-native";
import type { Patient, Visit } from "../types";
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
  onNavigate: (screen: string) => void;
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
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 32 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Record Visit</Text>

      <Text style={{ fontSize: 12, color: "#444" }}>
        Select a patient:
      </Text>

      <View style={{ gap: 8 }}>
        {patients.map((p) => (
          <Button
            key={p.id}
            title={`${p.name} (${p.village})`}
            onPress={() => setSelectedPatientId(p.id)}
          />
        ))}
      </View>

      {selectedPatient ? (
        <View style={{ gap: 12 }}>
          <Text>Visit for: {selectedPatient.name}</Text>

          <TextInput
            placeholder="visit note"
            value={note}
            onChangeText={setNote}
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
          />

          <TextInput
            placeholder="systolicBP"
            value={systolicBP}
            onChangeText={setSystolicBP}
            keyboardType="numeric"
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
          />

          <TextInput
            placeholder="diastolicBP"
            value={diastolicBP}
            onChangeText={setDiastolicBP}
            keyboardType="numeric"
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
          />

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text>TB Symptoms</Text>
            <Switch value={tbSymptoms} onValueChange={setTbSymptoms} />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text>Pregnancy Check</Text>
            <Switch
              value={pregnancyCheck}
              onValueChange={setPregnancyCheck}
            />
          </View>

          <View style={{ gap: 12, marginTop: 6 }}>
            <Button title="Save Visit Locally" onPress={onSaveVisit} />
            <Button title="Back" onPress={props.onBack} />
          </View>
        </View>
      ) : (
        <Text>Select a patient to continue.</Text>
      )}
    </ScrollView>
  );
}

