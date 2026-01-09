import { useState, useEffect } from "react";

export function useLocation() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionState | null>(null);

  // Verificar permisos al montar el componente
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setPermissionStatus(result.state);
        result.onchange = () => setPermissionStatus(result.state); // Escuchar cambios en permisos
      });
    }
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("La geolocalización no es compatible con este navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError(
            "Debes otorgar permisos de ubicación para usar esta función."
          );
        } else {
          setError("No se pudo obtener la ubicación.");
        }
      }
    );
  };
  return { location, error, requestLocation, permissionStatus };
}
