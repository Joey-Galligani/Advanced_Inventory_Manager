import axiosClient,{authGuard} from './axiosClient';

interface UserData {
    _id?: string;
    email?: string;
}

export async function getAllUsers() {
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient({ method: 'get', url: '/admin/users' });
    return response.data;
}

export async function getUserById(userId: string) {
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient({ method: 'get', url: `/admin/user/${userId}` });
    return response.data;
}

export async function createUser(userData: UserData) {
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient({ method: 'post', url: '/admin/user', data: userData });
    return response.data;
}

export async function updateUser(userId: string, userData: UserData) {
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient({ method: 'put', url: `/admin/user/${userId}`, data: userData });
    return response.data;
}

export async function deleteUser(userId: string) {
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient({ method: 'delete', url: `/admin/user/${userId}` });
    return response.data;
}

export async function getAllInvoices() {
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient({ method: 'get', url: '/admin/invoices' });
    return response.data;
}