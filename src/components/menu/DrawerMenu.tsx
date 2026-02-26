// Dependencies
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { useNavigate, NavigateFunction } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
// Admin icons
import Person2Icon from "@mui/icons-material/Person2";
// User icons
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChatIcon from "@mui/icons-material/Chat";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import CallIcon from "@mui/icons-material/Call";
import AssistantIcon from "@mui/icons-material/Assistant";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PermPhoneMsgIcon from "@mui/icons-material/PermPhoneMsg";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import HelpIcon from "@mui/icons-material/Help";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DashboardIcon from "@mui/icons-material/Dashboard";

// Helpers
import { checkAdmin } from "../../helpers/user/CheckAdmin";
import {
  getName,
  getCellphone,
  getTelephone,
  getMyInfo,
} from "../../helpers/user/UserHelper";
import { User } from "../../constants/Constants";

interface Props {
  navigate: NavigateFunction;
}

const UserMenu = ({ navigate }: Props) => {
  const [name, setName] = useState<string>("");
  const [cellphone, setCellphone] = useState<string>("");
  const [telephone, setTelephone] = useState<string>("");
  const [userInfo, setUserInfo] = useState<User>();

  useEffect(() => {
    getName().then((response) => {
      setName(response);
    });
    getCellphone().then((response) => {
      setCellphone(response);
    });
    getTelephone().then((response) => {
      setTelephone(response);
    });
    getMyInfo().then((response) => {
      setUserInfo(response);
    });
  }, []);

  return (
    <List>
      <ListItem key={name} disablePadding>
        <ListItemButton onClick={() => navigate("/settings")}>
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary={name} />
        </ListItemButton>
      </ListItem>
      {telephone && telephone !== "" && telephone !== "+0" ? (
        <ListItem key={`telephone-${telephone}`} disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <CallIcon />
            </ListItemIcon>
            <ListItemText primary={telephone} />
          </ListItemButton>
        </ListItem>
      ) : null}
      {cellphone && cellphone !== "" && cellphone !== "+0" ? (
        <ListItem key={`cellphone-${cellphone}`} disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <WhatsAppIcon />
            </ListItemIcon>
            <ListItemText primary={cellphone} />
          </ListItemButton>
        </ListItem>
      ) : null}
      <ListItem key="Chat" disablePadding>
        <ListItemButton onClick={() => navigate("/chat")}>
          <ListItemIcon>
            <ChatIcon />
          </ListItemIcon>
          <ListItemText primary="Chat" />
        </ListItemButton>
      </ListItem>

      <ListItem key="Registro teléfono" disablePadding>
        <ListItemButton onClick={() => navigate("/upload-excel")}>
          <ListItemIcon>
            <PermPhoneMsgIcon />
          </ListItemIcon>
          <ListItemText primary="Registro teléfono" />
        </ListItemButton>
      </ListItem>

      <ListItem key="Deudores" disablePadding>
        <ListItemButton onClick={() => navigate("/debtor")}>
          <ListItemIcon>
            <PersonOffIcon />
          </ListItemIcon>
          <ListItemText primary="Deudores" />
        </ListItemButton>
      </ListItem>

      {userInfo?.isCollectionCompany ? (
        <ListItem key="Clientes" disablePadding>
          <ListItemButton onClick={() => navigate("/client")}>
            <ListItemIcon>
              <PersonSearchIcon />
            </ListItemIcon>
            <ListItemText primary="Clientes" />
          </ListItemButton>
        </ListItem>
      ) : null}
          <ListItem key="Dashboard en Tiempo Real" disablePadding>
            <ListItemButton onClick={() => navigate("/real-time-dashboard")}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          <ListItem key="Gestión de Cobranzas" disablePadding>
            <ListItemButton onClick={() => navigate("/collection-management")}>
              <ListItemIcon>
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText primary="Gestión de Cobranzas" />
            </ListItemButton>
          </ListItem>
          <ListItem key="Seguimiento de Costos" disablePadding>
            <ListItemButton onClick={() => navigate("/cost-tracking")}>
              <ListItemIcon>
                <AttachMoneyIcon />
              </ListItemIcon>
              <ListItemText primary="Seguimiento de Costos" />
            </ListItemButton>
          </ListItem>
      <ListItem key="Reporte" disablePadding>
        <ListItemButton onClick={() => navigate("/report")}>
          <ListItemIcon>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText primary="Reporte" />
        </ListItemButton>
      </ListItem>
      <ListItem key="Agentes" disablePadding>
        <ListItemButton onClick={() => navigate("/agents")}>
          <ListItemIcon>
            <AssistantIcon />
          </ListItemIcon>
          <ListItemText primary="Agentes" />
        </ListItemButton>
      </ListItem>
      <ListItem key="Soporte" disablePadding>
        <ListItemButton onClick={() => navigate("/support-ticket")}>
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText primary="Soporte" />
        </ListItemButton>
      </ListItem>
    </List>
  );
};
const AdminMenu = ({ navigate }: Props) => {
  return (
    <List>
      <ListItem key="Modificar usuarios" disablePadding>
        <ListItemButton onClick={() => navigate("/user")}>
          <ListItemIcon>
            <Person2Icon />
          </ListItemIcon>
          <ListItemText primary="Modificar usuarios" />
        </ListItemButton>
      </ListItem>
      <ListItem key="Costes" disablePadding>
        <ListItemButton onClick={() => navigate("/cost")}>
          <ListItemIcon>
            <AttachMoneyIcon />
          </ListItemIcon>
          <ListItemText primary="Costos" />
        </ListItemButton>
      </ListItem>
      <ListItem key="Establecer Agentes" disablePadding>
        <ListItemButton onClick={() => navigate("/set-agents")}>
          <ListItemIcon>
            <SmartToyIcon />
          </ListItemIcon>
          <ListItemText primary="Establecer agentes" />
        </ListItemButton>
      </ListItem>
      <ListItem key="Tickets de soporte" disablePadding>
        <ListItemButton onClick={() => navigate("/all-support-tickets")}>
          <ListItemIcon>
            <ConfirmationNumberIcon />
          </ListItemIcon>
          <ListItemText primary="Tickets de soporte" />
        </ListItemButton>
      </ListItem>
      <ListItem key="Tickets de agentes" disablePadding>
        <ListItemButton onClick={() => navigate("/all-request-tickets")}>
          <ListItemIcon>
            <ConfirmationNumberIcon />
          </ListItemIcon>
          <ListItemText primary="Tickets de agentes" />
        </ListItemButton>
      </ListItem>
    </List>
  );
};

function BoxMenu(setOpen: React.Dispatch<React.SetStateAction<boolean>>) {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<boolean>(false);
  useEffect(() => {
    checkAdmin().then((response) => {
      setAdmin(response);
    });
  }, []);

  const userMenu = useMemo(() => <UserMenu navigate={navigate} />, []);
  const adminMenu = useMemo(() => <AdminMenu navigate={navigate} />, []);

  return (
    <Box
      sx={{ width: "30vw" }}
      role="presentation"
      onClick={() => setOpen(true)}
    >
      <List>
        <ListItem key="icon" disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <img src="icon.svg" className="menu-logo" alt="icon"></img>
            </ListItemIcon>
            <ListItemText primary="COBRIA" id="icon-text" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      {userMenu}
      {admin && <Divider />}
      {admin ? adminMenu : null}
    </Box>
  );
}
export default function DrawerMenu(
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
  return (
    <>
      <Drawer open={open} onClose={() => setOpen(false)}>
        {BoxMenu(setOpen)}
      </Drawer>
    </>
  );
}
