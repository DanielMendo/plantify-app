import ScanningScreen from "@/components/scanning/scanning-screen";
import { getDeviceId } from "@/lib/deviceId";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function ScanningRoute() {
  const { uri } = useLocalSearchParams();
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    callApi();
  }, []);

  const callApi = async () => {
    try {
      const deviceId = await getDeviceId();

      const formData = new FormData();
      formData.append("file", {
        uri: uri as string,
        type: "image/jpeg",
        name: "plant.jpg",
      } as any);
      formData.append("device_id", deviceId);

      const response = await fetch(
        "https://api.srv1622361.hstgr.cloud/predict/",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();
      setResult(data);
    } catch (e) {
      console.error("Error API:", e);
      // Manejar error
    }
  };

  // Navega cuando AMBOS terminaron: animación + API
  useEffect(() => {
    if (result && animDone) {
      router.replace({
        pathname: "/results",
        params: { result: JSON.stringify(result) },
      });
    }
  }, [result, animDone]);

  return (
    <ScanningScreen
      photoUri={uri as string}
      onComplete={() => setAnimDone(true)}
    />
  );
}
