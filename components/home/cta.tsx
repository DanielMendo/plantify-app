import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function CTA() {
  return (
    <View style={styles.cta}>
      <View style={{ marginBottom: 12 }}>
        <Ionicons
          name="leaf-outline"
          size={30}
          color="#22c55e"
          style={{ marginBottom: 10 }}
        />
      </View>

      <Text style={styles.ctaTitle}>Plantify</Text>

      <Text style={styles.ctaText}>
        Plantify está hecho para ayudarte a reconocer plantas fácilmente,
        aprender sobre ellas y disfrutar más de la naturaleza que te rodea.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cta: {
    marginVertical: 30,
    padding: 22,
    borderRadius: 10,
    backgroundColor: "#166534",
    borderWidth: 1,
    borderColor: "#ece8e8",
    alignItems: "center",
  },

  ctaTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 6,
  },

  ctaText: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 20,
  },
});
