import axiosClient from './axiosClient';
import { authGuard } from './axiosClient';

export interface Rating {
    _id: string;
    rating: number;
    user: string;
    comment?: string;
    createdAt: string;
  }

export interface Product {
    barCode: string;
    name: string;
    price: number;
    description?: string;
    stock: number;
    category?: string;
    averageRating?: number;
    ratings: Rating[];
    imageUrl?: string;
    createdAt: string;
}

/**
 * GET /api/products
 */
export async function getAllProducts(): Promise<Product[]> {
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient({ method: 'get', url: '/products' });
    return response.data;
}

/**
 * GET /api/products/:barCode
 */
export async function getProductByBarCode(barCode: string): Promise<Product> {
    // setAxiosConfig();
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient({ method: 'get', url: `/products/${barCode}` });
    return response.data;
}

/**
 * PUT /api/products/:barCode
 */
export async function updateProduct(
    barCode: string,
    productData: Partial<Product>,
): Promise<Product> {
    // setAxiosConfig();
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient({ method: 'put', url: `/products/${barCode}`, data: productData });
    return response.data;
}

export async function deleteProduct(barCode: string): Promise<void> {
    // setAxiosConfig();
    authGuard(["JWT", "CSRF"]);
    await axiosClient({ method: 'delete', url: `/products/${barCode}` });
}
