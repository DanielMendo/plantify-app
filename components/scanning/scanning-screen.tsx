import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

const STEPS = [
  "Analizando la imagen...",
  "Identificando la especie...",
  "Buscando enfermedades comunes...",
  "Preparando el diagnóstico...",
];

interface ScanningScreenProps {
  photoUri?: string;
  onComplete?: () => void;
}

export default function ScanningScreen({
  photoUri,
  onComplete,
}: ScanningScreenProps) {
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);

  // ── Animations ──
  const outerRing = useRef(new Animated.Value(0)).current;
  const middleRing = useRef(new Animated.Value(0)).current;
  const innerRing = useRef(new Animated.Value(0)).current;
  const leafScale = useRef(new Animated.Value(0.8)).current;
  const leafOpacity = useRef(new Animated.Value(0)).current;
  const stepFade = useRef(new Animated.Value(1)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 6 }, () => ({
      angle: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    // ── Spinning rings ──
    const spinRing = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );

    spinRing(outerRing, 7000).start();
    spinRing(middleRing, 4500).start();
    spinRing(innerRing, 3000).start();

    // ── Leaf entrance ──
    Animated.parallel([
      Animated.spring(leafScale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(leafOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // ── Leaf pulse ──
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(leafScale, {
          toValue: 1.06,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(leafScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    setTimeout(() => pulse.start(), 700);

    // ── Floating particles ──
    particleAnims.forEach((p, i) => {
      const delay = i * 300;
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(p.opacity, {
              toValue: 0.7,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(p.scale, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(p.angle, {
              toValue: 1,
              duration: 2000,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(p.angle, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(p.scale, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(1800 - delay),
        ]),
      ).start();
    });

    // ── Step cycling ──
    const STEP_DURATION = 2200;
    const cycleStep = (index: number) => {
      if (index >= STEPS.length) {
        // Animate progress to 100% then call onComplete
        Animated.timing(progressWidth, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }).start(() => setTimeout(() => onComplete?.(), 600));
        return;
      }

      // Fade out → change text → fade in
      Animated.timing(stepFade, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setStepIndex(index);
        Animated.timing(stepFade, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      });

      // Progress bar
      Animated.timing(progressWidth, {
        toValue: (index + 1) / STEPS.length,
        duration: STEP_DURATION,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();

      setTimeout(() => cycleStep(index + 1), STEP_DURATION);
    };

    const timer = setTimeout(() => cycleStep(0), 400);
    return () => clearTimeout(timer);
  }, []);

  const toRotation = (anim: Animated.Value, invert = false) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: invert ? ["360deg", "0deg"] : ["0deg", "360deg"],
    });

  // Particle positions (evenly around a circle)
  const PARTICLE_RADIUS = 80;
  const getParticleStyle = (index: number, anim: (typeof particleAnims)[0]) => {
    const baseAngle = (index / particleAnims.length) * Math.PI * 2;
    const x = Math.cos(baseAngle) * PARTICLE_RADIUS;
    const y = Math.sin(baseAngle) * PARTICLE_RADIUS;
    const endY = y - 30;

    const translateY = anim.angle.interpolate({
      inputRange: [0, 1],
      outputRange: [y, endY],
    });

    return {
      transform: [{ translateX: x }, { translateY }, { scale: anim.scale }],
      opacity: anim.opacity,
    };
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Blurred photo background */}
      {photoUri && (
        <Image
          source={{ uri: photoUri }}
          style={styles.bgPhoto}
          blurRadius={18}
        />
      )}

      {/* Dark gradient overlay */}
      <View style={styles.overlay} />

      {/* Decorative background circles */}
      <View style={styles.bgCircleOuter} />
      <View style={styles.bgCircleInner} />

      {/* Content */}
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
        ]}
      >
        {/* Top label */}
        <View style={styles.topBadge}>
          <View style={styles.topBadgeDot} />
          <Text style={styles.topBadgeText}>IA analizando</Text>
        </View>

        {/* ── Orbital animation ── */}
        <View style={styles.orbitalWrapper}>
          {/* Outer ring */}
          <Animated.View
            style={[
              styles.ring,
              styles.ringOuter,
              { transform: [{ rotate: toRotation(outerRing) }] },
            ]}
          />
          {/* Middle ring */}
          <Animated.View
            style={[
              styles.ring,
              styles.ringMiddle,
              { transform: [{ rotate: toRotation(middleRing, true) }] },
            ]}
          />
          {/* Inner ring */}
          <Animated.View
            style={[
              styles.ring,
              styles.ringInner,
              { transform: [{ rotate: toRotation(innerRing) }] },
            ]}
          />

          {/* Floating particles */}
          {particleAnims.map((p, i) => (
            <Animated.View
              key={i}
              style={[styles.particle, getParticleStyle(i, p)]}
            />
          ))}

          {/* Center leaf icon */}
          <Animated.View
            style={[
              styles.leafCircle,
              { opacity: leafOpacity, transform: [{ scale: leafScale }] },
            ]}
          >
            <Text style={styles.leafEmoji}>🌿</Text>
          </Animated.View>
        </View>

        {/* ── Text section ── */}
        <View style={styles.textSection}>
          <Text style={styles.headline}>Estamos escaneando{"\n"}tu planta</Text>

          <Animated.Text style={[styles.stepText, { opacity: stepFade }]}>
            {STEPS[stepIndex]}
          </Animated.Text>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
            <View style={styles.progressGlow} />
          </View>

          {/* Steps dots */}
          <View style={styles.dotsRow}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[styles.stepDot, i <= stepIndex && styles.stepDotActive]}
              />
            ))}
          </View>
        </View>

        {/* Bottom hint */}
        <Text style={styles.hint}>Esto puede tardar unos segundos</Text>
      </View>
    </View>
  );
}

const RING_OUTER = 220;
const RING_MIDDLE = 170;
const RING_INNER = 120;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071a0e",
  },

  bgPhoto: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 20, 10, 0.82)",
  },

  bgCircleOuter: {
    position: "absolute",
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    backgroundColor: "rgba(34,197,94,0.04)",
    alignSelf: "center",
    top: height * 0.1,
  },
  bgCircleInner: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: "rgba(34,197,94,0.06)",
    alignSelf: "center",
    top: height * 0.18,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
  },

  // Top badge
  topBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(34,197,94,0.12)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.25)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  topBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4ade80",
  },
  topBadgeText: {
    color: "#4ade80",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Orbital
  orbitalWrapper: {
    width: RING_OUTER,
    height: RING_OUTER,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
    borderStyle: "dashed",
  },
  ringOuter: {
    width: RING_OUTER,
    height: RING_OUTER,
    borderWidth: 1.5,
    borderColor: "rgba(74,222,128,0.2)",
  },
  ringMiddle: {
    width: RING_MIDDLE,
    height: RING_MIDDLE,
    borderWidth: 1.5,
    borderColor: "rgba(74,222,128,0.35)",
  },
  ringInner: {
    width: RING_INNER,
    height: RING_INNER,
    borderWidth: 2,
    borderColor: "rgba(74,222,128,0.55)",
    borderStyle: "solid",
  },
  particle: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4ade80",
    shadowColor: "#4ade80",
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 4,
  },
  leafCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(34,197,94,0.15)",
    borderWidth: 2,
    borderColor: "rgba(74,222,128,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  leafEmoji: {
    fontSize: 36,
  },

  // Text
  textSection: {
    width: "100%",
    alignItems: "center",
    gap: 14,
  },
  headline: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  stepText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.2,
    textAlign: "center",
  },

  // Progress
  progressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 2,
    overflow: "hidden",
    marginTop: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4ade80",
    borderRadius: 2,
    shadowColor: "#4ade80",
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  progressGlow: {
    position: "absolute",
    right: 0,
    top: -2,
    width: 12,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#86efac",
    opacity: 0.6,
  },

  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  stepDotActive: {
    backgroundColor: "#4ade80",
    shadowColor: "#4ade80",
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 2,
  },

  hint: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 12,
    letterSpacing: 0.3,
    textAlign: "center",
  },
});
