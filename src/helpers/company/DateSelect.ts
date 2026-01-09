import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
// Constans
import { API_URL } from "../../constants/Constants";

export interface DateSelectResponse {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
}

export async function postMyDateSelect({
  selectedDays,
  fromTime,
  toTime,
}: {
  selectedDays: number[];
  fromTime: string;
  toTime: string;
}) {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    await axios.post(
      `${API_URL}/api/company/config/messages-schedule`,
      {
        days_of_week: selectedDays, // Renombrar selectDays a days_of_week
        start_time: fromTime,
        end_time: toTime,
        timezone,
      },
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    );
  } catch (error: any) {
    Swal.fire({
      title: "Error",
      icon: "error",
      text: error.response.data.message,
    });
  }
}
export async function getMyDateSelect(): Promise<DateSelectResponse> {
  try {
    const response = await axios.get(`${API_URL}/api/company/message-schedule`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    // Asegúrate de que la respuesta sea válida y de la estructura esperada
    return (
      response.data.data || {
        daysOfWeek: [],
        endTime: "",
        startTime: "",
      }
    );
  } catch (error: any) {
    Swal.fire({
      title: "Error",
      icon: "error",
      text: error.response?.data?.message || "Hubo un error en la solicitud.",
    });
    // Retorna un valor por defecto en caso de error
    return {
      daysOfWeek: [],
      endTime: "",
      startTime: "",
    };
  }
}
