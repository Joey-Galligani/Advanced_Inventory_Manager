import { create } from "zustand";
import { Invoice } from "./api";

interface InvoicesStore {
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[]) => void;
}

export const useInvoicesStore = create<InvoicesStore>((set) => ({
  invoices: [],

  setInvoices: (invoices) => set({ invoices }),
}));

export default {};