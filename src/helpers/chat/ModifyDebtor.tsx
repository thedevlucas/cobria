// Dependencies
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { GridColDef } from "@mui/x-data-grid";

// Constants
import { API_URL, paidStatus } from "../../constants/Constants";

export const columnsDebtor: GridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    flex: 1,
  },
  {
    field: "email",
    headerName: "Correo Deudor",
    flex: 1,
  },
  {
    field: "name",
    headerName: "Nombre",
    flex: 1,
  },
  {
    field: "document",
    headerName: "Documento",
    flex: 1,
  },
  {
    field: "paid",
    headerName: "Estado",
    flex: 1,
  },
];

async function getDebtors() {
  const debtors = await axios.get(`${API_URL}/api/debtor`, {
    headers: {
      Authorization: `Bearer ${Cookies.get("token")}`,
    },
  });
  return debtors.data;
}

export async function getAndTransformDebtors() {
  const debtors = await getDebtors();
  const transformedDebtors = debtors.map((debtor: Record<string, any>) => {
    return {
      ...debtor,

      paid: paidStatus[debtor.paid.toString()],
    };
  });
  return transformedDebtors;
}

export async function createDebtor(
  data: Record<string, any>,
  onSuccess?: () => void
) {
  try {
    const response = await axios.post(`${API_URL}/api/debtor`, data, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    
    await Swal.fire({
      title: "Deudor creado",
      text: response.data.message,
      icon: "success",
      timer: 2000,
    });
    
    // Close modal and refresh data
    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    Swal.fire({
      title: "Error",
      text: error.response?.data?.message || "Error al crear deudor",
      icon: "error",
    });
  }
}

export async function modifyDebtor(
  data: Record<string, any>,
  onSuccess?: () => void
) {
  try {
    const dataBody = { ...data };
    delete dataBody.id;
    const response = await axios.put(`${API_URL}/api/debtor/${data.id}`, dataBody, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    
    await Swal.fire({
      title: "Deudor modificado",
      text: response.data.message,
      icon: "success",
      timer: 2000,
    });
    
    // Close modal and refresh data
    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    Swal.fire({
      title: "Error",
      text: error.response?.data?.message || "Error al modificar deudor",
      icon: "error",
    });
  }
}

export async function deleteDebtor(id: number) {
  try {
    await axios.delete(`${API_URL}/api/debtor/${id}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    Swal.fire({
      title: "Deudor eliminado",
      text: "El deudor ha sido eliminado exitosamente",
      icon: "success",
    });
  } catch (error: any) {
    Swal.fire({
      title: "Error",
      text: error.response.data.message,
      icon: "error",
    });
  }
}
