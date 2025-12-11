import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Reservations from './pages/Reservations';
import Contracts from './pages/Contracts';
import Clients from './pages/Clients';
import Maintenance from './pages/Maintenance';
import Rapports from './pages/Rapports';
import Paiements from './pages/Paiements';
import Settings from './pages/Settings';
import GPS from './pages/GPS';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Settings Components
import UsersList from './components/settings/UsersList';
import RolesList from './components/settings/RolesList';
import AgencySettings from './components/settings/AgencySettings';
import CompanySettings from './components/settings/CompanySettings';
import FinanceSettings from './components/settings/FinanceSettings';
import GeneralSettings from './components/settings/GeneralSettings';

// Helper component to handle initial redirect
const HomeRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }
    return user ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<HomeRedirect />} />
                    <Route path="/login" element={<Login />} />

                    {/* Protected Admin Routes */}
                    <Route path="/admin" element={<ProtectedRoute />}>
                        <Route path="dashboard" element={<Layout><Dashboard /></Layout>} />
                        <Route path="vehicles" element={<Layout><Vehicles /></Layout>} />
                        <Route path="reservations" element={<Layout><Reservations /></Layout>} />
                        <Route path="clients" element={<Layout><Clients /></Layout>} />
                        <Route path="contracts" element={<Layout><Contracts /></Layout>} />
                        <Route path="payments" element={<Layout><Paiements /></Layout>} />
                        <Route path="maintenance" element={<Layout><Maintenance /></Layout>} />
                        <Route path="reports" element={<Layout><Rapports /></Layout>} />
                        <Route path="gps" element={<Layout><GPS /></Layout>} />
                        
                        {/* Nested Settings Routes */}
                        <Route path="settings" element={<Layout><Settings /></Layout>}>
                            <Route index element={<Navigate to="company" replace />} />
                            <Route path="company" element={<CompanySettings />} />
                            <Route path="agency" element={<AgencySettings />} />
                            <Route path="users" element={<UsersList />} />
                            <Route path="roles" element={<RolesList />} />
                            <Route path="finance" element={<FinanceSettings />} />
                            <Route path="maintenance" element={<GeneralSettings category="maintenance" />} />
                            <Route path="gps" element={<GeneralSettings category="gps" />} />
                            <Route path="notifications" element={<GeneralSettings category="notifications" />} />
                            <Route path="system" element={<GeneralSettings category="system" />} />
                        </Route>
                    </Route>
                    
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
