import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
    const token = localStorage.getItem('jwt_token');
    const csrf = localStorage.getItem('csrf');


    // If there's no token, redirect to /login
    if (!token || !csrf) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
