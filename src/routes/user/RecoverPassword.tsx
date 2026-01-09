// Css
import "/src/static/css/user/Login.css"
// Dependencies
import {Button} from "@mui/material"
import { useState } from "react"
import { useParams } from "react-router-dom";
// Components
import {InputTextPassword} from "../../components/user/InputTextPassword"
// Style
import {styleButton} from "../../styles/GeneralStyle"
// Helpers
import { recoverPassword } from "../../helpers/user/PasswordRecoveryHelper";

export default function RecoverPassword(){
    const {token} = useParams<{token:string}>();
    const [password,setPassword] = useState<string>("");
    const [confirmPassword,setConfirmPassword] = useState<string>("");
    return (
        <div className="login-all">
            <div className="login">
                <div className="login-elements">
                    <div className="login-images">
                        <img src="../icon.svg"></img>
                        <p id="icon-text">COBRIA</p>
                    </div>
                <h1>Nueva contraseña</h1>
                {InputTextPassword("Crea nueva contraseña",password,setPassword)}
                {InputTextPassword("Confirma contraseña",confirmPassword,setConfirmPassword)}
                <Button variant="contained" sx={styleButton} onClick={
                    () => {recoverPassword({
                        password: password,
                        confirmPassword: confirmPassword,
                        token: token
                    })}
                }>Cambiar contraseña</Button>
                </div>
            </div>
        </div>
    )
}