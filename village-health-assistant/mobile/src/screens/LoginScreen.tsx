import React from "react";
import { View, Text, Button } from "react-native";

type Role = "asha" | "supervisor";

export default function LoginScreen(props: {
  onRoleSelected: (role: Role) => void;
}) {
  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>
        Login (Dummy)
      </Text>
      <Text>Select your role to continue.</Text>

      <View style={{ gap: 12 }}>
        <Button title="ASHA Worker" onPress={() => props.onRoleSelected("asha")} />
        <Button
          title="Supervisor"
          onPress={() => props.onRoleSelected("supervisor")}
        />
      </View>
    </View>
  );
}

