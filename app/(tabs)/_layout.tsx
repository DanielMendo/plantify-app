import { HapticTab } from "@/components/haptic-tab";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router"; // 👈 agrega useRouter
import React from "react";
import { TouchableOpacity, View } from "react-native";

export default function TabLayout() {
  const router = useRouter(); // 👈

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 0,
          height: 70,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size ?? 28} color={color} />
          ),
        }}
      />

      {/* 👇 Pantalla dummy — nunca se renderiza, solo sirve de placeholder */}
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarButton: () => (
            <TouchableOpacity
              onPress={() => router.push("/camera")} // 👈 navega fuera de tabs
              activeOpacity={0.9}
              style={{
                top: -15,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "#22c55e",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 6,
                }}
              >
                <Ionicons name="camera-outline" size={30} color="white" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="log"
        options={{
          title: "Historial",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size ?? 28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
