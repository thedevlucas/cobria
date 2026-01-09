// Css
import "/src/static/css/user/Login.css";
// Dependencies
import { useState } from "react";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  TextField,
  Button,
  Checkbox,
  Typography,
} from "@mui/material";

import { Link } from "react-router-dom";
// Constants
import { EMAIL_REGEX } from "../../constants/Constants";
// Components
import { EmailTextField } from "../../components/user/EmailTextField";
import { InputTextPassword } from "../../components/user/InputTextPassword";

// Styles
import { styleTextField, styleButton } from "../../styles/GeneralStyle";
// Helpers
import { register } from "../../helpers/user/RegisterHelper";

export default function Register() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isCollectionCompany, setIsCollectionCompany] = useState<string>("");
  const [accepted, setAccepted] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>("");
  const isEmailValid = EMAIL_REGEX.test(email);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccepted(event.target.checked);
  };

  return (
    <div className="login-all">
      <div className="login">
        <div className="login-elements">
          <div className="login-images">
            <img src="icon.svg"></img>
            <p id="icon-text">COBRIA</p>
          </div>
          <div className="form-control">
            <FormLabel>
              ¿Es una empresa de cobranza o realiza cobranza para distintas
              empresas?
            </FormLabel>
            <RadioGroup
              row
              value={isCollectionCompany}
              onChange={(e) => setIsCollectionCompany(e.target.value)}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Sí" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </div>
          <TextField
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            label={
              isCollectionCompany === "yes"
                ? "Nombre del estudio jurídico"
                : "Nombre de la institución crediticia"
            }
            variant="filled"
            sx={styleTextField}
          ></TextField>

          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            label="Nombre de usuario"
            variant="filled"
            sx={styleTextField}
          ></TextField>
          {EmailTextField(email, setEmail, isEmailValid)}

          {InputTextPassword("Contraseña", password, setPassword)}

          <FormControlLabel
            control={<Checkbox checked={accepted} onChange={handleChange} />}
            label={
              <Typography>
                Acepto los{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer">
                  términos y condiciones
                </a>
              </Typography>
            }
          />
          <Button
            variant="contained"
            sx={styleButton}
            disabled={!isEmailValid || !accepted || !companyName}
            onClick={() =>
              register({
                email: email,
                name: name,
                companyName: companyName,
                password: password,
                isCollectionCompany: isCollectionCompany === "yes", // Agregamos la respuesta aquí
              })
            }
          >
            Registrar
          </Button>
          <p id="href-account">
            ¿Ya tienes una cuenta? <Link to="/">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
