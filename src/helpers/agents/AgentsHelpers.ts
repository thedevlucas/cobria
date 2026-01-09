import axios from "axios";

import Cookies from "js-cookie";

// Constants
import { API_URL } from "../../constants/Constants";
import Swal from "sweetalert2";
// Tipos para los datos de respuesta
interface PhoneNumber {
  name: string;
  phone: string;
  months: number;
}

interface Agents {
  agents: PhoneNumber[];
}

// Función para buscar números disponibles
export const getAgents = async () => {
  try {
    const response = await axios.get<Agents>(`${API_URL}/api/company/agents`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.data.agents || [];
  } catch (error) {
    console.log(error);
  }
};

export const postAgents = async (data: Agents) => {
  try {
    await axios.post<Response>(`${API_URL}/api/company/request-agents`, data, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    Swal.fire({
      title: "Éxito",
      text: "Agentes solicitados con éxito",
      icon: "success",
      confirmButtonText: "Aceptar",
    });
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: "Error solicitando los agentes",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
};

export async function setAgentToCompany(params: {
  idCompany: number;
  name: string;
  months: number;
  phone: string;
}) {
  try {
    await axios.post(`${API_URL}/api/admin/set-agent`, params, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    Swal.fire({
      title: "Éxito",
      text: "Agente asociado con éxito",
      icon: "success",
      confirmButtonText: "Aceptar",
    });
  } catch (error) {
    console.log(error);

    Swal.fire({
      title: "Error",
      text: "Error asociando el agente",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
}
