// Dependencies
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { NavigateFunction } from "react-router-dom";
// Constans
import { API_URL } from "../../constants/Constants";
// Helpers
import { date2StringChat } from "../DateHelper";

export async function getTelephones(navigate: NavigateFunction) {
  try {
    const telephones = await axios.get(`${API_URL}/api/telephone`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return telephones.data;
  } catch (error) {
    navigate("/upload-excel");
    Swal.fire({
      title: "Error",
      icon: "error",
      text: "No se han podido cargar los teléfonos",
    });
  }
}

export async function deleteTelephone(
  id: number,
  setter: React.Dispatch<React.SetStateAction<number>>
) {
  Swal.fire({
    title: "¿Estás seguro de que quieres borrar este teléfono?",
    showDenyButton: true,
    confirmButtonText: `Sí, borrar teléfono`,
    denyButtonText: `No, cancelar`,
  }).then(async (result) => {
    try {
      if (result.isConfirmed) {
        const response = await axios.delete(`${API_URL}/api/telephone/${id}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        Swal.fire({
          title: "Teléfono borrado",
          icon: "success",
          text: response.data.message,
        });
        setter(0);
      } else {
        Swal.fire({
          title: "Cancelado",
          icon: "info",
          text: "El teléfono no ha sido borrado",
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        icon: "error",
        text: error.response.data.message,
      });
    }
  });
}

export async function getCallChats(
  telephone: number,
  navigate: NavigateFunction
) {
  try {
    const chats = await axios.get(`${API_URL}/api/call/chat/${telephone}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return chats.data.map((chat: Record<string, any>) => {
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
      text: "No se han podido cargar los registros",
    });
  }
}
