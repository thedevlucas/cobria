// Css
import "/src/static/css/user/Settings.css"
// Dependencies
import {List, ListItem, ListItemText, ListItemButton, ListItemIcon,
    Button
} from '@mui/material'
import { useState } from "react";
import { useNavigate, NavigateFunction } from "react-router-dom";
// Icons
import PasswordIcon from '@mui/icons-material/Password';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
// Components
import MenuComponent from "../../components/menu/MenuComponent"
import { InputTextPasswordHook } from "../../components/user/InputTextPassword";
// Styles
import { settingsListStyle, settingsIconStyle, settingsOptionsStyle,
    settingsDeleteButtonsStyle, settingsTextField
 } from "../../styles/SettingsStyle";
import { styleTextField } from "../../styles/GeneralStyle";
// Schemas
import { settingsPassword, settingsShowPassword } from "../../schemas/SettingsSchema";
// Helpers
import { deleteSelf, modifyPassword } from "../../helpers/user/UserHelper";

function selectOption(option:string, settingsPassword: settingsPassword, 
    showOldPassword: settingsShowPassword, showNewPassword: settingsShowPassword,
    navigate:NavigateFunction){
    switch(option){
        case "password":
            return changePassword(settingsPassword,showOldPassword,showNewPassword,navigate)
        case "delete":
            return deleteAccount(navigate)
        default:
            return <></>
    }
}

function changePassword(settingsPassword: settingsPassword,
    showOldPassword: settingsShowPassword, showNewPassword: settingsShowPassword,
    navigate: NavigateFunction
){
    return(
        <div className="settings-modify-password">
            {InputTextPasswordHook("Contraseña actual",{
                password: settingsPassword.oldPassword,
                setPassword: settingsPassword.setOldPassword
            },showOldPassword,{...styleTextField,...settingsTextField})}
            {InputTextPasswordHook("Nueva contraseña",{
                password: settingsPassword.newPassword,
                setPassword: settingsPassword.setNewPassword
            },showNewPassword,{...styleTextField,...settingsTextField})}
            <Button variant="contained" color="success" sx={settingsDeleteButtonsStyle} onClick={() => modifyPassword({
                oldPassword: settingsPassword.oldPassword,
                newPassword: settingsPassword.newPassword
            },navigate)} >Cambiar contraseña</Button>
        </div>
    )
}

function deleteAccount(navigate:NavigateFunction){
    return (
        <div className="settings-delete-account">
            <img src="delete.jpg"></img>
            <h1>¿Estás seguro de que quieres borrar tu cuenta?</h1>
            <div className="settings-delete-buttons">
                <Button variant="contained" color="error" sx={settingsDeleteButtonsStyle} onClick={() => deleteSelf(navigate)} >Sí, borrar cuenta</Button>
                <Button variant="contained" color="success" sx={settingsDeleteButtonsStyle} onClick={()=>{navigate("/upload-excel")}}>No, cancelar</Button>
            </div>
        </div>
    )
}

export default function Settings(){
    const navigate = useNavigate()
    const [option, setOption] = useState<string>("")
    const [oldPassword, setOldPassword] = useState<string>("")
    const [newPassword, setNewPassword] = useState<string>("")
    const [showOldPassword, setShowOldPassword] = useState<boolean>(false)
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
    return (
        <div className="all">
            {MenuComponent()}
            <main>
                <div className="settings-options">
                    <List sx={settingsListStyle}>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => setOption("password")}>
                                <ListItemIcon>
                                    <PasswordIcon sx={settingsIconStyle} />
                                </ListItemIcon>
                                <ListItemText primaryTypographyProps={settingsOptionsStyle} primary="Modificar contraseña" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => setOption("delete")}>
                                <ListItemIcon>
                                    <PersonRemoveIcon sx={settingsIconStyle} />
                                </ListItemIcon>
                                <ListItemText primaryTypographyProps={settingsOptionsStyle}  primary="Eliminar cuenta" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </div>
                <div className="settings-container">
                    {selectOption(option,{
                        oldPassword: oldPassword,
                        setOldPassword: setOldPassword,
                        newPassword: newPassword,
                        setNewPassword: setNewPassword
                    },{
                        showPassword: showOldPassword,
                        setShowPassword: setShowOldPassword
                    },{
                        showPassword: showNewPassword,
                        setShowPassword: setShowNewPassword
                    },
                    navigate)}
                </div>
            </main>
        </div>
    )
}