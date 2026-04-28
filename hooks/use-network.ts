import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export function useNetwork() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected && state.isInternetReachable !== false);
    });

    NetInfo.fetch().then((state: NetInfoState) => {
      setIsConnected(state.isConnected && state.isInternetReachable !== false);
    });

    return unsubscribe;
  }, []);

  const retry = async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    const connected = state.isConnected && state.isInternetReachable !== false;
    setIsConnected(connected);
    return connected ?? false;
  };

  return { isConnected, retry };
}
