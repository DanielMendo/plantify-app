import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  onRetry: () => Promise<boolean>;
}

export default function NoInternet({ onRetry }: Props) {
  const insets = useSafeAreaInsets();
  const [checking, setChecking] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleRetry = async () => {
    setChecking(true);
    setFailed(false);
    const connected = await onRetry();
    setChecking(false);
    if (!connected) setFailed(true);
  };

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="wifi-outline" size={52} color="#16a34a" />
      </View>

      <Text style={styles.title}>Sin conexión</Text>
      <Text style={styles.body}>
        Conéctate a WiFi o datos móviles para poder escanear tus plantas y ver
        tu historial.
      </Text>

      {failed && (
        <Text style={styles.errorHint}>
          Aún sin conexión. Verifica tu red e intenta de nuevo.
        </Text>
      )}

      <TouchableOpacity
        style={[styles.btn, checking && styles.btnDisabled]}
        onPress={handleRetry}
        activeOpacity={0.8}
        disabled={checking}
      >
        {checking ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="refresh-outline" size={18} color="#fff" />
            <Text style={styles.btnText}>Reintentar</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 16,
  },

  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#14532d",
    textAlign: "center",
  },

  body: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },

  errorHint: {
    fontSize: 13,
    color: "#ef4444",
    textAlign: "center",
  },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 8,
  },

  btnDisabled: {
    opacity: 0.6,
  },

  btnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
