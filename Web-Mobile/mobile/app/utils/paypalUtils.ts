import { capturePaypalOrder } from "../services/api";
import * as WebBrowser from "expo-web-browser";
import {
  PaypalOrderResponse,
  PaypalCaptureResponse,
} from "../interfaces/Paypal";

export const returnUrl = "mobilescanner://paypal-success";

export const processPayment = async (
  order: PaypalOrderResponse,
  onSuccess: any,
  onFailure: any
) => {
  WebBrowser.openBrowserAsync(order.links[1].href);

  const result: any = await WebBrowser.openAuthSessionAsync(
    order.links[1].href,
    returnUrl
  );
  const authorizationId = result.url?.split("token=")[1]?.split("&")[0];

  if (result.type === "success" && authorizationId) {
    await capturePayment(order.id, onSuccess, onFailure);
  } else {
    onFailure("Payment was not completed");
  }
};

export const capturePayment = async (
  orderId: string,
  onSuccess: (capturedOrder: PaypalCaptureResponse) => void,
  onFailure: (message: string) => void
) => {
  const capturedOrderRequest = await capturePaypalOrder(orderId);
  capturedOrderRequest.fold(
    (capturedOrder) => {
      if (capturedOrder.status === "COMPLETED") {
        onSuccess(capturedOrder);
      } else {
        onFailure(`Payment was not completed (${capturedOrder.status})`);
      }
    },
    () => onFailure("User cancelled the payment")
  );
};

export default {};
