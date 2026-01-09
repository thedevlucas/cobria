
// Search if a value exists in a model
export async function searchModel(model:any, searchValues: Array<Record<string,any>>){
    for (const searchValue of searchValues){
        const search = await model.findOne({where: searchValue});
        if(search){
            // User exists
            return false;
        }
    }
    // User dont exists
    return true
}

// Search if a value exists and its different 
export async function compareSearchModel(model:any, searchValues: Array<Record<string,any>>,id:number){
    for (const searchValue of searchValues){
        const search = await model.findOne({where: searchValue});
        if(search && search.id != id){
            // User exists
            return false;
        }
    }
    // User dont exists
    return true
}