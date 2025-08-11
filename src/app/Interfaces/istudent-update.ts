export enum StudentYear {
  الصف_الأول_الثانوي = 1,
  الصف_الثاني_الثانوي = 2,
  الصف_الثالث_الثانوي = 3
}
export interface IStudentUpdate {
     year: StudentYear;
      phoneNumber: string;
      parentNumber: string;
      isActive: boolean;
      userId: string;
    
}
