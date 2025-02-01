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
  firstName: string;
  lastName: string;
  studentId: string;
  enrollmentDate: string;
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  grade: number;
  date: string;
}