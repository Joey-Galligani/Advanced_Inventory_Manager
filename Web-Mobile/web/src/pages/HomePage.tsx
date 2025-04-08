import { logout } from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div>
            <h2>HomePage</h2>
            <p>This is a protected page only visible to logged-in users.</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default HomePage;
