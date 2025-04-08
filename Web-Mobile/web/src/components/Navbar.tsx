// Navbar.tsx
import { Button, Flex } from "@radix-ui/themes";
import { useNavigate } from 'react-router-dom';
import { 
  FaFileInvoiceDollar, 
  FaBoxOpen, 
  FaChartLine, 
  FaUsers, 
  FaSignOutAlt 
} from "react-icons/fa";
import { logout } from "../api/axiosClient";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-zinc-800 border-b border-zinc-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="" className="h-6 w-6" /> {/* Added sizing */}
            <h1 className="text-xl font-bold text-white">Trinity</h1>
          </div>
        
        <Flex gap="3">
          <Button 
            variant="soft" 
            color="orange" 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2"
          >
            <FaBoxOpen />
            Products
          </Button>

          <Button 
            variant="soft" 
            color="orange" 
            onClick={() => navigate('/invoices')} 
            className="flex items-center gap-2"
          >
            <FaFileInvoiceDollar />
            Invoices
          </Button>

          <Button 
            variant="soft" 
            color="orange" 
            onClick={() => navigate('/statistics')}
            className="flex items-center gap-2"
          >
            <FaChartLine />
            Statistics
          </Button>

          <Button 
            variant="soft" 
            color="orange" 
            onClick={() => navigate('/manage-users')}
            className="flex items-center gap-2"
          >
            <FaUsers />
            Manage Users
          </Button>

          <Button 
            variant="soft" 
            color="red" 
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2"
          >
            <FaSignOutAlt />
            Logout
          </Button>
        </Flex>
      </div>
    </nav>
  );
}

export default Navbar;