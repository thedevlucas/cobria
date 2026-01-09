// Dependencies
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
// Constants
import { API_URL } from "../../constants/Constants";

export async function deleteBill(id:number){
    Swal.fire({
        title: "¿Estás seguro de que quieres borrar la factura?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No"
    }).then(async(result) =>{
        try{
            if(result.isConfirmed){
                const response = await axios.delete(`${API_URL}/api/bill/image/${id}`,{
                    headers:{
                        Authorization: `Bearer ${Cookies.get("token")}`
                    }
                })
                Swal.fire({
                    title: "Factura borrada",
                    icon: "success",
                    text: response.data.message
                })
            }else{
                Swal.fire({
                    title: "Operación cancelada",
                    icon: "info",
                    text: "No se ha borrado la factura"
                })
            }}catch(error:any){
                Swal.fire({
                    title: "Error",
                    icon: "error",
                    text: error.response.data.message
                })
        }
    })
}

export async function getBills(id_debtor:number){
    try{
        const bills = await axios.get(`${API_URL}/api/bill/debtor/${id_debtor}`,{
            headers:{
                Authorization: `Bearer ${Cookies.get("token")}`
            }
        })
        return bills.data
    }catch(error){
        Swal.fire({
            title: "Error",
            icon: "error",
            text: "No se han podido cargar las facturas"
        })
    }
}

export function downloadImage(image:string){
    const startImageExtension = image.indexOf("/") + 1
    const endImageExtension = image.indexOf(";")
    const imageExtension = image.slice(startImageExtension,endImageExtension)
    const downloadLink = document.createElement("a")
    downloadLink.href = image
    downloadLink.download = `Factura.${imageExtension}`
    downloadLink.click()
}