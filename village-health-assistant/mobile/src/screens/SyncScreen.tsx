import React, { useEffect, useState } from "react";
import { View, Text, Button, ScrollView } from "react-native";
import { countUnsyncedLocalData } from "../storage";
import { syncNow } from "../syncService";

export default function SyncScreen(props: {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}) {
  const [message, setMessage] = useState<string>("");
  const [unsyncedTotal, setUnsyncedTotal] = useState<number>(0);

  useEffect(() => {
    countUnsyncedLocalData().then((c) => setUnsyncedTotal(c.total));
  }, []);

  async function onSync() {
    setMessage("Syncing...");
    const res = await syncNow();
    if (res.ok) {
      setMessage(`Synced ${res.synced.patients} patients, ${res.synced.visits} visits, ${res.synced.alerts} alerts.`);
      const c = await countUnsyncedLocalData();
      setUnsyncedTotal(c.total);
    } else {
      setMessage(res.message); // required offline message
    }
  }

  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 32 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>Sync Data</Text>
      <Text>Local unsynced records: {unsyncedTotal}</Text>
      {message ? <Text>{message}</Text> : null}
      <Button title="Sync Now" onPress={onSync} />
      <Button title="Back" onPress={props.onBack} />
    </ScrollView>
  );
}

