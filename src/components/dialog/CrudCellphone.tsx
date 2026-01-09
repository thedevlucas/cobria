// Dependencies
import { Dialog, DialogContent, DialogTitle,DialogActions,
    TextField, Button } from "@mui/material";
import { useState } from "react";
// Styles
import { crudDialogButton, crudDialogTextField } from "../../styles/CrudStyle";
// Helpers
import { createCellphone } from "../../helpers/chat/ChatHelper";
import { HandleNumberChange } from "../../helpers/HandleTextFieldChange";

export default function crudCellphone(open:boolean,
    setOpen:React.Dispatch<React.SetStateAction<boolean>>
){
    const [document, setDocument] = useState<string>("")
    const [cellphone, setCellphone] = useState<string>("")

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
                onClick={() => createCellphone({document:Number(document),cellphone:Number(cellphone)})}
                >Crear</Button>
            </DialogActions>
        </Dialog>
    )
}