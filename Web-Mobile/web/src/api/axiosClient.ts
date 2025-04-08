import axios from 'axios';
import type { CookieJar } from 'tough-cookie';
const apiUrl = import.meta.env.VITE_API_URL;
declare module 'axios' {
  interface AxiosRequestConfig {
    jar?: CookieJar;
  }
}
export interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}
export interface Error {
  error: string;
}
class Result<T> {
  private constructor(
    private readonly value: T | Error,
    private readonly isErr: boolean
  ) {}

  static ok<U>(value: U): Result<U> {
    return new Result<U>(value, false);
  }

  static err(error: string): Result<never> {
    return new Result<never>({ error }, true);
  }

  isError(): this is Result<Error> {
    return this.isErr;
  }

  fold<U>(onSuccess: (val: T) => U, onError: (err: Error) => U): U {
    return this.isErr
      ? onError(this.value as Error)
      : onSuccess(this.value as T);
  }
}

const axiosClient = axios.create({withCredentials: true, baseURL: apiUrl});

const handleAxiosError = (
  error: any,
  defaultErrorMessage: string
): Result<never> => {
  console.log(error);
  if (axios.isAxiosError(error)) {
    if (error.response && [401, 403, 418].includes(error.response.status)) {
      return Result.err("Unauthorized");
    }
    return Result.err(error.response?.data?.error || defaultErrorMessage);
  }
  return Result.err("An unexpected error occurred");
};

// Function to check if the token is expired
export function isTokenExpired(token: any) {
  try {
    console.log("Checking token:", token.substring(0, 10) + "...");
    const [header, payloadBase64, signature] = token.split('.');
    console.log("Token parts:", header ? "✓" : "✗", payloadBase64 ? "✓" : "✗", signature ? "✓" : "✗");
    
    // Add proper base64 padding if needed
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
    
    const payload = JSON.parse(atob(paddedBase64));
    console.log("Token payload:", payload);
    if (!payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    console.log("Token expiration:", new Date(payload.exp * 1000), "Current time:", new Date(now * 1000));
    return payload.exp < now;
  } catch (error) {
    console.error('Invalid token format:', error);
    // Don't assume expired on error, assume valid instead
    return false;
  }
}

// Function to fetch and store CSRF token
export const getCsrf = async (): Promise<Result<string>> => {
  try {
    authGuard(["JWT"]);
    const response = await axiosClient.get(`csrf-token`);
    if (!response.data?.csrfToken) return Result.err("No CSRF token received");
    axiosClient.defaults.headers.common["X-CSRF-Token"] =
      response.data.csrfToken;
      localStorage.setItem('csrf', response.data.csrfToken);
      // axios.defaults.xsrfCookieName = 'csrftoken';
      return Result.ok(response.data.csrfToken);
  } catch (error) {
    return handleAxiosError(error, "Failed to get CSRF token");
  }
};

// Function to handle registration
export const register = async (
  email: string,
  username: string,
  password: string
): Promise<Result<true>> => {
  try {
    await axiosClient.post("auth/register", { email, username, password });
    return Result.ok(true);
  } catch (error) {
    return handleAxiosError(error, "Failed to register");
  }
};

// Function to handle login
export const login = async (
  email: string,
  password: string
): Promise<Result<User>> => {
  try {
    const response = await axios.post(
      `${apiUrl}auth/login`,
      { email, password }
    );
    const token = response.data.token;
    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('jwt_token', token);
    await getCsrf();
    if (!response.data.user) return Result.err("No user found");
    return Result.ok({
      _id: response.data.user.__v,
      username: response.data.user.username,
      email: response.data.user.email,
      role: response.data.user.role,
    });
  } catch (error) {
    return handleAxiosError(error, "Failed to login");
  }
};

export const authGuard = (token?: Array<"JWT" | "CSRF">) => {
  token = token || [];
  const jwt = localStorage.getItem('jwt_token');
  const csrf = localStorage.getItem('csrf');
  
  if (!jwt) {
    // Clear any remaining tokens to be safe
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('csrf');
    return Result.err("Unauthorized request");
  }
  
  // Check JWT expiration
  if (token.includes("JWT") && isTokenExpired(jwt)) {
    // Token is expired, clear both tokens
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('csrf');
    return Result.err("Unauthorized request (JWT Expired)");
  }
  
  axiosClient.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
  
  const validatedCSRF = !token.includes("CSRF") || csrf;
  if (!validatedCSRF) return Result.err("Unauthorized request (CSRF Missing)");
  
  axiosClient.defaults.headers.common["X-CSRF-Token"] = csrf;
  
  return Result.ok(true);
};


export const logout = async (): Promise<Result<true>> => {
  try {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('csrf');
    return Result.ok(true);
  } catch (error) {
    return Result.err("Failed to log out");
  }
};

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    
    if (token && isTokenExpired(token)) {
      // Token is expired, clear both tokens
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('csrf');
      
      // Redirect to login page
      window.location.href = '/login';
      
      throw new Error('Token expired');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      // If we receive a 401 Unauthorized response, the token might be expired
      if (error.response.status === 401) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('csrf');
        
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


export default axiosClient
