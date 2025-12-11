import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        // Affichez un écran de chargement pendant que l'état d'authentification est vérifié
        return (
            <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    // Une fois le chargement terminé, vérifiez s'il y a un utilisateur
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
