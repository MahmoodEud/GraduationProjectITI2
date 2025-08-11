export interface IUser {
  id?: string; 
  name: string
  username: string,
  phone: string,
  parentPhoneNumber: string,
  birthdate: Date,
  token:string,
  studentYear: number,
  password: string,
  confirmPassword: string,
  photoUrl?: string
  role:string
}