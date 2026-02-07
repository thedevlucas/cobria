// Dependencies
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
// Constants
import { API_URL } from "../../constants/Constants";

export async function getCost() {
  try {
    const response = await axios.get(`${API_URL}/admin/costs`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    return response.data;
  } catch (error) {
    Swal.fire({
      title: "Error",
      icon: "error",
      text: "No puedo obtener el costo del servicio",
    });
  }
}
