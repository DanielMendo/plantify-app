import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";

import Animated, { FadeInDown } from "react-native-reanimated";

export default function Index() {
  useEffect(() => {
    const checkWelcome = async () => {
      try {
        const hasSeenWelcome = await AsyncStorage.getItem("hasSeenWelcome");

        if (hasSeenWelcome === "true") {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/welcome");
        }
      } catch (error) {
        console.log(error);
        router.replace("/welcome");
      }
    };

    const timer = setTimeout(checkWelcome, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#14532d",
      }}
    >
      <StatusBar style="light" />
      <Animated.Image
        source={require("../assets/images/welcome.png")}
        entering={FadeInDown.duration(700).springify()}
        style={{ height: 200, width: 200, resizeMode: "contain" }}
        resizeMode={"contain"}
      />
    </View>
  );
}
