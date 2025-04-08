import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product } from "../home";
import { User } from "../interfaces/User";
import {
  PaypalOrderResponse,
  PaypalCaptureResponse,
  Invoice,
} from "../interfaces/Paypal";
import { router } from "expo-router";

const JWT_KEY = "jwt_token";
const CSRF_KEY = "csrf_token";

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

export type ProductWithRating = Product & { rating: number; comment: string };

const axiosClient = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL });

export const clearTokens = async (): Promise<Result<true>> => {
  try {
    await AsyncStorage.removeItem(JWT_KEY);
    await AsyncStorage.removeItem(CSRF_KEY);
    delete axiosClient.defaults.headers.common["Authorization"];
    delete axiosClient.defaults.headers.common["X-CSRF-Token"];

    return Result.ok(true);
  } catch (error) {
    return Result.err("Failed to clear tokens");
  }
};

const handleAxiosError = async (
  error: any,
  defaultErrorMessage: string
): Promise<Result<never>> => {
  console.log(JSON.stringify(error));
  if (axios.isAxiosError(error)) {
    if (
      error.response &&
      [401, 403, 418 /*Teapot error*/].includes(error.response.status)
    ) {
      await clearTokens();
      router.replace("/login");
      return Result.err("Unauthorized");
    }
    return Result.err(error.response?.data?.error || defaultErrorMessage);
  }
  return Result.err("An unexpected error occurred");
};

const authGuard = (token?: Array<"JWT" | "CSRF">) => {
  token = token || [];
  const validatedJWT =
    !token.includes("JWT") || axiosClient.defaults.headers.common.Authorization;
  const validatedCSRF =
    !token.includes("CSRF") ||
    axiosClient.defaults.headers.common["X-CSRF-Token"];
  if (!validatedJWT || !validatedCSRF) {
    router.replace("/login");
    throw new Error("Unauthorized");
  }
};

export const login = async (
  email: string,
  password: string
): Promise<Result<User>> => {
  try {
    const response = await axiosClient.post(`/auth/login`, { email, password });
    const token = response.data.token;
    await AsyncStorage.setItem(JWT_KEY, token);
    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    await getCsrf();
    if (!response.data.user) return Result.err("No user found");

    return Result.ok({
      id: response.data.user.__v,
      username: response.data.user.username,
      email: response.data.user.email,
      role: response.data.user.role,
      since: response.data.user.createdAt,
    });
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return Result.err("Invalid password or Email");
    }
    return handleAxiosError(error, "Failed to login");
  }
};

export const getCsrf = async (): Promise<Result<string>> => {
  try {
    authGuard(["JWT"]);
    const response = await axiosClient.get(`/csrf-token`);
    if (!response.data?.csrfToken) return Result.err("No CSRF token received");

    await AsyncStorage.setItem(CSRF_KEY, response.data.csrfToken);
    axiosClient.defaults.headers.common["X-CSRF-Token"] =
      response.data.csrfToken;
    return Result.ok(response.data.csrfToken);
  } catch (error) {
    return handleAxiosError(error, "Failed to get CSRF token");
  }
};

export const register = async (
  email: string,
  username: string,
  password: string
): Promise<Result<true>> => {
  try {
    await axiosClient.post("/auth/register", { email, username, password });
    return Result.ok(true);
  } catch (error) {
    return handleAxiosError(error, "Failed to register");
  }
};

export const getProduct = async (barCode: string): Promise<Result<Product>> => {
  try {
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient.get(`/products/${barCode}`);
    return Result.ok(response.data);
  } catch (error) {
    return handleAxiosError(error, "Failed to get product");
  }
};

export const logout = async (): Promise<Result<true>> => {
  try {
    await AsyncStorage.removeItem(JWT_KEY);
    await AsyncStorage.removeItem(CSRF_KEY);
    return Result.ok(true);
  } catch (error) {
    return Result.err("Failed to log out");
  }
};

