// Css
import "/src/static/css/chat/Bill.css";
// Dependencies
import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
} from "@mui/material";
import { useState, useEffect } from "react";
// Constants
import { paidStatus } from "../../constants/Constants";
// Helpers
import {
  deleteBill,
  getBills,
  downloadImage,
} from "../../helpers/chat/BillHelper";
// Icons
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";

interface BillsProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modifyRow: Record<string, any> | null;
}

export default function Bills({ open, setOpen, modifyRow }: BillsProps) {
  const [debtorImages, setDebtorImages] = useState<Record<string, any>[]>([]);
  useEffect(() => {
    if (modifyRow != null) {
      getBills(modifyRow?.id).then((data: Record<string, any>[]) => {
        setDebtorImages(data || []);
      });
    }
  }, [modifyRow, open]);
  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Facturas</DialogTitle>
      <DialogContent>
        <List>
          {debtorImages.map((data: Record<string, any>) => {
            return (
              <>
                <ListItem key={data.id}>
                  <div className="bill-container">
                    <h2>{paidStatus[data.type]}</h2>
                    <img src={data.image} />
                    <div className="bill-icons">
                      <ListItemIcon>
                        <DeleteIcon
                          sx={{ color: "red" }}
                          onClick={() => deleteBill(data.id)}
                        />
                      </ListItemIcon>
                      <ListItemIcon>
                        <DownloadIcon
                          sx={{ color: "green" }}
                          onClick={() => downloadImage(data.image)}
                        />
                      </ListItemIcon>
                    </div>
                  </div>
                </ListItem>
              </>
            );
          })}
        </List>
      </DialogContent>
    </Dialog>
  );
}
