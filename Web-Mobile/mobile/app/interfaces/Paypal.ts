export interface PaypalOrderResponse {
  id: string;
  links: { href: string; method: string; rel: string }[];
  payment_source: { paypal: { app_switch_eligibility: boolean } };
  status: string;
}

export interface Invoice {
  id: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    product?: Pick<Item, "name">;
  }[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}
export interface Item {
  _id: string;
  averageRating: number;
  barCode: string;
  createdAt: string;
  imageUrl: string;
  ingredients: string[];
  name: string;
  price: number;
  ratings: any[];
  updatedAt: string;
}

export interface PaypalCaptureResponse {
  id: string;
  amount: {
    currency_code: string;
    value: string;
  };
  final_capture: boolean;
  seller_protection: {
    status: string;
    dispute_categories: string[];
  };
  seller_receivable_breakdown: {
    gross_amount: {
      currency_code: string;
      value: string;
    };
    paypal_fee: {
      currency_code: string;
      value: string;
    };
    net_amount: {
      currency_code: string;
      value: string;
    };
    exchange_rate: Record<string, never>;
  };
  invoice_id: string;
  status:
    | "FAILED"
    | "REFUNDED"
    | "PENDING"
    | "PARTIALLY_REFUNDED"
    | "DECLINED"
    | "COMPLETED";
  status_details: {
    reason: string;
  };
  create_time: string;
  update_time: string;
  links: {
    href: string;
    rel: string;
    method: string;
  }[];
  invoice: Invoice;
}

export default {};
