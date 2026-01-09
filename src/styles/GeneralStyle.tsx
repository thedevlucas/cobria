// Constants
import { PRIMARY_COLOR } from "../constants/Constants";

export const styleTextField = {
  "& label": {
    "&.Mui-focused": {
      color: PRIMARY_COLOR,
    },
  },
  ".MuiFilledInput-underline:after": {
    borderBottomColor: PRIMARY_COLOR,
  },
  height: "8vh",
};

export const styleButton = {
  backgroundColor: "#080296",
  "&:hover": {
    backgroundColor: PRIMARY_COLOR,
  },
};
