import React, { useMemo, useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import ASHADashboardScreen from "./src/screens/ASHADashboardScreen";
import AddPatientScreen from "./src/screens/AddPatientScreen";
import VisitScreen from "./src/screens/VisitScreen";
import RiskAlertsScreen from "./src/screens/RiskAlertsScreen";
import SyncScreen from "./src/screens/SyncScreen";
import ReportScreen from "./src/screens/ReportScreen";
import SupervisorDashboardScreen from "./src/screens/SupervisorDashboardScreen";

type Role = "asha" | "supervisor";
export type ScreenKey =
  | "login"
  | "ashaDashboard"
  | "addPatient"
  | "visit"
  | "riskAlerts"
  | "sync"
  | "report"
  | "supervisorDashboard";

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [screen, setScreen] = useState<ScreenKey>("login");
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const goBackToLogin = useMemo(
    () => () => {
      setRole(null);
      setScreen("login");
    },
    []
  );

  const goToAshaDashboard = () => {
    setRefreshKey((k) => k + 1);
    setScreen("ashaDashboard");
  };

  if (role === null || screen === "login") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
        <LoginScreen
          onRoleSelected={(nextRole) => {
            setRole(nextRole);
            setScreen(nextRole === "asha" ? "ashaDashboard" : "supervisorDashboard");
          }}
        />
      </SafeAreaView>
    );
  }

  const onNavigate = (next: ScreenKey) => {
    if (next === "ashaDashboard") {
      setRefreshKey((k) => k + 1);
    }
    setScreen(next);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#ddd",
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#1a5276" }}>
            Village Health Assistant
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text style={{ color: "#333" }}>
              Logged in as: {role === "asha" ? "ASHA Worker" : "Supervisor"}
            </Text>

            <TouchableOpacity
              onPress={goBackToLogin}
              style={{
                backgroundColor: "#2980b9",
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {screen === "ashaDashboard" && (
          <ASHADashboardScreen onNavigate={onNavigate} refreshKey={refreshKey} />
        )}
        {screen === "addPatient" && (
          <AddPatientScreen onNavigate={onNavigate} onBack={goToAshaDashboard} />
        )}
        {screen === "visit" && (
          <VisitScreen onNavigate={onNavigate} onBack={goToAshaDashboard} />
        )}
        {screen === "riskAlerts" && (
          <RiskAlertsScreen onNavigate={onNavigate} onBack={goToAshaDashboard} />
        )}
        {screen === "sync" && (
          <SyncScreen onNavigate={onNavigate} onBack={goToAshaDashboard} />
        )}
        {screen === "report" && (
          <ReportScreen onNavigate={onNavigate} onBack={goToAshaDashboard} />
        )}
        {screen === "supervisorDashboard" && (
          <SupervisorDashboardScreen
            onNavigate={onNavigate}
            onBack={() => setScreen("login")}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

