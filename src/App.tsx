import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuthForm } from './components/auth/auth-form';
import { OAuthCallback } from './components/auth/OAuthCallback';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { CourseList } from './components/courses/CourseList';
import { StudentList } from './components/students/StudentList';
import { GradeList } from './components/grades/GradeList';
import { useAuth } from './contexts/AuthContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return user ? <>{children}</> : <Navigate to="/auth" />;
}

function DashboardIndex() {
    const { user } = useAuth();
    return user?.role === 'ADMIN' ? <AdminDashboard /> : <StudentDashboard />;
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/auth" element={<AuthForm />} />
                    <Route path="/auth/callback" element={<OAuthCallback />} />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <DashboardLayout />
                            </PrivateRoute>
                        }
                    >
                        <Route index element={<DashboardIndex />} />
                        <Route path="courses" element={<CourseList />} />
                        <Route path="students" element={<StudentList />} />
                        <Route path="grades" element={<GradeList />} />
                    </Route>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;