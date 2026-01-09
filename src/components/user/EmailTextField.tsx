// Dependencies
import {TextField} from '@mui/material';
// Styles 
import { styleTextField } from "../../styles/GeneralStyle";

export function EmailTextField(email:string, setEmail:React.Dispatch<React.SetStateAction<string>>, isEmailValid:boolean){
    return (
        <TextField error={!isEmailValid && email.length>0} helperText={!isEmailValid && email.length > 0 ? 'Email incorrecto' : ' '} value={email} onChange={(e) => setEmail(e.target.value)} label="Email" variant="filled" sx= {styleTextField}></TextField>
    )
}