


export function containsSpecialChars(text:string){
  const regex = /^[A-Za-z0-9\s]*$/; 
  return !regex.test(text)
}