// import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "@/components/button";
import { colors } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export default function WelcomeScreen() {
  const handleContinue = async () => {
    await AsyncStorage.setItem("hasSeenWelcome", "true");
    router.replace("/home");
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: colors.white, fontSize: 42, fontWeight: "900" }}>
          Plantify
        </Text>
      </View>

      <Animated.Image
        entering={FadeIn.duration(700)}
        source={require("../assets/images/welcome.png")}
        style={styles.welcomeImage}
        resizeMode={"contain"}
      />

      <View style={styles.containerButton}>
        <View>
          <Text
            style={{ color: colors.white, fontSize: 33, fontWeight: "800" }}
          >
            Tu guía para el
          </Text>
          <Text
            style={{ color: colors.white, fontSize: 33, fontWeight: "800" }}
          >
            cuidado de tus
          </Text>
          <Text
            style={{ color: colors.white, fontSize: 33, fontWeight: "800" }}
          >
            plantas
          </Text>
        </View>
        <Button onPress={handleContinue}>
          <Text
            style={{ color: colors.white, fontSize: 16, fontWeight: "800" }}
          >
            Comenzar
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#14532d",
  },
  background: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
  welcomeImage: {
    height: 200,
    aspectRatio: 1,
    alignSelf: "center",
  },
  containerButton: {
    display: "flex",
    flexDirection: "column",
    gap: 30,
  },
});
