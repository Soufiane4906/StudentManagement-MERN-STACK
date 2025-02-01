import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../lib/axios';
import { Users, BookOpen, GraduationCap } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalGrades: 0,
    averageGrade: 0,
    gradeDistribution: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [students, courses, grades] = await Promise.all([
        api.get('/students'),
        api.get('/courses'),
        api.get('/grades'),
      ]);

      const gradeValues = grades.data.map((g: any) => g.grade);
      const average = gradeValues.reduce((a: number, b: number) => a + b, 0) / gradeValues.length;

      const distribution = Array.from({ length: 20 }, (_, i) => ({
        grade: i + 1,
        count: gradeValues.filter((g: number) => Math.floor(g) === i + 1).length,
      }));

      setStats({
        totalStudents: students.data.length,
        totalCourses: courses.data.length,
        totalGrades: grades.data.length,
        averageGrade: Number(average.toFixed(2)),
        gradeDistribution: distribution,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Users className="w-12 h-12 text-blue-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-500">Total Students</h3>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <BookOpen className="w-12 h-12 text-green-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-500">Total Courses</h3>
              <p className="text-2xl font-bold">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <GraduationCap className="w-12 h-12 text-purple-500" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-500">Average Grade</h3>
              <p className="text-2xl font-bold">{stats.averageGrade}/20</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Grade Distribution</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.gradeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Number of Grades" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}