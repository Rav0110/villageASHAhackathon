import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type Role = "asha" | "supervisor";

export default function LoginScreen(props: {
  onRoleSelected: (role: Role) => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f5f6fa",
        padding: 16,
        justifyContent: "center",
        gap: 16,
      }}
    >
      <View style={{ alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#27ae60",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 28 }}>🏥</Text>
        </View>

        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#1a5276",
            marginBottom: 12,
          }}
        >
          Village Health Assistant
        </Text>
      </View>

      <Text style={{ textAlign: "center", color: "#333" }}>
        {"राष्ट्रीय स्वास्थ्य मिशन\nSelect your role to continue"}
      </Text>

      <View style={{ gap: 12 }}>
        <TouchableOpacity
          onPress={() => props.onRoleSelected("asha")}
          style={{
            backgroundColor: "#2980b9",
            padding: 16,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>ASHA Worker</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => props.onRoleSelected("supervisor")}
          style={{
            backgroundColor: "#8e44ad",
            padding: 16,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            Supervisor
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

