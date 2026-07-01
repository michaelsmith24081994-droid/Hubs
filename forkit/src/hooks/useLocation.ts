import { useCallback, useState } from 'react';
import * as Location from 'expo-location';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

export function useLocation() {
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [coords, setCoords] = useState<Coordinates | null>(null);

  const requestLocation = useCallback(async () => {
    setStatus('requesting');
    try {
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();
      if (permissionStatus !== 'granted') {
        setStatus('denied');
        return null;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCoords(next);
      setStatus('granted');
      return next;
    } catch {
      setStatus('error');
      return null;
    }
  }, []);

  const setManualLocation = useCallback((next: Coordinates) => {
    setCoords(next);
    setStatus('granted');
  }, []);

  return { status, coords, requestLocation, setManualLocation };
}
