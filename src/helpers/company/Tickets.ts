// Dependencies
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

// Constants
import { API_URL } from "../../constants/Constants"; 
import { GridColDef } from "@mui/x-data-grid";

export const columnsTicket: GridColDef[] = [
  {
    field: "id",
    headerName: "ID",
    flex: 1,
  },
  {
    field: "subject",
    headerName: "Asunto",
    flex: 1,
  },
  {
    field: "message",
    headerName: "Mensaje",
    flex: 1,
  },
  {
    field: "status",
    headerName: "Estado",
    flex: 1,
  },
  {
    field: "created_at",
    headerName: "Fecha de creación",
    flex: 1,
  },
];

export async function sendSupportTicket(subject: string, message: string) {
  try {
    await axios.post(
      `${API_URL}/api/company/support-ticket`,
      {
        subject,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    );

    Swal.fire({
      title: "Ticket enviado",
      text: "Tu ticket ha sido enviado correctamente",
      icon: "success",
    });
  } catch (error) {
    console.error(error);

    Swal.fire({
      title: "Error",
      text: "Ocurrió un error al enviar el ticket",
      icon: "error",
    });
  }
}

export async function getTickets(type: "support" | "request_agents") {
  try {
    const response = await axios.get(`${API_URL}/api/admin/tickets?type=${type}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error(error);

    Swal.fire({
      title: "Error",
      text: "Error obteniendo los tickets",
      icon: "error",
    });
  }
}

export async function closeTicket(idTicket: number) {
  try {
    await axios.put(
      `${API_URL}/api/admin/tickets/${idTicket}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    );

    Swal.fire({
      title: "Estado actualizado",
      text: "El ticket fue cerrado",
      icon: "success",
    });
  } catch (error) {
    console.error(error);

    Swal.fire({
      title: "Error",
      text: "Error cerrando el ticket",
      icon: "error",
    });
  }
}