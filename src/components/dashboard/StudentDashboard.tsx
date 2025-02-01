import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';

interface Grade {
  id: string;
  grade: number;
  date: string;
  courseId: {
    name: string;
    credits: number;
  };
}

export function StudentDashboard() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [stats, setStats] = useState({
    averageGrade: 0,
    totalCredits: 0,
    gradeProgress: [],
  });

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await api.get(`/grades/student/${user?.id}`);
        setGrades(response.data);

        // Calculate statistics
        const gradeValues = response.data.map((g: Grade) => g.grade);
        const average = gradeValues.reduce((a: number, b: number) => a + b, 0) / gradeValues.length;
        const credits = response.data.reduce((sum: number, g: Grade) => sum + g.courseId.credits, 0);

        // Prepare grade progress data
        const progress = response.data
          .sort((a: Grade, b: Grade) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((g: Grade) => ({
            date: new Date(g.date).toLocaleDateString(),
            grade: g.grade,
            course: g.courseId.name,
          }));

        setStats({
          averageGrade: Number(average.toFixed(2)),
          totalCredits: credits,
          gradeProgress: progress,
        });
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };

    if (user?.id) {
      fetchGrades();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Average Grade</h3>
          <p className="text-3xl font-bold mt-2">{stats.averageGrade}/20</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-500">Total Credits</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalCredits}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-4">Grade Progress</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.gradeProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 20]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="grade"
                name="Grade"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <h2 className="text-lg font-medium p-6 border-b">Recent Grades</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grades.map((grade) => (
                <tr key={grade.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{grade.courseId.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{grade.grade}/20</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(grade.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}