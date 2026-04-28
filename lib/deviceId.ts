import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const KEY = "device_id";

export async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(KEY);
  if (existing) return existing;

  const newId = Crypto.randomUUID();
  await AsyncStorage.setItem(KEY, newId);
  return newId;
}
