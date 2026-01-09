// Dependencies
import { TextField, InputAdornment} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
// Schemas
import { searcherSchema } from "../../schemas/TableSchema";
// Styles
import { textFieldStyle } from "../../styles/TableStyle";

export function createTextFieldWithIcon(searcherSchema: searcherSchema){
    return(
        <TextField sx={textFieldStyle}
            label="Buscar"
            value={searcherSchema.getter}
            onChange={(e) => searcherSchema.setter(e.target.value)}
            InputProps={{
                endAdornment:(
                    <InputAdornment position="end">
                        <SearchIcon/>
                    </InputAdornment>
                )
            }}
        />
    )
}

export async function getDate(){
    /*
    const response = await axios.get("http://worldtimeapi.org/api/timezone/America/Bogota")
    const date = new Date(response.data.unixtime * 1000)
    */
    return new Date();
}

export async function formatDate2Csv(csvName:string){
    let date = await getDate()
    const colombianDate = dayjs.utc(date).tz("America/Bogota")
    return `${colombianDate.format("YYYY-MM-DD")}_${csvName}`
}