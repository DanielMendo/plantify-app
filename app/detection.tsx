import { translateDisease, translatePlant } from "@/lib/translations";
import { Detection } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const SEVERITY_CONFIG = {
  LOW: {
    label: "Saludable",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.3)",
    icon: "checkmark-circle" as const,
    emoji: "🌿",
  },
  MEDIUM: {
    label: "Atención",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
    icon: "warning" as const,
    emoji: "⚠️",
  },
  HIGH: {
    label: "Enfermo",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
    icon: "close-circle" as const,
    emoji: "🚨",
  },
};

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
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrap}>
          <Ionicons name={icon} size={15} color="#166534" />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function DetectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { detection: detectionParam } = useLocalSearchParams();

  const detection: Detection = JSON.parse(detectionParam as string);
  const { disease, confidence, image_url, detected_at } = detection;
  const severity = SEVERITY_CONFIG[disease.severity] ?? SEVERITY_CONFIG.LOW;
  const confidencePct = Math.round(confidence * 100);
  const plantLabel = translatePlant(disease.plant.name);
  const diseaseLabel = translateDisease(disease.name);

  const heroScale = useRef(new Animated.Value(1.06)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroScale, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(cardSlide, {
        toValue: 0,
        tension: 55,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.spring(badgeScale, {
        toValue: 1,
        tension: 120,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }, 300);

    setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: confidence,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }, 500);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Hero */}
      <Animated.View
        style={[styles.heroWrapper, { transform: [{ scale: heroScale }] }]}
      >
        <Image
          source={{ uri: image_url }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <Pressable
          style={[styles.backBtn, { top: insets.top + 12 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </Pressable>

        <Animated.View
          style={[
            styles.severityBadge,
            {
              backgroundColor: severity.bg,
              borderColor: severity.border,
              transform: [{ scale: badgeScale }],
            },
          ]}
        >
          <Ionicons name={severity.icon} size={15} color={severity.color} />
          <Text style={[styles.severityBadgeText, { color: severity.color }]}>
            {severity.label}
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Card */}
      <Animated.View
        style={[
          styles.card,
          { opacity: cardOpacity, transform: [{ translateY: cardSlide }] },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.cardScroll,
            { paddingBottom: insets.bottom + 32 },
          ]}
        >
          {/* Title */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.plantName}>{plantLabel}</Text>
              <Text style={styles.diseaseName}>{diseaseLabel.spanish}</Text>
              {diseaseLabel.english !== diseaseLabel.spanish && (
                <Text style={styles.diseaseNameEn}>{diseaseLabel.english}</Text>
              )}
            </View>
            <Text style={styles.emoji}>{severity.emoji}</Text>
          </View>

          {/* Date chip */}
          <View style={styles.dateChip}>
            <Ionicons name="time-outline" size={13} color="#6b7280" />
            <Text style={styles.dateChipText}>{formatDate(detected_at)}</Text>
          </View>

          {/* Confidence */}
          <View style={styles.confidenceBox}>
            <View style={styles.confidenceTop}>
              <Text style={styles.confidenceLabel}>Confianza del modelo</Text>
              <Text style={[styles.confidencePct, { color: severity.color }]}>
                {confidencePct}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressWidth, backgroundColor: severity.color },
                ]}
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <Section title="Descripción" icon="leaf-outline">
            <Text style={styles.bodyText}>{disease.description}</Text>
          </Section>

          {/* Treatment */}
          {disease.treatment ? (
            <Section title="Tratamiento recomendado" icon="medkit-outline">
              <Text style={styles.bodyText}>{disease.treatment}</Text>
            </Section>
          ) : (
            <View style={styles.noTreatmentBox}>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text style={styles.noTreatmentText}>
                Tu planta no requiere tratamiento. ¡Luce perfecta!
              </Text>
            </View>
          )}

          {/* Action */}
          <Pressable
            style={styles.scanBtn}
            onPress={() => router.push("/camera")}
          >
            <Ionicons name="camera-outline" size={18} color="#fff" />
            <Text style={styles.scanBtnText}>Escanear otra planta</Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const HERO_HEIGHT = height * 0.48;
const CARD_OVERLAP = 28;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },

  heroWrapper: {
    width,
    height: HERO_HEIGHT,
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    top: "50%",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  severityBadge: {
    position: "absolute",
    bottom: CARD_OVERLAP + 16,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  severityBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -CARD_OVERLAP,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  cardScroll: {
    padding: 24,
    gap: 20,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerLeft: { flex: 1, gap: 2 },
  plantName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#86efac",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  diseaseName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#14532d",
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  diseaseNameEn: {
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: "400",
    marginTop: 2,
  },
  emoji: { fontSize: 36 },

  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  dateChipText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },

  confidenceBox: {
    gap: 10,
    backgroundColor: "#f0fdf4",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  confidenceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  confidenceLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  confidencePct: {
    fontSize: 13,
    fontWeight: "700",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#dcfce7",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 4,
  },

  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#14532d",
    letterSpacing: 0.1,
  },
  bodyText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
  },

  noTreatmentBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(34,197,94,0.08)",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.2)",
  },
  noTreatmentText: {
    flex: 1,
    fontSize: 13,
    color: "#166534",
    fontWeight: "500",
    lineHeight: 19,
  },

  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 4,
  },
  scanBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
