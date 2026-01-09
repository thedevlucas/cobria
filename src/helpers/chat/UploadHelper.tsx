// Dependencies
import axios from "axios";
import Swal from "sweetalert2";
import { NavigateFunction } from "react-router-dom";
import Cookies from "js-cookie";
// Constants
import { API_URL, defaultCountryCode } from "../../constants/Constants";

export async function uploadFile(
  file: File,
  navigate: NavigateFunction,
  source: "whatsapp" | "sms" | "email" | "call",
  countryCode = defaultCountryCode.phone,
  idClient?: number,
  agentPhoneNumber?: string
) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("countryCode", countryCode);

    if (idClient) {
      formData.append("idClient", idClient.toString());
    }

    if (agentPhoneNumber) {
      formData.append("agentPhoneNumber", agentPhoneNumber);
    }

    console.log({ idClient, agentPhoneNumber, countryCode });

    await axios.post(`${API_URL}/api/${source}/send/csv`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    Swal.fire({
      icon: "success",
      title: "Archivo subido",
      text: "El archivo se subió correctamente. Redirigiendo al dashboard en tiempo real...",
      timer: 3000,
      showConfirmButton: false
    }).then(() => {
      navigate("/real-time-dashboard");
    });
  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.response.data.message,
    });
  }
}
