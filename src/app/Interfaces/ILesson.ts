export interface ILesson {
  id: number;
  title:string; 
  videoUrl:string;
  previewVideoUrl?:string ;
  pdfUrl:string ;
  courseId:number;
}