// Dependencies
import { Link } from "react-router-dom"
// Css
import "/src/static/css/Error.css"

function ErrorRoute(statusCode:number,title:string,description:string){
    return(
            <div className="error-all-container">
                <h1>{statusCode}</h1>
                <h2>{title}</h2>
                <p>{description}<Link to="/">Volver al inicio</Link></p> 
            </div>
    )
}
export function NotFound(){
    return ErrorRoute(404,"Página no encontrada","La página que está buscando no existe.")
}