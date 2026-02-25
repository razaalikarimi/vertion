export type UserRole = 'admin' | 'principal' | 'teacher' | 'student' | 'staff' | 'superadmin';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string; // The original role (e.g., "SuperAdmin")
  utype: UserRole; // The mapped role for frontend (e.g., "admin")
  school_id?: string | null;
  phone?: string;
  is_active: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  total_schools: number;
  total_grades: number;
  total_principals: number;
  total_principals_pending: number;
  total_teachers: number;
  total_teachers_pending: number;
  total_students: number;
  total_students_pending: number;
  total_modules: number;
  total_lessons: number;
  total_exams: number;
  total_results: number;
  student_progress: { name: string; progress: number }[];
  grade_attendance: { grade: string; attendance: number }[];
  teacher_stats: { name: string; value: number }[];
}

export interface School {
  id: string;
  school_code: string;
  name: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  is_active: boolean;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  student_id: string;
  grade_id: string;
  grade_name: string;
  school_id: string;
  school_name: string;
  is_active: boolean;
}

export interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  employee_id: string;
  school_id: string;
  school_name: string;
  specialization?: string;
  qualification?: string;
  is_active: boolean;
}

export interface Grade {
  id: string;
  school_id: string;
  school_name: string;
  grade_level: string;
  section: string;
  grade_name: string;
  capacity: number;
  class_teacher_id?: string;
  class_teacher_name?: string;
  class_room?: string;
  academic_year?: string;
  is_active: boolean;
  student_count: number;
}
