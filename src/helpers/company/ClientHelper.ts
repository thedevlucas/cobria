// Dependencies
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

// Constants
import { API_URL } from "../../constants/Constants";
import { GridColDef } from "@mui/x-data-grid";

export const columnsClient: GridColDef[] = [
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
    field: "activity",
    headerName: "Actividad",
    flex: 1,
  },
  {
    field: "service",
    headerName: "Servicios",
    flex: 1,
  },
  {
    field: "segment",
    headerName: "Rubro",
    flex: 1,
  },
  {
    field: "address",
    headerName: "Direccion",
    flex: 1,
  },
  {
    field: "phone",
    headerName: "Telefono",
    flex: 1,
  },
];

export async function getClients() {
  try {
    const clients = await axios.get(`${API_URL}/api/company/client`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    return clients.data;
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: "Error obteniendo los clientes",
      icon: "error",
    });
  }
}

export async function createClient(data: Record<string, string>) {
  try {
    await axios.post(`${API_URL}/api/company/client`, data, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    Swal.fire({
      title: "Éxito",
      text: "Cliente creado con éxito",
      icon: "success",
      confirmButtonText: "Aceptar",
    });
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: "Error creando el cliente",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  }
}

export async function modifyClient(data: Record<string, string>) {
  try {
    const dataBody = { ...data };

    delete dataBody.id;

    await axios.put(`${API_URL}/api/company/client/${data.id}`, dataBody, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    Swal.fire({
      title: "Deudor modificado",
      text: "Cliente modificado con éxito",
      icon: "success",
    });
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: "Error modificando el cliente",
      icon: "error",
    });
  }
}

export async function deleteClient(clientId: number) {
  try {
    await axios.delete(`${API_URL}/api/company/client/${clientId}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    Swal.fire({
      title: "Cliente eliminado",
      text: "El cliente ha sido eliminado exitosamente",
      icon: "success",
    });
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: "Error eliminando el cliente",
      icon: "error",
    });
  }
}
