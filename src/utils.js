export function isBlank(str){
    if (str === null) {
        return true;
    }
    
    return typeof str !== 'string' || str.trim().length === 0;
}