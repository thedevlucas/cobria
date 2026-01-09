import axios from "axios";
import Cookies from "js-cookie";
import { API_URL } from "../../constants/Constants";

// Tipos para los datos de respuesta
export interface PhoneNumber {
  friendly_name: string;
  phone_number: string;
  price: number;
}

interface SearchResponse {
  success: boolean;
  phone_numbers: PhoneNumber[];
  count: number;
}

// Función para buscar números disponibles (AHORA DESDE EL BACKEND - SEGURO)
export const searchPhoneNumbers = async (
  country: string
): Promise<PhoneNumber[]> => {
  try {
    const token = Cookies.get("token");
    
    if (!token) {
      throw new Error("No hay sesión activa");
    }

    // Llamar al backend en lugar de Twilio directamente
    const response = await axios.get<SearchResponse>(
      `${API_URL}/api/phone-numbers/search/${country}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.phone_numbers || [];
  } catch (error: any) {
    console.error("Error al buscar números:", error);
    
    // Mejor manejo de errores
    if (error.response?.status === 401) {
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }
    
    if (error.response?.status === 503) {
      const message = error.response?.data?.message || "Servicio Twilio no disponible";
      throw new Error(`❌ ${message}\n\n${error.response?.data?.error || ""}`);
    }
    
    throw new Error(error.response?.data?.error || "Error al buscar números disponibles");
  }
};

// Función para comprar un número
export const purchasePhoneNumber = async (phoneNumber: string): Promise<void> => {
  try {
    const token = Cookies.get("token");
    
    if (!token) {
      throw new Error("No hay sesión activa");
    }

    await axios.post(
      `${API_URL}/api/phone-numbers/purchase`,
      { phoneNumber },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: any) {
    console.error("Error al comprar número:", error);
    throw new Error(error.response?.data?.error || "Error al comprar número");
  }
}
