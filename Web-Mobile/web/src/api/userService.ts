import axiosClient,{authGuard} from './axiosClient';

export async function getUserProfile() {
    // setAxiosConfig()
    authGuard(["JWT", "CSRF"]);;
    const response = await axiosClient.get('/users/profile');
    return response.data;
}

export async function updateUserProfile(profileData: any) {
    // setAxiosConfig();
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient.put('/users/profile', profileData);
    return response.data;
}

export async function deleteUserProfile() {
    // setAxiosConfig();
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient.delete('/users/profile');
    return response.data;
}
