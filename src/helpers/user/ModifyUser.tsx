// Dependencies
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { GridColDef } from "@mui/x-data-grid";
// Constants
import {
  API_URL,
  state2String,
  englishRole2Spanish,
} from "../../constants/Constants";

export const columnsUser: GridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    flex: 1,
  },
  {
    field: "name",
    headerName: "Nombre",
    flex: 1,
  },
  {
    field: "email",
    headerName: "Correo",
    flex: 1,
  },
  {
    field: "password",
    headerName: "Contraseña",
    flex: 1,
  },
  {
    field: "active",
    headerName: "Estado",
    flex: 1,
  },
  {
    field: "role",
    headerName: "Rol",
    flex: 1,
  },
  {
    field: "cellphone",
    headerName: "Celular",
    flex: 1,
  },
  {
    field: "telephone",
    headerName: "Teléfono",
    flex: 1,
  },
];

async function getUsers() {
  const users = await axios.get(`${API_URL}/admin`, {
    headers: {
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
  });
  return users;
}

export async function getAndTransformUsers() {
  const users = await getUsers();
  const usersData = users.data.map((user: any) => {
    return {
      ...user,
      role: englishRole2Spanish[user.role.toString()],
      active: state2String[user.active.toString()],
    };
  });
  return usersData;
}

export const getAssociatedAgents = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/agents`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting agents:", error);
    return []; 
  }
};

export async function createUser(data: Record<string, any>) {
  try {
    await axios.post(`${API_URL}/admin`, data, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    Swal.fire({
      title: "Usuario creado",
      icon: "success",
      text: "El usuario ha sido creado exitosamente",
    });
  } catch (error: any) {
    Swal.fire({
      title: "Error",
      icon: "error",
      text: error.response.data.message,
    });
  }
}

export async function deleteUser(id: number) {
  try {
    await axios.delete(`${API_URL}/admin/${id}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    Swal.fire({
      title: "Usuario eliminado",
      icon: "success",
      text: "El usuario ha sido eliminado exitosamente",
    });
  } catch (error: any) {
    Swal.fire({
      title: "Error",
      icon: "error",
      text: error.response.data.message,
    });
  }
}

export async function changeStateUser(id: number) {
  try {
    await axios.patch(
      `${API_URL}/admin/${id}/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    );
    Swal.fire({
      title: "Estado cambiado",
      icon: "success",
      text: "El estado del usuario ha sido cambiado exitosamente",
    });
  } catch (error: any) {
    Swal.fire({
      title: "Error",
      icon: "error",
      text: error.response.data.message,
    });
  }
}

export async function modifyUser(data: Record<string, any>) {
  try {
    const dataBody = { ...data };
    delete dataBody.id;
    const response = await axios.put(`${API_URL}/admin/${data.id}`, dataBody, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    Swal.fire({
      title: "Usuario modificado",
      icon: "success",
      text: response.data.message,
    });
  } catch (error: any) {
    Swal.fire({
      title: "Error",
      icon: "error",
      text: error.response.data.message,
    });
  }
}
