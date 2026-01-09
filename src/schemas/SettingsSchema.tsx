
// Interfaces
export interface settingsPassword{
    oldPassword:string,
    setOldPassword:React.Dispatch<React.SetStateAction<string>>,
    newPassword:string,
    setNewPassword:React.Dispatch<React.SetStateAction<string>>
}

export interface settingsPasswordSchema{
    password:string,
    setPassword:React.Dispatch<React.SetStateAction<string>>
}

export interface settingsShowPassword{
    showPassword:boolean,
    setShowPassword:React.Dispatch<React.SetStateAction<boolean>>
}