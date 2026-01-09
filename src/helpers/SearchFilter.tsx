// Helpers
import { deleteBlankSpaces, capitalizeWords } from "./FormatString";

export function filterNumber(rows:Array<Record<string,any>>,searchKey:string,number:string){
    if (number === "") return rows
    return rows.filter((row) => row[searchKey] === number)
}

export function filterString(rows:Array<Record<string,any>>,searchKey:string,str:string){
    if (str === "") return rows
    return rows.filter((row) => row[searchKey].includes(capitalizeWords(deleteBlankSpaces(str))));
}

function filterEmail(rows:Array<Record<string,any>>,searchKey:string,email:string){
    if (email === "") return rows
    return rows.filter((row) => row[searchKey].includes(email));

}

export default function filterSearch(rows:Array<Record<string,any>>,searchType:string,searchKey:string,searchValue:string){
    switch(searchType){
        case "number":
            return filterNumber(rows,searchKey,searchValue)
        case "string":
            return filterString(rows,searchKey,searchValue)
        case "email":
            return filterEmail(rows,searchKey,searchValue)
        default:
            return rows
    }
}