import { translateDisease, translatePlant } from "@/lib/translations";
import { Disease } from "@/types";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const SEVERITY_COLORS: Record<Disease["severity"], string> = {
  LOW: "#16a34a",
  MEDIUM: "#d97706",
  HIGH: "#dc2626",
};

const SEVERITY_LABELS: Record<Disease["severity"], string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

const CommonDiseasesCarousel = () => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    try {
      const response = await fetch(
        "https://api.srv1622361.hstgr.cloud/diseases/featured",
      );
      const data: Disease[] = await response.json();
      setDiseases(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Enfermedades comunes</Text>

      {loading && (
        <ActivityIndicator color="#166534" style={styles.loader} />
      )}

      {error && !loading && (
        <Text style={styles.errorText}>
          No se pudieron cargar las enfermedades.
        </Text>
      )}

      {!loading && !error && (
        <FlatList
          data={diseases}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const disease = translateDisease(item.name);
            return (
              <View style={styles.card}>
                <Image source={{ uri: item.image_url }} style={styles.image} />
                <View style={styles.cardBody}>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: SEVERITY_COLORS[item.severity] + "1A" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        { color: SEVERITY_COLORS[item.severity] },
                      ]}
                    >
                      {SEVERITY_LABELS[item.severity]}
                    </Text>
                  </View>
                  <Text style={styles.name} numberOfLines={2}>
                    {disease.spanish}
                  </Text>
                  {disease.english !== disease.spanish && (
                    <Text style={styles.nameEn} numberOfLines={1}>
                      {disease.english}
                    </Text>
                  )}
                  <Text style={styles.plant}>{translatePlant(item.plant.name)}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

export default CommonDiseasesCarousel;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },

  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#166534",
    marginBottom: 14,
  },

  loader: {
    marginVertical: 20,
  },

  errorText: {
    fontSize: 14,
    color: "#6b7280",
    marginVertical: 10,
  },

  listContent: {
    paddingRight: 10,
  },

  card: {
    width: 180,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    marginRight: 14,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 130,
  },

  cardBody: {
    padding: 12,
  },

  severityBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
  },

  severityText: {
    fontSize: 11,
    fontWeight: "700",
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 2,
  },

  nameEn: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 4,
  },

  plant: {
    fontSize: 13,
    color: "#6b7280",
  },
});
