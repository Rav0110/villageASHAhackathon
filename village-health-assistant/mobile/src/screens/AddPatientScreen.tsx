import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  Switch,
  ScrollView,
} from "react-native";
import type { Gender, Patient, VaccinationStatus } from "../types";
import {
  loadAlerts,
  loadPatients,
  saveAlerts,
  savePatients,
} from "../storage";
import { generateAlertsForPatient } from "../riskRules";

type FormState = {
  name: string;
  age: string;
  gender: Gender;
  village: string;
  phone: string;
  pregnancyStatus: boolean;
  systolicBP: string;
  diastolicBP: string;
  vaccinationStatus: VaccinationStatus;
  tbSymptoms: boolean;
};

// Voice/AI placeholder: replace later with real speech-to-text + parsing.
function parseVoiceInputPlaceholder(): {
  transcript: string;
  systolicBP: number;
  diastolicBP: number;
  tbSymptoms: boolean;
} {
  return {
    transcript: "Patient reports fever and cough. BP is 150/95.",
    systolicBP: 150,
    diastolicBP: 95,
    tbSymptoms: true,
  };
}

export default function AddPatientScreen(props: {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    name: "",
    age: "",
    gender: "female",
    village: "",
    phone: "",
    pregnancyStatus: true,
    systolicBP: "150",
    diastolicBP: "95",
    vaccinationStatus: "pending",
    tbSymptoms: false,
  });

  const [voiceTranscript, setVoiceTranscript] = useState<string>("");

  const canSave = useMemo(() => {
    return form.name.trim().length > 0 && form.age.trim().length > 0;
  }, [form.name, form.age]);

  async function onSave() {
    const systolicBP = Number(form.systolicBP);
    const diastolicBP = Number(form.diastolicBP);
    const age = Number(form.age);

    if (!Number.isFinite(systolicBP) || !Number.isFinite(diastolicBP) || !Number.isFinite(age)) {
      return;
    }

    const now = Date.now();
    const patientId = `p_${now}`;

    const patient: Patient = {
      id: patientId,
      name: form.name.trim(),
      age,
      gender: form.gender,
      village: form.village.trim(),
      phone: form.phone.trim(),
      pregnancyStatus: form.pregnancyStatus,
      systolicBP,
      diastolicBP,
      vaccinationStatus: form.vaccinationStatus,
      tbSymptoms: form.tbSymptoms,
      synced: false,
      createdAt: now,
      updatedAt: now,
    };

    const [patients, alerts] = await Promise.all([loadPatients(), loadAlerts()]);

    await savePatients([...patients, patient]);

    const nextAlerts = [
      ...alerts.filter((a) => a.patientId !== patientId),
      ...generateAlertsForPatient(patient),
    ];
    await saveAlerts(nextAlerts);

    props.onBack();
  }

  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 32 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Add Patient</Text>

      <TextInput
        placeholder="name"
        value={form.name}
        onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
      />

      <TextInput
        placeholder="age"
        value={form.age}
        onChangeText={(v) => setForm((f) => ({ ...f, age: v }))}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
      />

      <TextInput
        placeholder="gender (male/female/other)"
        value={form.gender}
        onChangeText={(v) =>
          setForm((f) => ({
            ...f,
            gender: (v as Gender) || "other",
          }))
        }
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
      />

      <TextInput
        placeholder="village"
        value={form.village}
        onChangeText={(v) => setForm((f) => ({ ...f, village: v }))}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
      />

      <TextInput
        placeholder="phone"
        value={form.phone}
        onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
      />

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text>Pregnant</Text>
        <Switch
          value={form.pregnancyStatus}
          onValueChange={(v) => setForm((f) => ({ ...f, pregnancyStatus: v }))}
        />
      </View>

      <TextInput
        placeholder="systolicBP"
        value={form.systolicBP}
        onChangeText={(v) => setForm((f) => ({ ...f, systolicBP: v }))}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
      />

      <TextInput
        placeholder="diastolicBP"
        value={form.diastolicBP}
        onChangeText={(v) => setForm((f) => ({ ...f, diastolicBP: v }))}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
      />

      <TextInput
        placeholder="vaccinationStatus (pending/missed/completed)"
        value={form.vaccinationStatus}
        onChangeText={(v) => setForm((f) => ({ ...f, vaccinationStatus: v as VaccinationStatus }))}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10 }}
      />

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text>TB Symptoms</Text>
        <Switch
          value={form.tbSymptoms}
          onValueChange={(v) => setForm((f) => ({ ...f, tbSymptoms: v }))}
        />
      </View>

      <View style={{ gap: 8 }}>
        <Button
          title="Voice Input (Placeholder)"
          onPress={() => {
            const demo = parseVoiceInputPlaceholder();
            setVoiceTranscript(demo.transcript);
            setForm((f) => ({
              ...f,
              systolicBP: String(demo.systolicBP),
              diastolicBP: String(demo.diastolicBP),
              tbSymptoms: demo.tbSymptoms,
            }));
          }}
        />
        {voiceTranscript ? (
          <Text style={{ fontSize: 12, color: "#444" }}>
            {voiceTranscript}
          </Text>
        ) : null}
      </View>

      <View style={{ gap: 12, marginTop: 6 }}>
        <Button title="Save Locally" onPress={onSave} disabled={!canSave} />
        <Button title="Back" onPress={props.onBack} />
      </View>
    </ScrollView>
  );
}

