import { useEffect, useState } from "react";
import { getDeviceId, setDeviceId } from "../services/storageService";

const createDeviceId = () => {
  return `dc_${Date.now()}_${Math.random().toString(16).slice(2, 12)}`;
};

export default function useDeviceId() {
  const [deviceId, setDeviceIdState] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const existing = await getDeviceId();
      const resolved = existing || createDeviceId();
      if (!existing) {
        await setDeviceId(resolved);
      }
      if (mounted) {
        setDeviceIdState(resolved);
        setLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  return { deviceId, loading };
}
