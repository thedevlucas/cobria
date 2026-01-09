// Css
import "/src/static/css/user/Login.css"
// Dependencies
import {Button} from "@mui/material"
import {useState} from "react"
import {Link, useNavigate} from "react-router-dom"
// Components
import {InputTextPassword} from "../../components/user/InputTextPassword"
import { EmailTextField } from "../../components/user/EmailTextField"
// Styles
import {styleButton} from "../../styles/GeneralStyle"
// Constants
import {EMAIL_REGEX} from "../../constants/Constants"
// Helpers
import {login} from "../../helpers/user/RegisterHelper"

export default function Login(){
    const [email, setEmail] = useState<string>("")
    const[password, setPassword] = useState<string>("")
    const isEmailValid = EMAIL_REGEX.test(email);
    const navigate = useNavigate();
    return (
        <div className="login-all">
            <div className = "login">
                <div className="login-elements">
                    <div className="login-images">
                        <img src="icon.svg"></img>
                        <p id="icon-text">COBRIA</p>
                    </div>
                    {EmailTextField(email,setEmail,isEmailValid)}
                    {InputTextPassword("Contraseña", password, setPassword)}
                    <Button variant="contained" sx={styleButton} onClick={() => {
                        login({
                            email: email,
                            password: password
                        }, navigate)
                    }}>Iniciar sesión</Button>
                    <p id="href-account">¿No tienes una cuenta? <Link to="/register">Registrate</Link></p>
                    <p id="href-account">¿Olvidaste tu contraseña?<Link to="/password-recovery">Reinicia contraseña</Link></p>
                </div>
            </div>
        </div>
    )
}