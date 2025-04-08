import axiosClient,{authGuard} from './axiosClient';

export async function getReports() {
    // setAxiosConfig();
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient.get('/reports');
    return response.data;
}
