// Dependencies
import axios from "axios";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { NavigateFunction } from "react-router-dom";
// Constants
import { API_URL } from "../../constants/Constants";

export async function register(data: Record<string, any>) {
  try {
    const response = await axios.post(`${API_URL}/api/register`, data);
    Swal.fire({
      icon: "success",
      title: "Usuario registrado",
      text: response.data.message,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Handle network errors
    if (!error.response) {
      Swal.fire({
        icon: "error",
        title: "Error de Conexión",
        text: `No se puede conectar al servidor. Verifica que el backend esté funcionando en ${API_URL}`,
      });
      return;
    }
    
    // Handle API errors
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || "Error al registrar usuario",
    });
  }
}

export async function login(
  data: Record<string, any>,
  navigate: NavigateFunction
) {
  try {
    const response = await axios.post(`${API_URL}/api/login`, data);
    Cookies.set("token", response.data.token);
    navigate("/upload-excel");
  } catch (error: any) {
    console.error("Login error:", error);
    
    // Handle network errors
    if (!error.response) {
      Swal.fire({
        icon: "error",
        title: "Error de Conexión",
        text: `No se puede conectar al servidor. Verifica que el backend esté funcionando en ${API_URL}`,
      });
      return;
    }
    
    // Handle API errors
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || "Error al iniciar sesión",
    });
  }
}
