// Dependencies
import Cookies from "js-cookie"
import axios from "axios"
import { NavigateFunction } from "react-router-dom"
import Swal from "sweetalert2"
// Constants
import { API_URL } from "../../constants/Constants"

export async function checkAdmin(){
    try{
        const response = await axios.get(`${API_URL}/api/check-admin`,{
            headers: {
                Authorization: `Bearer ${Cookies.get("token")}`
            }
        })
        return response.data.admin
    }catch(error){
        return false
    }
}

export async function userRedirect(navigate:NavigateFunction){
    const admin = await checkAdmin();
    if(!admin){
        navigate("/")
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No tienes permisos para acceder a esta página.'
        })
    }
}