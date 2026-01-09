// Css
import "/src/static/css/Menu.css"
// Dependencies
import { IconButton } from "@mui/material"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
// Icons
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
// Components
import DrawerMenu from "./DrawerMenu";
// Styles
import { IconButtonSize } from "../../styles/MenuStyle";
// Helpers
import { refreshToken, logOut } from "../../helpers/user/Token";




export default function MenuComponent(){
    const navigate = useNavigate()
    const [open, setOpen] = useState<boolean>(false)
    useEffect(() =>{
        refreshToken(navigate)
    },[])
    return (
        <>
            {DrawerMenu(open, setOpen)}
            <div className="menu">
                <IconButton onClick={() => setOpen(true)}>   
                    <MenuIcon sx={IconButtonSize}/>
                </IconButton>
                <IconButton onClick={() => navigate("/upload-excel")}>
                    <img src="add-icon.svg" id="menu-add-logo"></img>
                </IconButton>
                <IconButton onClick= {() => logOut(navigate)}>
                    <LogoutIcon sx={IconButtonSize}/>
                </IconButton>
            </div>
        </>
    )
}