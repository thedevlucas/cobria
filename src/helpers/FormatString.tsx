export function deleteBlankSpaces(name:string){
    name = name.replace(/\s+/g, " ").trim()
    return name;
}

export function capitalizeFirstLetter(name:string){
    return name.charAt(0).toUpperCase() + name.slice(1);
}

export function capitalizeWords(name:string){
    return name.replace(/(^\w{1})|(\s+\w{1})/g, match => match.toUpperCase());
}