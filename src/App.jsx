import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import CreatePolicy from './pages/admin/CreatePolicy';
import PolicyList from './pages/admin/PolicyList';
import EditPolicy from './pages/admin/EditPolicy';
import Policies from './pages/citizen/Policies';
import PolicyDetail from './pages/citizen/PolicyDetail';
import ReportConcern from './pages/citizen/ReportConcern';
import ConcernList from './pages/citizen/ConcernList';
import ManageConcerns from './pages/admin/ManageConcerns';
import AdminStats from './pages/admin/AdminStats';
import Settings from './pages/admin/Settings';
import Profile from './pages/citizen/Profile';
import ConcernMap from './pages/citizen/ConcernMap';
import Leaderboard from './pages/citizen/Leaderboard';
import Notifications from './pages/citizen/Notifications';
import Ideas from './pages/citizen/Ideas';
import SubmitIdea from './pages/citizen/SubmitIdea';
import IdeaDetail from './pages/citizen/IdeaDetail';
import MyIdeas from './pages/citizen/MyIdeas';
import ManageIdeas from './pages/admin/ManageIdeas';
import BudgetPlanner from './pages/admin/BudgetPlanner';

function App() {
    const { isAuthenticated, user, loading } = useAuth();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)'
            }}>
                <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route
                path="/login"
                element={
                    isAuthenticated
                        ? <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />
                        : <Login />
                }
            />
            <Route
                path="/register"
                element={
                    isAuthenticated
                        ? <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />
                        : <Register />
                }
            />

            {/* Admin Routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/policies"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <PolicyList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/policies/create"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <CreatePolicy />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/policies/edit/:id"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <EditPolicy />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/concerns"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <ManageConcerns />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/stats"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminStats />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/settings"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Settings />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/ideas"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <ManageIdeas />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/budget-planner"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <BudgetPlanner />
                    </ProtectedRoute>
                }
            />

            {/* Citizen Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                        <CitizenDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/profile"
                element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/concerns/report"
                element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                        <ReportConcern />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/concerns"
                element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                        <ConcernList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/map"
                element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                        <ConcernMap />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/leaderboard"
                element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                        <Leaderboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/notifications"
                element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                        <Notifications />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/policies"
                element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                        <Policies />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/ideas"
                element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                        <Ideas />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/ideas/submit"
                element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                        <SubmitIdea />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/ideas/my"
                element={
                    <ProtectedRoute allowedRoles={['citizen']}>
                        <MyIdeas />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard/ideas/:id"
                element={
                    <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                        <IdeaDetail />
                    </ProtectedRoute>
                }
            />

            {/* Public Policy Detail (accessible to all authenticated users) */}
            <Route
                path="/policies/:id"
                element={
                    <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                        <PolicyDetail />
                    </ProtectedRoute>
                }
            />

            {/* Catch all - 404 */}
            <Route
                path="*"
                element={
                    <div style={{
                        minHeight: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        textAlign: 'center',
                        padding: '2rem'
                    }}>
                        <h1 style={{ fontSize: '6rem', fontWeight: 800, opacity: 0.2 }}>404</h1>
                        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Page not found</p>
                        <a href="/" className="btn btn-primary">
                            Go Home
                        </a>
                    </div>
                }
            />
        </Routes>
    );
}

export default App;
