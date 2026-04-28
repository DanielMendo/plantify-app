import Header from "@/components/header";
import PopularPlantsCarousel from "@/components/home/common-diseases-carousel";
import CTA from "@/components/home/cta";
import RecentIdentifications from "@/components/home/recent-identifications";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { StatusBar, setStatusBarStyle } from "expo-status-bar";
import { useCallback } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("dark");
    }, []),
  );
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      <Header tab="Inicio" />
      <View style={styles.options}>
        <View style={styles.left}>
          <Ionicons name="camera" size={26} color="#22c55e" />
          <View>
            <Text style={styles.title}>Diagnosticar</Text>
            <Text style={styles.subtitle}>Usando tu cámara</Text>
          </View>
        </View>
        <Image
          source={require("@/assets/images/welcome.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <PopularPlantsCarousel />

      <RecentIdentifications />

      <CTA />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },

  options: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    backgroundColor: "white",
    padding: 16,
    borderRadius: 14,
    borderColor: "#ece8e8",
    borderWidth: 1,

    marginBottom: 20,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
  },

  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#166534",
  },

  image: {
    width: 70,
    height: 70,
  },

  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});
