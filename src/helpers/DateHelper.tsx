
export function date2StringChat(date:string){
    const localDate = new Date(date)
    const day = localDate.getDate()
    const month = localDate.getMonth() + 1
    const year = localDate.getFullYear()
    const hour = localDate.getHours()
    const minutes = localDate.getMinutes()
    return `${day}/${month}/${year} ${hour}:${minutes}`
}