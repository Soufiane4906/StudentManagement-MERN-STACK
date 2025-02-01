export type Role = 'ADMIN' | 'SCOLARITE' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  credits: number;
}

export interface Student {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  enrollment_date: string;
}

export interface Grade {
  id: string;
  student_id: string;
  course_id: string;
  grade: number;
  date: string;
}