export const createPaypalOrder = async (
  barCodes: string[]
): Promise<Result<PaypalOrderResponse>> => {
  try {
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient.post(`/paypal/create-paypal-order/`, {
      barCodes,
    });
    return Result.ok(response.data);
  } catch (error) {
    return handleAxiosError(error, "Failed to create order");
  }
};

export const getPaypalOrderStatus = async (
  orderId: string
): Promise<Result<PaypalOrderResponse>> => {
  try {
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient.get(
      `/paypal/get-order-status/${orderId}`
    );
    return Result.ok(response.data);
  } catch (error) {
    return handleAxiosError(error, "Failed to get order status");
  }
};

export const capturePaypalOrder = async (
  orderId: string
): Promise<Result<PaypalCaptureResponse>> => {
  try {
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient.post(
      `/paypal/capture-payment/${orderId}`
    );
    return Result.ok(response.data);
  } catch (error) {
    return handleAxiosError(error, "Failed to capture order");
  }
};

export const deleteAccount = async (): Promise<Result<true>> => {
  try {
    authGuard(["JWT", "CSRF"]);
    await axiosClient.delete(`/users/profile`);
    clearTokens();
    return Result.ok(true);
  } catch (error) {
    return handleAxiosError(error, "Failed to delete account");
  }
};

export const initStoredTokens = async (): Promise<Result<true>> => {
  try {
    const jwtToken = await AsyncStorage.getItem(JWT_KEY);
    if (!jwtToken) return Result.err("No JWT token found");
    axiosClient.defaults.headers.common.Authorization = `Bearer ${jwtToken}`;

    const csrfToken = await AsyncStorage.getItem(CSRF_KEY);
    if (!csrfToken) return Result.err("No CSRF token found");
    axiosClient.defaults.headers.common["X-CSRF-Token"] = csrfToken;

    return Result.ok(true);
  } catch (error) {
    return Result.err("Failed to use stored tokens");
  }
};

export const loginWithToken = async (): Promise<Result<User>> => {
  try {
    authGuard(["JWT", "CSRF"]);

    const response = await axiosClient.get(`/auth/login`);

    if (!response.data.user) return Result.err("Your session has expired");

    return Result.ok({
      id: response.data.user.__v,
      username: response.data.user.username,
      email: response.data.user.email,
      role: response.data.user.role,
      since: response.data.user.createdAt,
    });
  } catch (error: any) {
    if (error.response?.status === 401) {
      clearTokens();
      console.log("The session has expired");
      return Result.err("Your session has expired");
    }
    return handleAxiosError(error, "Failed to login");
  }
};

export const getInvoices = (): Promise<Result<Invoice[]>> => {
  authGuard(["JWT", "CSRF"]);

  return axiosClient
    .get("/invoices")
    .then((response) => Result.ok(response.data))
    .catch((error) => handleAxiosError(error, "Failed to get invoices"));
};

export const getInvoice = (id: string): Promise<Result<Invoice>> => {
  authGuard(["JWT", "CSRF"]);

  return axiosClient
    .get(`/invoices/${id}`)
    .then((response) => Result.ok(response.data))
    .catch((error) => handleAxiosError(error, "Failed to get invoice"));
};

export const getBoughtProducts = (): Promise<Result<ProductWithRating[]>> => {
  authGuard(["JWT", "CSRF"]);

  return axiosClient
    .get(`/products/bought`)
    .then((response) => Result.ok(response.data))
    .catch((error) => handleAxiosError(error, "Failed to get products"));
};

export const updateRating = async (
  barCode: string,
  rating: number,
  comment?: string
): Promise<Result<ProductWithRating>> => {
  try {
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient.put(`/products/${barCode}/rating`, {
      rating,
      comment,
    });
    return Result.ok(response.data);
  } catch (error) {
    return handleAxiosError(error, "Failed to get product");
  }
};

export default {};
