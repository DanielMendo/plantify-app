import { Ionicons } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function CameraScreen() {
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  // Animations
  const scanAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shutterScale = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
    }, []),
  );

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Scanning line loop
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(600),
      ]),
    );
    scan.start();
    return () => scan.stop();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);

    // Shutter press animation
    Animated.sequence([
      Animated.timing(shutterScale, {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shutterScale, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    // Ripple animation
    rippleScale.setValue(0);
    rippleOpacity.setValue(0.6);
    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });

      if (!photo) return;

      setCapturedUri(photo.uri);

      console.log("Navegando a scanning con uri:", photo.uri);

      router.push({
        pathname: "/scanning",
        params: { uri: photo.uri },
      });
    } catch (e) {
      console.error(e);
    } finally {
      setCapturing(false);
    }
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
      allowsEditing: true,
      aspect: [3, 4],
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setCapturedUri(uri);
      console.log("Imagen de galería:", uri);

      router.push({
        pathname: "/scanning",
        params: { uri },
      });
    }
  };

  const scanTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, VIEWFINDER_HEIGHT - 4],
  });

  // — No permission yet —
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#4ade80" size="large" />
      </View>
    );
  }

  // — Permission denied —
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionIcon}>
          <Ionicons name="camera-outline" size={52} color="#4ade80" />
        </View>
        <Text style={styles.permissionTitle}>Acceso a la cámara</Text>
        <Text style={styles.permissionSub}>
          Necesitamos tu cámara para escanear y diagnosticar tu planta.
        </Text>
        <Pressable style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Permitir acceso</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Camera full screen */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        enableTorch={flash}
      />

      {/* Dark vignette overlay */}
      <View style={styles.vignette} pointerEvents="none" />

      <Animated.View style={[styles.ui, { opacity: fadeAnim }]}>
        {/* ── TOP BAR ── */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable style={styles.iconBtn} onPress={() => setFlash((f) => !f)}>
            <Ionicons
              name={flash ? "flash" : "flash-off"}
              size={22}
              color={flash ? "#facc15" : "#fff"}
            />
          </Pressable>

          <View style={styles.titlePill}>
            <Ionicons name="leaf" size={14} color="#4ade80" />
            <Text style={styles.titlePillText}>Escanear planta</Text>
          </View>

          <Pressable
            style={styles.iconBtn}
            onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
          >
            <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* ── VIEWFINDER ── */}
        <View style={styles.viewfinderWrapper}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.TL]} />
          <View style={[styles.corner, styles.TR]} />
          <View style={[styles.corner, styles.BL]} />
          <View style={[styles.corner, styles.BR]} />

          {/* Scanning line */}
          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY: scanTranslateY }] },
            ]}
            pointerEvents="none"
          />

          {/* Hint label */}
          <View style={styles.hintBadge}>
            <Text style={styles.hintText}>Enfoca toda la planta</Text>
          </View>
        </View>

        {/* ── BOTTOM CONTROLS ── */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          {/* Gallery placeholder */}
          <Pressable style={styles.sideBtn} onPress={handlePickFromGallery}>
            <Ionicons name="images-outline" size={26} color="#fff" />
          </Pressable>

          {/* Shutter */}
          <View>
            {/* Ripple */}
            <Animated.View
              style={[
                styles.ripple,
                {
                  transform: [{ scale: rippleScale }],
                  opacity: rippleOpacity,
                },
              ]}
              pointerEvents="none"
            />
            <Animated.View style={{ transform: [{ scale: shutterScale }] }}>
              <Pressable
                style={[styles.shutter, capturing && styles.shutterCapturing]}
                onPress={handleCapture}
                disabled={capturing}
              >
                {capturing ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={styles.shutterInner} />
                )}
              </Pressable>
            </Animated.View>
          </View>

          {/* Info placeholder */}
          <Pressable style={styles.sideBtn}>
            <Ionicons
              name="information-circle-outline"
              size={26}
              color="#fff"
            />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const CORNER = 28;
const THICK = 3;
const VIEWFINDER_W = width * 0.78;
const VIEWFINDER_H = width * 0.78 * 1.18;
// alias for scan line
const VIEWFINDER_HEIGHT = VIEWFINDER_H;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: {
    flex: 1,
    backgroundColor: "#0d1a0d",
    alignItems: "center",
    justifyContent: "center",
  },
  ui: { flex: 1 },

  // Vignette
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    // semi-dark edges via shadow trick
    shadowColor: "#000",
  },

  // ── Permission screen ──
  permissionContainer: {
    flex: 1,
    backgroundColor: "#0d1a0d",
    alignItems: "center",
    justifyContent: "center",
    padding: 36,
    gap: 16,
  },
  permissionIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(74,222,128,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  permissionTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  permissionSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  permissionBtn: {
    marginTop: 8,
    backgroundColor: "#16a34a",
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 32,
  },
  permissionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  // ── Top bar ──
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  titlePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.25)",
  },
  titlePillText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ── Viewfinder ──
  viewfinderWrapper: {
    alignSelf: "center",
    width: VIEWFINDER_W,
    height: VIEWFINDER_H,
    marginTop: "auto",
    marginBottom: "auto",
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: "#4ade80",
  },
  TL: {
    top: 0,
    left: 0,
    borderTopWidth: THICK,
    borderLeftWidth: THICK,
    borderTopLeftRadius: 6,
  },
  TR: {
    top: 0,
    right: 0,
    borderTopWidth: THICK,
    borderRightWidth: THICK,
    borderTopRightRadius: 6,
  },
  BL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: THICK,
    borderLeftWidth: THICK,
    borderBottomLeftRadius: 6,
  },
  BR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: THICK,
    borderRightWidth: THICK,
    borderBottomRightRadius: 6,
  },

  scanLine: {
    position: "absolute",
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#4ade80",
    opacity: 0.7,
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },

  hintBadge: {
    position: "absolute",
    bottom: 14,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  hintText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
  },

  // ── Bottom bar ──
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 48,
    paddingTop: 24,
  },
  sideBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Shutter
  ripple: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4ade80",
    alignSelf: "center",
    top: 0,
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  shutterCapturing: {
    borderColor: "#4ade80",
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
  },
});
