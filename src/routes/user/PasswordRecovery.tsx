// Css
import "/src/static/css/user/Login.css"
// Dependencies
import {Button} from "@mui/material"
import { useState } from "react";
import {Link} from 'react-router-dom';
// Constants
import { EMAIL_REGEX } from "../../constants/Constants";
// Components
import { EmailTextField } from "../../components/user/EmailTextField";
// Styles
import { styleButton } from "../../styles/GeneralStyle";
// Helpers
import { sendRecoveryLink } from "../../helpers/user/PasswordRecoveryHelper";

export default function PasswordRecovery(){
    const [email,setEmail] = useState("");
    const [loading, setLoading] = useState<boolean>(false);

    const isEmailValid = EMAIL_REGEX.test(email);

    return(
        <div className="login-all">
            <div className="login">
                <div className="login-elements">
                    <div className="login-images">
                        <img src="icon.svg"></img>
                        <p id="icon-text">COBRIA</p>
                    </div>
                    <h1>¿Olvidaste tu contraseña?</h1>
                    <p id="href-account">¿Recuerdas tu contraseña? <Link to="/">Inicia sesión</Link></p>
                    {EmailTextField(email,setEmail,isEmailValid)}
                    <Button 
                        variant="contained" 
                        sx={styleButton} 
                        disabled={!isEmailValid || loading} 
                        onClick={async () => {
                            setLoading(true);
                            try {
                                await sendRecoveryLink({ 
                                    email: email
                                });
                            } finally {
                                setLoading(false); 
                            }
                        }}
                    >
                        {loading ? "Enviando..." : "Cambiar contraseña"}
                    </Button>
                </div>
            </div>
        </div>
    )
}