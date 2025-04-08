// // Import Axios
// import axios from 'axios';


// const apiUrl = import.meta.env.VITE_API_URL;
// interface LoginData {
//   email: string;
//   password: string;
// }

// // Function to fetch and store CSRF token
// async function fetchCsrfToken(token: any) {
//   try {
//     const response = await axios.get(`${apiUrl}csrf-token`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     const { csrfToken } = response.data;
//     localStorage.setItem('csrf', csrfToken);
//     console.log('CSRF token fetched and stored');
//   } catch (error) {
//     console.error('Failed to fetch CSRF token', error);
//   }
// }
// // Function to handle login
// export async function login(credentials: LoginData) {
//   try {
//     const response = await axios.post(`/auth/login`, credentials);
//     console.log('Login response', response);
//     if(response.status !== 200) {
//       throw new Error('Login failed');
//     }
//     const { token, user } = response.data;

//     // Store JWT token in localStorage
//     localStorage.setItem('jwt_token', token);

//     // Configure Axios instance to use the tokens
//     // Fetch and store CSRF token
//     await fetchCsrfToken(token);
//     // setAxiosConfig();
//     console.log('Login successful');
//     return { token, user };
//   } catch (error) {
//     console.error('Login failed', error);
//     throw error;
//   }
// }

// export function clearTokens() {
//   localStorage.removeItem('jwt_token');
//   localStorage.removeItem('csrf');
// }

// export function logout() {
//   clearTokens();
// }
