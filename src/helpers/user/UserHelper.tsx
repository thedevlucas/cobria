// Dependencies
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { NavigateFunction } from "react-router-dom";
// Constants
import { API_URL, User } from "../../constants/Constants";

export async function getName() {
  try {
    const response = await axios.get(`${API_URL}/api/user/name`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.data.name;
  } catch (error: any) {
    return "";
  }
}

export async function getCellphone() {
  try {
    const response = await axios.get(`${API_URL}/api/user/cellphone`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    const cellphone = response.data.cellphone;
    if (cellphone === null) return "";
    return "+" + response.data.cellphone;
  } catch (error: any) {
    return "";
  }
}

export async function getTelephone() {
  try {
    const response = await axios.get(`${API_URL}/api/user/telephone`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    const telephone = response.data.telephone;
    if (telephone === null) return "";
    return "+" + response.data.telephone;
  } catch (error: any) {
    return "";
  }
}

export async function getMyInfo() {
  try {
    const response = await axios.get<User>(`${API_URL}/api/user/me`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.data;
  } catch (error: any) {
    return undefined;
  }
}

export async function redirectNoCellphone(navigate: NavigateFunction) {
  const cellphone = await getCellphone();
  if (cellphone === "") {
    navigate("/upload-excel");
    Swal.fire({
      title: "Error",
      icon: "error",
      text: "No tienes un celular asignado, por favor, pide uno",
    });
  }
}

export async function redirectNoTelephone(navigate: NavigateFunction) {
  const telephone = await getTelephone();
  if (telephone === "") {
    navigate("/upload-excel");
    Swal.fire({
      title: "Error",
      icon: "error",
      text: "No tienes un teléfono asignado, por favor, pide uno",
    });
  }
}

export async function deleteSelf(navigate: NavigateFunction) {
  Swal.fire({
    title: "¿Estás seguro de que quieres borrar tu cuenta?",
    showDenyButton: true,
    confirmButtonText: `Sí, borrar cuenta`,
    denyButtonText: `No, cancelar`,
  }).then(async (result) => {
    try {
      if (result.isConfirmed) {
        const response = await axios.delete(`${API_URL}/api/user/`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        navigate("/");
        Swal.fire({
          title: "Cuenta borrada con éxito",
          icon: "success",
          text: response.data.message,
        });
      } else {
        Swal.fire({
          title: "Operación cancelada",
          icon: "info",
          text: "No se ha borrado la cuenta",
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error al borrar la cuenta",
        icon: "error",
        text: error.response.data.message,
      });
    }
  });
}

export async function modifyPassword(
  data: Record<string, any>,
  navigate: NavigateFunction
) {
  Swal.fire({
    title: "¿Estás seguro de que quieres cambiar tu contraseña?",
    showDenyButton: true,
    confirmButtonText: `Sí, cambiar contraseña`,
    denyButtonText: `No, cancelar`,
  }).then(async (result) => {
    try {
      if (result.isConfirmed) {
        const response = await axios.patch(`${API_URL}/api/user`, data, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
        navigate("/");
        Swal.fire({
          title: "Contraseña cambiada con éxito",
          icon: "success",
          text: response.data.message,
        });
      } else {
        Swal.fire({
          title: "Operación cancelada",
          icon: "info",
          text: "No se ha cambiado la contraseña",
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error al cambiar la contraseña",
        icon: "error",
        text: error.response.data.message,
      });
    }
  });
}
