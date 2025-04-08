import { Navigate, Outlet } from 'react-router-dom';

function PublicRoute() {
    const token = localStorage.getItem('jwt_token');
    const csrf = localStorage.getItem('csrf');

    // If user is already logged in, redirect away from this route
    if (token || csrf) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default PublicRoute;
