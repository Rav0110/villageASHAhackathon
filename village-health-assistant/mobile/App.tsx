import React, { useMemo, useState } from "react";
import { SafeAreaView, View, Text, Button } from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import ASHADashboardScreen from "./src/screens/ASHADashboardScreen";
import AddPatientScreen from "./src/screens/AddPatientScreen";
import VisitScreen from "./src/screens/VisitScreen";
import RiskAlertsScreen from "./src/screens/RiskAlertsScreen";
import SyncScreen from "./src/screens/SyncScreen";
import ReportScreen from "./src/screens/ReportScreen";
import SupervisorDashboardScreen from "./src/screens/SupervisorDashboardScreen";

type Role = "asha" | "supervisor";
type ScreenKey =
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

  const goBackToLogin = useMemo(
    () => () => {
      setRole(null);
      setScreen("login");
    },
    []
  );

  if (role === null || screen === "login") {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LoginScreen
          onRoleSelected={(nextRole) => {
            setRole(nextRole);
            setScreen(nextRole === "asha" ? "ashaDashboard" : "supervisorDashboard");
          }}
        />
      </SafeAreaView>
    );
  }

  const onNavigate = (next: ScreenKey) => setScreen(next);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>
          Village Health Assistant
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text>
            Logged in as: {role === "asha" ? "ASHA Worker" : "Supervisor"}
          </Text>
          <Button title="Logout" onPress={goBackToLogin} />
        </View>

        {screen === "ashaDashboard" && (
          <ASHADashboardScreen onNavigate={onNavigate} />
        )}
        {screen === "addPatient" && (
          <AddPatientScreen onNavigate={onNavigate} onBack={() => setScreen("ashaDashboard")} />
        )}
        {screen === "visit" && (
          <VisitScreen onNavigate={onNavigate} onBack={() => setScreen("ashaDashboard")} />
        )}
        {screen === "riskAlerts" && (
          <RiskAlertsScreen onNavigate={onNavigate} onBack={() => setScreen("ashaDashboard")} />
        )}
        {screen === "sync" && (
          <SyncScreen onNavigate={onNavigate} onBack={() => setScreen("ashaDashboard")} />
        )}
        {screen === "report" && (
          <ReportScreen onNavigate={onNavigate} onBack={() => setScreen("ashaDashboard")} />
        )}
        {screen === "supervisorDashboard" && (
          <SupervisorDashboardScreen onNavigate={onNavigate} onBack={() => setScreen("login")} />
        )}
      </View>
    </SafeAreaView>
  );
}

