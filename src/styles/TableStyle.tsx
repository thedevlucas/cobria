export const crudButtonStyle = {
  backgroundColor: "#D9D9D9",
  color: "black",
  fontSize: "1.5vw",
  "&.MuiButton-root:hover": {
    backgroundColor: "#c5c5c5",
  },
  // width: "15vw",
  marginBottom: "2vh",
};

const searchFontSize = "1.5vw";
const color = "black";
const backgroundColor = "#D9D9D9";
const searchWidth = "35vw";
const searchMargin = "10vw";

export const selectFieldStyle = {
  "& .MuiSelect-root": {
    backgroundColor: backgroundColor,
    fontSize: searchFontSize,
  },
  "& .MuiInputLabel-root": {
    color: color,
    fontSize: searchFontSize,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: color,
  },
  width: searchWidth,
  marginRight: searchMargin,
};
export const textFieldStyle = {
  "& .MuiFilledInput-root": {
    backgroundColor: backgroundColor,
    fontSize: searchFontSize,
  },
  "& .MuiInputLabel-root": {
    color: color,
    fontSize: searchFontSize,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: color,
  },
  width: searchWidth,
};
