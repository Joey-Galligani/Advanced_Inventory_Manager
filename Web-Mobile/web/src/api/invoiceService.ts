import axiosClient from './axiosClient';
import { authGuard } from './axiosClient';

interface Invoice {
    _id: string;
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
}

export async function getInvoices() {
    // setAxiosConfig();
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient.get('/invoices');
    return response.data;
}

export async function createInvoice(invoiceData: Partial<Invoice>) {
    // setAxiosConfig();
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient.post('/invoices', invoiceData);
    return response.data;
}

export async function getInvoice(invoiceId: string) {
    // setAxiosConfig();
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient.get(`/invoices/${invoiceId}`);
    return response.data;
}

export async function updateInvoice(invoiceId: string, invoiceData: Partial<Invoice>) {
    // setAxiosConfig();
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient.put(`/invoices/${invoiceId}`, invoiceData);
    return response.data;
}

export async function deleteInvoice(invoiceId: string) {
    // setAxiosConfig();
    authGuard(["JWT", "CSRF"]);
    const response = await axiosClient.delete(`/invoices/${invoiceId}`);
    return response.data;
}
