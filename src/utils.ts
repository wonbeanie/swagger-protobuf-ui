export function isBlank(str: string){
    if (str === null) {
        return true;
    }
    
    return typeof str !== 'string' || str.trim().length === 0;
}