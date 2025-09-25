export function isBlank(str: string){
    return typeof str !== 'string' || str.trim().length === 0;
}