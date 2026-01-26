// Dependencies
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { NavigateFunction } from "react-router-dom";
// Constans
import { API_URL } from "../../constants/Constants";
// Helpers
import { date2StringChat } from "../DateHelper";

export async function getCellphones(navigate: NavigateFunction, idToken: number) {
  try {
    const cellphones = await axios.get(`${API_URL}/api/cellphone/${idToken}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    return cellphones.data;
  } catch (error) {
    navigate("/upload-excel");
    Swal.fire({
      title: "Error",
      icon: "error",
      text: "No se han podido cargar los celulares",
    });
  }
}

export async function createCellphone(data: Record<string, any>, idToken: number) {
  try {
    await axios.post(`${API_URL}/api/cellphone/${idToken}`, data, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    Swal.fire({
      title: "Celular creado",
      icon: "success",
      text: `El teléfono ha sido creado`,
    });
  } catch (error: any) {
    Swal.fire({
      title: "Error",
      icon: "error",
      text: error.response?.data?.message || "Error al crear celular",
    });
  }
}

export async function deleteCellphone(
  id: number,
  idToken: number,
  setter: React.Dispatch<React.SetStateAction<number>>
) {
  Swal.fire({
    title: "¿Estás seguro de que quieres borrar este celular?",
    showDenyButton: true,
    confirmButtonText: `Sí, borrar celular`,
    denyButtonText: `No, cancelar`,
  }).then(async (result) => {
    try {
      if (result.isConfirmed) {
        // MODIFICADO: Se agrega /${idToken} al final de la URL
        const response = await axios.delete(`${API_URL}/api/cellphone/${id}/${idToken}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        setter(0);
        Swal.fire({
          title: "Celular borrado",
          icon: "success",
          text: response.data.message,
        });
      } else {
        Swal.fire({
          title: "Operación cancelada",
          icon: "info",
          text: "No se ha borrado el celular",
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error al borrar el número",
        icon: "error",
        text: error.response?.data?.message || "Error al borrar",
      });
    }
  });
}

export async function getChats(cellphone: number, navigate: NavigateFunction) {
  try {
    const chats = await axios.get(`${API_URL}/api/whatsapp/chat/${cellphone}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    // ✅ FILTRO: ocultar mensajes internos de IA para que no se vean en el chat
    const filtered = (chats.data || []).filter((chat: Record<string, any>) => {
      const msg = (chat.message ?? "").toString();
      return !msg.startsWith("[AI_CONTEXT_INTERNAL]");
    });

    return filtered.map((chat: Record<string, any>) => {
      return {
        ...chat,
        createdAt: date2StringChat(chat.createdAt),
      };
    });
  } catch (error) {
    navigate("/upload-excel");
    Swal.fire({
      title: "Error",
      icon: "error",
      text: "No se han podido cargar los chats",
    });
  }
}

export async function createMessage(
  data: Record<string, any>,
  cellphone: number,
  setterMessage: React.Dispatch<React.SetStateAction<string>>
) {
  try {
    await axios.post(`${API_URL}/api/whatsapp/chat/${cellphone}`, data, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    setterMessage("");
  } catch (error: any) {
    Swal.fire({
      title: "Error",
      icon: "error",
      text: error.response?.data?.message || "Error al enviar mensaje",
    });
  }
}

export function arrayBuffer2Base64(buffer: any) {
  let binary = "";
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
