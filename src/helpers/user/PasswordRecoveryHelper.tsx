// Dependencies
import axios from "axios";
import Swal from "sweetalert2";
// Constants
import { API_URL } from "../../constants/Constants";

export async function sendRecoveryLink(data:Record<string,any>){
    try{
        const response = await axios.post(`${API_URL}/api/password-recovery`,data);
        Swal.fire({
            icon: 'success',
            title: 'Correo enviado',
            text: response.data.message,
        })
    }catch(error:any){
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response.data.message,
        })
    }
}

export async function recoverPassword(data:Record<string,any>){
    try{
        if(data.password !== data.confirmPassword){
            throw new Error("Las contraseñas no coinciden");
        }
        const dataBody = {...data};
        delete dataBody.confirmPassword;
        delete dataBody.token;
        const response = await axios.post(`${API_URL}/api/password-recovery/${data.token}`,dataBody);
        Swal.fire({
            icon: 'success',
            title: 'Contraseña cambiada',
            text: response.data.message,
        })
    }catch(error:any){
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response.data.message,
        })
    }
}