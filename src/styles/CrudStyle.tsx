const backgroundColor = "#D9D9D9"
const color = "black"

export const crudDialogTextField = {
    '& .MuiFilledInput-root': {
        backgroundColor: backgroundColor,
    },
    '& .MuiInputLabel-root': {
        color: color,
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: color,
    },  
    marginTop: "2vh"
}
export const crudDialogSelectField = {
    '& .MuiSelect-root': {
        backgroundColor: backgroundColor
    },
    '& .MuiInputLabel-root': {
        color: color,
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: color,
    },
    marginTop: "2vh",
    backgroundColor: backgroundColor
}

export const crudDialogButton = {
    backgroundColor: backgroundColor,
    color: color,
    '&.MuiButton-root:hover':{
        backgroundColor: "#c5c5c5"
    }
}