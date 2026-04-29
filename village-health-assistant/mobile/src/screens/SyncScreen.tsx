import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, ScrollView } from "react-native";
import { countUnsyncedLocalData } from "../storage";
import { syncNow } from "../syncService";
import type { ScreenKey } from "../../App";

export default function SyncScreen(props: {
  onNavigate: (screen: ScreenKey) => void;
  onBack: () => void;
}) {
  const [message, setMessage] = useState<string>("");
  const [messageColor, setMessageColor] = useState<string>("#666");
  const [counts, setCounts] = useState<{
    patients: number;
    visits: number;
    alerts: number;
    total: number;
  }>({ patients: 0, visits: 0, alerts: 0, total: 0 });

  useEffect(() => {
    countUnsyncedLocalData().then((c) => setCounts(c));
  }, []);

  async function onSync() {
    setMessage("Syncing...");
    setMessageColor("#666");
    const res = await syncNow();
    if (res.ok) {
      setMessageColor("#27ae60");
      setMessage(
        `✓ Sync complete — ${res.synced.patients} patients, ${res.synced.visits} visits, ${res.synced.alerts} alerts uploaded.`
      );
      const c = await countUnsyncedLocalData();
      setCounts(c);
    } else {
      setMessage(res.message); // required offline message
      setMessageColor("#e67e22");
    }
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
        Sync Data
      </Text>

      <Text style={{ fontSize: 15, fontWeight: "600", color: "#333" }}>
        Patients: {counts.patients} | Visits: {counts.visits} | Alerts:{" "}
        {counts.alerts}
      </Text>

      <Text style={{ fontSize: 12, color: "#666" }}>
        Data syncs to district server when internet is available.
      </Text>

      {message ? <Text style={{ color: messageColor }}>{message}</Text> : null}

      <TouchableOpacity
        onPress={onSync}
        style={{
          backgroundColor: "#2980b9",
          padding: 14,
          borderRadius: 8,
          alignItems: "center",
          width: "100%",
          marginTop: 6,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Sync Now</Text>
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

