import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../../lib/axios';
import { Button } from '../ui/button';
import { Grade, Course, Student } from '../../types';

export function GradeList() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    grade: 0,
    date: '',
  });

  useEffect(() => {
    fetchGrades();
    fetchCourses();
    fetchStudents();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await api.get('/grades');
      console.log(response.data);
      setGrades(response.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      console.log(response.data);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedGrade) {
        await api.patch(`/grades/${selectedGrade._id}`, formData);
      } else {
        await api.post('/grades', formData);
      }
      setIsModalOpen(false);
      setSelectedGrade(null);
      setFormData({
        studentId: '',
        courseId: '',
        grade: 0,
        date: '',
      });
      fetchGrades();
    } catch (error) {
      console.error('Error saving grade:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      try {
        await api.delete(`/grades/${id}`);
        fetchGrades();
      } catch (error) {
        console.error('Error deleting grade:', error);
      }
    }
  };

  // Helper function to format the date for the input field
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Extracts YYYY-MM-DD
  };

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Grades</h1>
          <Button
              onClick={() => {
                setSelectedGrade(null);
                setFormData({
                  studentId: '',
                  courseId: '',
                  grade: 0,
                  date: '',
                });
                setIsModalOpen(true);
              }}
              className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Grade
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {grades.map((grade) => (
                <tr key={grade._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {students.find(s => s._id === grade.studentId?._id)?.firstName} {students.find(s => s._id === grade.studentId._id)?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {courses.find(c => c._id === grade.courseId._id)?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{grade.grade}/20</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(grade.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        onClick={() => {
                          setSelectedGrade(grade);
                          setFormData({
                            studentId: grade.studentId._id,
                            courseId: grade.courseId._id,
                            grade: grade.grade,
                            date: formatDateForInput(grade.date), // Format the date here
                          });
                          setIsModalOpen(true);
                        }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(grade._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  {selectedGrade ? 'Edit Grade' : 'Add Grade'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Student
                    </label>
                    <select
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.studentId}
                        onChange={(e) =>
                            setFormData({ ...formData, studentId: e.target.value })
                        }
                    >
                      <option value="">Select a student</option>
                      {students.map((student) => (
                          <option key={student._id} value={student._id}>
                            {student.firstName} {student.lastName}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Course
                    </label>
                    <select
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.courseId}
                        onChange={(e) =>
                            setFormData({ ...formData, courseId: e.target.value })
                        }
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.name}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Grade
                    </label>
                    <input
                        type="number"
                        required
                        min="0"
                        max="20"
                        step="0.1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.grade}
                        onChange={(e) =>
                            setFormData({
                              ...formData,
                              grade: parseFloat(e.target.value) || 0,
                            })
                        }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                        type="date"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={formData.date}
                        onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                        }
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}