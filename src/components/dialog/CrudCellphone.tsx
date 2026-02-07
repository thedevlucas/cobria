// Dependencies
import { Dialog, DialogContent, DialogTitle,DialogActions,
    TextField, Button } from "@mui/material";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
// Styles
import { crudDialogButton, crudDialogTextField } from "../../styles/CrudStyle";
// Helpers
import { createCellphone } from "../../helpers/chat/ChatHelper";
import { HandleNumberChange } from "../../helpers/HandleTextFieldChange";

interface TokenPayload {
    id: number;
}

export default function CrudCellphone(open:boolean,
    setOpen:React.Dispatch<React.SetStateAction<boolean>>
){
    const [document, setDocument] = useState<string>("")
    const [cellphone, setCellphone] = useState<string>("")
    const [idToken, setIdToken] = useState<number>(0)

    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            try {
                const decoded = jwtDecode<TokenPayload>(token);
                setIdToken(decoded.id);
            } catch (e) {
                console.error('Error decoding token:', e);
            }
        }
    }, []);

    const handleCreateCellphone = async () => {
        if (idToken) {
            await createCellphone({document: Number(document), cellphone: Number(cellphone)}, idToken);
            setOpen(false);
        }
    }

    return (
        <Dialog
        open={open}
        onClose={() => setOpen(false)}>
            <DialogTitle>Crear teléfono</DialogTitle>
            <DialogContent>
                <TextField
                fullWidth
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                variant="filled" label="Documento Cliente" sx={crudDialogTextField}/>
                <TextField
                fullWidth
                value={cellphone}
                onChange={HandleNumberChange(setCellphone)}
                variant="filled" label="Teléfono" sx={crudDialogTextField}/>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" sx={crudDialogButton} onClick={() => setOpen(false)}>Cancelar</Button>
                <Button variant="contained" sx={crudDialogButton} 
                onClick={handleCreateCellphone}
                >Crear</Button>
            </DialogActions>
        </Dialog>
    )
}