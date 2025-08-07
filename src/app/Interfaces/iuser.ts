export interface IUser {
  name: string
  username: string,
  phone: string,
  parentPhoneNumber: string,
  birthdate: Date,
  studentYear: number,
  password: string,
  confirmPassword: string,
  photoUrl?: string
}