// Dependencies
import {TextField, InputAdornment, IconButton} from '@mui/material';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
// Styles
import { styleTextField } from "../../styles/GeneralStyle";
// Schemas
import { settingsPasswordSchema, settingsShowPassword } from '../../schemas/SettingsSchema';

export function InputTextPassword(label:string = "Contraseña",
  password:string, setPassword:React.Dispatch<React.SetStateAction<string>>,
  sx:Record<string,any>=styleTextField
){
    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = () => setShowPassword(!showPassword);
    return (
        <TextField value={password} onChange={(e) => setPassword(e.target.value)} label={label} type={showPassword ? "text" : "password"} InputProps={{ // <-- This is where the toggle button is added.
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            )
          }} variant="filled" sx= {sx}></TextField>
    )
}

export function InputTextPasswordHook(label:string, password: settingsPasswordSchema,
  showPassword: settingsShowPassword,
  sx:Record<string,any>=styleTextField
){
    const handleClickShowPassword = () => showPassword.setShowPassword(!showPassword.showPassword);
    const handleMouseDownPassword = () => showPassword.setShowPassword(!showPassword.showPassword);
    return(
        <TextField value={password.password} onChange={(e) => password.setPassword(e.target.value)} label={label} type={showPassword.showPassword ? "text" : "password"} InputProps={{ // <-- This is where the toggle button is added.
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                >
                  {showPassword.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            )
          }} variant="filled" sx= {sx}></TextField>
    )
} 