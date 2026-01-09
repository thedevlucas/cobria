// Dependencies
import { ListItemIcon, Tooltip } from "@mui/material"
// Styles
import { iconChatStyle } from "../../styles/ChatStyle"
// Icons
import AttachMoney from "@mui/icons-material/AttachMoney"
import MoneyOff from "@mui/icons-material/MoneyOff"
import AddCardIcon from '@mui/icons-material/AddCard';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';

export function getPaidIcon(paidStatus:string){
    switch(paidStatus){
        case "Contact": 
            return (
                <Tooltip title="Contactado">
                    <ListItemIcon>
                        <SearchIcon sx={{...iconChatStyle,color:"green"}} />
                    </ListItemIcon>
                </Tooltip>
        )
        case "Not paid": return (
            <Tooltip title="No pagado">
                <ListItemIcon>
                    <MoneyOff sx={{...iconChatStyle,color:"red"}} />
                </ListItemIcon>
            </Tooltip>
        )
        case "Paid": return(
            <Tooltip title="Pagado">
                <ListItemIcon>
                    <AttachMoney sx={{...iconChatStyle,color:"green"}} />
                </ListItemIcon>
            </Tooltip>
        )
        case "Added": return(
            <Tooltip title="Abonado">
                <ListItemIcon>
                    <AddCardIcon sx={{...iconChatStyle,color:"green"}} />
                </ListItemIcon>
            </Tooltip>
        ) 
        default:
            return(
                <Tooltip title="No encontrado">
                    <ListItemIcon>
                        <SearchOffIcon sx={{...iconChatStyle,color:"red"}} />
                    </ListItemIcon>
                </Tooltip>
            ) 
    }
}