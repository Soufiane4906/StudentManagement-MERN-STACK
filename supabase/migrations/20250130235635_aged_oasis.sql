/*
  # Initial Schema Setup for Student Management System

  1. New Tables
    - profiles
      - id (uuid, primary key)
      - user_id (references auth.users)
      - role (enum: ADMIN, SCOLARITE, STUDENT)
      - created_at (timestamp)
    
    - courses
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - credits (integer)
      - created_at (timestamp)
    
    - students
      - id (uuid, primary key)
      - user_id (references auth.users)
      - first_name (text)
      - last_name (text)
      - student_id (text, unique)
      - enrollment_date (date)
      - created_at (timestamp)
    
    - grades
      - id (uuid, primary key)
      - student_id (references students)
      - course_id (references courses)
      - grade (numeric)
      - date (date)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for each role
*/

-- Create role enum type
CREATE TYPE user_role AS ENUM ('ADMIN', 'SCOLARITE', 'STUDENT');

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  role user_role NOT NULL DEFAULT 'STUDENT',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create courses table
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  credits integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  student_id text UNIQUE NOT NULL,
  enrollment_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create grades table
CREATE TABLE grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students NOT NULL,
  course_id uuid REFERENCES courses NOT NULL,
  grade numeric NOT NULL CHECK (grade >= 0 AND grade <= 20),
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by admin and scolarite"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE role IN ('ADMIN', 'SCOLARITE')
    )
  );

CREATE POLICY "Admins can manage profiles"
  ON profiles
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE role = 'ADMIN'
    )
  );

-- Courses policies
CREATE POLICY "Courses are viewable by all authenticated users"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Courses are manageable by admin and scolarite"
  ON courses
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE role IN ('ADMIN', 'SCOLARITE')
    )
  );

-- Students policies
CREATE POLICY "Students are viewable by admin and scolarite"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE role IN ('ADMIN', 'SCOLARITE')
    )
  );

CREATE POLICY "Students can view their own profile"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students are manageable by admin and scolarite"
  ON students
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE role IN ('ADMIN', 'SCOLARITE')
    )
  );

-- Grades policies
CREATE POLICY "Grades are viewable by admin and scolarite"
  ON grades
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE role IN ('ADMIN', 'SCOLARITE')
    )
  );

CREATE POLICY "Students can view their own grades"
  ON grades
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = grades.student_id
      AND students.user_id = auth.uid()
    )
  );

CREATE POLICY "Grades are manageable by admin and scolarite"
  ON grades
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE role IN ('ADMIN', 'SCOLARITE')
    )
  );