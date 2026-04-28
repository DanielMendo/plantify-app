import Header from "@/components/header";
import { getDeviceId } from "@/lib/deviceId";
import { translateDisease, translatePlant } from "@/lib/translations";
import { Detection } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle, StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const time = date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return `Hoy, ${time}`;
  if (isYesterday) return `Ayer, ${time}`;

  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LogScreen() {
  const router = useRouter();
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("dark");
      fetchDetections();
    }, []),
  );

  const fetchDetections = async () => {
    setLoading(true);
    try {
      const deviceId = await getDeviceId();
      const response = await fetch(
        `https://api.srv1622361.hstgr.cloud/detections/${deviceId}`,
      );
      const data: { device_id: string; detections: Detection[] } =
        await response.json();
      setDetections(data.detections);
    } catch {
      setDetections([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      <Header tab="Historial" />

      {loading && <ActivityIndicator color="#166534" style={styles.loader} />}

      {!loading && detections.length === 0 && (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons name="leaf-outline" size={28} color="#22c55e" />
          </View>
          <Text style={styles.emptyTitle}>Aún no hay identificaciones</Text>
          <Text style={styles.emptyText}>
            Cuando escanees una planta, aquí aparecerán tus resultados.
          </Text>
        </View>
      )}

      {!loading && detections.length > 0 && (
        <View style={styles.list}>
          {detections.map((item) => {
            const disease = translateDisease(item.disease.name);
            return (
              <Pressable
                key={item.id}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/detection",
                    params: { detection: JSON.stringify(item) },
                  })
                }
              >
                <Image source={{ uri: item.image_url }} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>
                    {disease.spanish}
                  </Text>
                  {disease.english !== disease.spanish && (
                    <Text style={styles.nameEn} numberOfLines={1}>
                      {disease.english}
                    </Text>
                  )}
                  <Text style={styles.sub} numberOfLines={1}>
                    {translatePlant(item.disease.plant.name)} •{" "}
                    {(item.confidence * 100).toFixed(1)}% confianza
                  </Text>
                  <Text style={styles.date}>
                    {formatDate(item.detected_at)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },

  content: {
    paddingBottom: 40,
  },

  loader: {
    marginTop: 40,
  },

  list: {
    gap: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#f0f0f0",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },

  image: {
    width: 56,
    height: 56,
    borderRadius: 14,
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 1,
  },

  nameEn: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 2,
  },

  sub: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 2,
  },

  date: {
    fontSize: 12,
    color: "#9ca3af",
  },

  emptyCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: "center",
  },

  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 6,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
