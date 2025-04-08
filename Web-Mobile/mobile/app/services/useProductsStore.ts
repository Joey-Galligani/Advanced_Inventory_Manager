import { create } from "zustand";
import { Product } from "../home";

export interface ProductInfo {
  product: Product;
  amount: number;
}

interface ProductStore {
  products: Map<string, ProductInfo>;
  addProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  decreaseProduct: (id: string) => void;
  clearProducts: () => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: new Map(),

  addProduct: (product) =>
    set((state) => {
      const updatedProducts = new Map(state.products);
      if (updatedProducts.has(product._id)) {
        updatedProducts.get(product._id)!.amount += 1;
      } else {
        updatedProducts.set(product._id, { product, amount: 1 });
      }
      return { products: updatedProducts };
    }),

  removeProduct: (id) =>
    set((state) => {
      const updatedProducts = new Map(state.products);
      updatedProducts.delete(id);
      return { products: updatedProducts };
    }),
  decreaseProduct: (id) =>
    set((state) => {
      const updatedProducts = new Map(state.products);
      if (updatedProducts.has(id)) {
        updatedProducts.get(id)!.amount -= 1;
        if (updatedProducts.get(id)!.amount <= 0) {
          updatedProducts.delete(id);
        }
      }
      return { products: updatedProducts };
    }),

  clearProducts: () => set({ products: new Map() }),
}));

export default {};
