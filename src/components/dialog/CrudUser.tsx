// Dependencies
import { Dialog, DialogContent, DialogTitle,DialogActions,
    TextField, Button, 
    FormControl, Select, InputLabel, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
// Styles
import { crudDialogButton, crudDialogSelectField, crudDialogTextField } from "../../styles/CrudStyle";
// Constants
import { string2State, spanishRole2English} from "../../constants/Constants";
// Helpers
import { HandleNumberChange } from "../../helpers/HandleTextFieldChange";
import { createUser, modifyUser } from "../../helpers/user/ModifyUser";


export default function crudUser(open:boolean,setOpen:React.Dispatch<React.SetStateAction<boolean>>,
    modifyRow:Record<string,any>|null, request: string
){
    // Variables
    // Title & Button
    const title = request == "POST" ? "Crear usuario": "Modificar usuario"
    // States
    const [name, setName] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [active, setActive] = useState<string>("")
    const [role, setRole] = useState<string>("")
    const [cellphone, setCellphone] = useState<string>("")
    const [telephone, setTelephone] = useState<string>("")
    // Change value of states if request is PUT
    useEffect(() => {
        if (request === "PUT"){
            if(modifyRow != null){
                // Set values
                setName(modifyRow.name)
                setEmail(modifyRow.email)
                setPassword(modifyRow.password)
                setActive(string2State[modifyRow.active])
                setRole(spanishRole2English[modifyRow.role])
                setCellphone(modifyRow.cellphone)
                setTelephone(modifyRow.telephone)
            }
            else{
                setOpen(false)
                Swal.fire({
                    title: "Error",
                    text: "No se ha seleccionado un usuario",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                })
            }
        }
        else{
            setName("")
            setEmail("")
            setPassword("")
            setActive("true")
            setRole("")
            setCellphone("")
            setTelephone("")
        }
    },[open,modifyRow])
    return (
        <Dialog
        open={open}
        onClose={() => setOpen(false)}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <TextField
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="filled" label="Nombre" sx={crudDialogTextField}/>
                <TextField
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="filled" label="Correo" sx={crudDialogTextField}/>
                <TextField
                fullWidth
                value={cellphone}
                onChange={HandleNumberChange(setCellphone)}
                variant="filled" label="Celular" sx={crudDialogTextField}/>
                <TextField
                fullWidth
                value={telephone}
                onChange={HandleNumberChange(setTelephone)}
                variant="filled" label="Teléfono" sx={crudDialogTextField}
                />
                <TextField
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="filled" label="Contraseña" sx={crudDialogTextField}/>
                <FormControl fullWidth sx={crudDialogSelectField}>
                    <InputLabel>Estado</InputLabel>
                    <Select 
                     value={active}
                     label="Estado"
                     onChange={(e) => setActive(e.target.value)}>
                        <MenuItem value={"true"}>Activo</MenuItem>
                        <MenuItem value={"false"}>Inactivo</MenuItem>
                     </Select>
                </FormControl>
                <FormControl fullWidth sx={crudDialogSelectField}>
                    <InputLabel>Rol</InputLabel>
                    <Select 
                     value={role}
                     label="Rol"
                     onChange={(e) => setRole(e.target.value as string)}>
                        <MenuItem value={"superadmin"}>Superadmin</MenuItem>
                        <MenuItem value={"admin"}>Administrador</MenuItem>
                        <MenuItem value={"user"}>Usuario</MenuItem>
                     </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" sx={crudDialogButton} onClick={() => setOpen(false)}>Cancelar</Button>
                <Button variant="contained" sx={crudDialogButton}
                    onClick={() => {
                        const requestData = {
                            name: name,
                            email: email,
                            password: password === "" ? null : password,
                            active: active === "true" ? true : false,
                            role: role,
                            cellphone: parseInt(cellphone),
                            telephone: parseInt(telephone)
                        };
                        if (modifyRow != null && request === "PUT") {
                            modifyUser({...requestData, id: modifyRow.id});
                        } else {
                            createUser(requestData);
                        }
                    }}>{title}</Button>
            </DialogActions>
        </Dialog>   
    )
}