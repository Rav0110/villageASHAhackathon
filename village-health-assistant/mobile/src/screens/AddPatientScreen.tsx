import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import type { Gender, Patient, VaccinationStatus } from "../types";
import type { ScreenKey } from "../../App";
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

export default function AddPatientScreen(props: {
  onNavigate: (screen: ScreenKey) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<FormState>({
    name: "",
    age: "",
    gender: "female",
    village: "",
    phone: "",
    pregnancyStatus: false,
    systolicBP: "",
    diastolicBP: "",
    vaccinationStatus: "completed",
    tbSymptoms: false,
  });

  const [voiceMode, setVoiceMode] = useState<boolean>(false);
  const [rawTranscript, setRawTranscript] = useState<string>("");
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");

  const canSave = useMemo(() => {
    return form.name.trim().length > 0 && form.age.trim().length > 0;
  }, [form.name, form.age]);

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

    // Pregnancy detection
    const pregnancyKeywords = ["pregnant", "pregnancy", "गर्भवती", "गर्भ"];
    const isPregnant = pregnancyKeywords.some((kw) =>
      text.toLowerCase().includes(kw)
    );

    // Vaccination detection
    const vaccinationKeywords = [
      "vaccination pending",
      "टीका नहीं",
      "not vaccinated",
      "missed vaccine",
    ];
    const vaccinationPending = vaccinationKeywords.some((kw) =>
      text.toLowerCase().includes(kw)
    );

    setVoiceTranscript(text);
    setForm((f) => ({
      ...f,
      systolicBP: systolic !== null ? String(systolic) : f.systolicBP,
      diastolicBP: diastolic !== null ? String(diastolic) : f.diastolicBP,
      tbSymptoms: hasTb ? true : f.tbSymptoms,
      pregnancyStatus: isPregnant ? true : f.pregnancyStatus,
      vaccinationStatus: vaccinationPending
        ? "pending"
        : f.vaccinationStatus,
    }));
    setVoiceMode(false);
  }

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
        Add Patient
      </Text>

      <View>
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 2 }}>
          Full Name *
        </Text>
        <TextInput
          placeholder="e.g. Sunita Devi"
          value={form.name}
          onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
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
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 2 }}>
          Age *
        </Text>
        <TextInput
          placeholder="e.g. 28"
          value={form.age}
          onChangeText={(v) => setForm((f) => ({ ...f, age: v }))}
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
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 2 }}>
          Gender
        </Text>
        <TextInput
          placeholder="male / female / other"
          value={form.gender}
          onChangeText={(v) => {
            const cleaned = v.trim().toLowerCase();
            setForm((f) => ({
              ...f,
              gender:
                cleaned === "male"
                  ? "male"
                  : cleaned === "female"
                    ? "female"
                    : "other",
            }));
          }}
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
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 2 }}>
          Village / Gram Panchayat
        </Text>
        <TextInput
          placeholder="e.g. Rampur"
          value={form.village}
          onChangeText={(v) => setForm((f) => ({ ...f, village: v }))}
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
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 2 }}>
          Phone Number
        </Text>
        <TextInput
          placeholder="10-digit mobile number"
          value={form.phone}
          onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
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

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 2 }}>
          Pregnant
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Switch
            value={form.pregnancyStatus}
            onValueChange={(v) =>
              setForm((f) => ({ ...f, pregnancyStatus: v }))
            }
          />
        </View>
      </View>

      <View>
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 2 }}>
          Systolic BP (mmHg)
        </Text>
        <TextInput
          placeholder="e.g. 120"
          value={form.systolicBP}
          onChangeText={(v) => setForm((f) => ({ ...f, systolicBP: v }))}
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
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 2 }}>
          Diastolic BP (mmHg)
        </Text>
        <TextInput
          placeholder="e.g. 80"
          value={form.diastolicBP}
          onChangeText={(v) => setForm((f) => ({ ...f, diastolicBP: v }))}
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
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 2 }}>
          Vaccination Status
        </Text>
        <TextInput
          placeholder="pending / missed / completed"
          value={form.vaccinationStatus}
          onChangeText={(v) => setForm((f) => ({ ...f, vaccinationStatus: v as VaccinationStatus }))}
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

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 2 }}>
          TB Symptoms
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Switch
            value={form.tbSymptoms}
            onValueChange={(v) => setForm((f) => ({ ...f, tbSymptoms: v }))}
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
            <Text style={{ color: "#fff", fontWeight: "700" }}>Parse Note</Text>
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
          <Text style={{ color: "#27ae60", marginTop: 4 }}>{voiceTranscript}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        onPress={canSave ? onSave : undefined}
        style={{
          backgroundColor: canSave ? "#27ae60" : "#aaa",
          padding: 14,
          borderRadius: 8,
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Save Patient Locally</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={props.onBack}
        style={{ alignSelf: "flex-start" }}
      >
        <Text style={{ color: "#2980b9", fontSize: 14, marginTop: 8, alignSelf: "flex-start" }}>
          ← Back
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

