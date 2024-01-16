


export function containsSpecialChars(text:string){
  const format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  return format.test(text)
}