import { useNavigate } from 'react-router-dom';
import { logout } from '../api/axiosClient';

function LogoutButton() {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();      // Clear tokens
        navigate('/login', { replace: true });
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
}

export default LogoutButton;
