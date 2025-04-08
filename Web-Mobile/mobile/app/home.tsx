import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useUserStore } from "./services/useUserStore";
import { useCameraPermissions } from "expo-camera";
import { Redirect, router } from "expo-router";
import {
  capturePaypalOrder,
  createPaypalOrder,
  getProduct,
  logout,
} from "./services/api";
import CameraContainer from "./components/CameraContainerCard";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useProductStore } from "./services/useProductsStore";
import * as WebBrowser from "expo-web-browser";
import {
  Invoice,
  PaypalCaptureResponse,
  PaypalOrderResponse,
} from "./interfaces/Paypal";
import styles from "./styles/homeStyles";
import PermissionRequest from "./components/PermissionRequest";
import PayPalModal from "./components/PayPalModal";
import ReceiptModal from "./components/ReceiptModal";
import ClearConfirmationModal from "./components/ClearConfirmation";
import BurgerMenu from "./components/BurgerMenu";
import { SafeAreaView } from "react-native-safe-area-context";

export interface Product {
  _id: string;
  name: string;
  barCode: string;
  category: string;
  imageUrl: string;
  ingredients: string[];
  price: number;
  averageRating: number;
}

const Home = () => {
  const { user, clearUser } = useUserStore();
  const { products, addProduct, clearProducts } = useProductStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [searchBarValue, setSearchBarValue] = useState("");
  const [fetching, setFetching] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const lastInvoice = useRef<Invoice | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const paypalOrder = useRef<PaypalOrderResponse | null>(null);
  const totalPrice = Array.from(products.values()).reduce(
    (acc, product) => acc + product.product.price * product.amount,
    0
  );

  if (!user) {
    <Redirect href={"/login"} />;
  }

  if (!permission) {
    return (
      <View>
        <Text>The application doesn't have access to the camera!</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return <PermissionRequest requestPermission={requestPermission} />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      clearUser();
      router.replace("/login");
    } catch (error) {
      console.error("Failed to logout");
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (fetching || !data) return;
    setFetching((prev) => {
      if (prev) return prev;
      return true;
    });
    setScanning(false);

    try {
      const response = await getProduct(data);

      response.fold(
        (product) => {
          addProduct(product);
        },
        (error) => {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: error.error,
            visibilityTime: 3000,
            autoHide: true,
            bottomOffset: 10,
          });
        }
      );
    } catch (error) {
      console.error("Error while fetching product:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleManualAdd = async (barcode: string) => {
    if (!barcode.length) {
      return;
    }
    await handleBarCodeScanned({ data: barcode });
    setSearchBarValue("");
  };

  const returnUrl = "mobilescanner://";

  const getBarCodeList = (
    products: Map<string, { amount: number; product: { barCode: string } }>
  ): string[] => {
    return Array.from(products.values()).flatMap(({ amount, product }) =>
      new Array(amount).fill(product.barCode)
    );
  };

  const handlePaymentSuccess = (capturedOrder: PaypalCaptureResponse) => {
    Toast.show({
      type: "success",
      text1: "Payment successful",
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 10,
    });

    clearProducts();
    lastInvoice.current = capturedOrder.invoice;
    setShowReceiptModal(true);
  };

  const handlePaymentFailure = (message: string) => {
    Toast.show({
      type: "error",
      text1: "Payment failed",
      text2: message,
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 10,
    });
  };

  const capturePayment = async (orderId: string) => {
    const capturedOrderRequest = await capturePaypalOrder(orderId);
    capturedOrderRequest.fold(
      (capturedOrder) => {
        if (capturedOrder.status === "COMPLETED") {
          handlePaymentSuccess(capturedOrder);
        } else {
          handlePaymentFailure(
            `Payment was not completed (${
              capturedOrder.status || "UNKNOWN STATUS"
            })`
          );
        }
      },
      () => handlePaymentFailure("User cancelled the payment")
    );
    setPaypalLoading(false);
    setShowCheckoutModal(false);
  };

  const processPayment = async (order: PaypalOrderResponse) => {
    paypalOrder.current = order;
    const result: any = await WebBrowser.openAuthSessionAsync(
      order.links[1].href,
      returnUrl
    );
    const authorizationId = result.url?.split("token=")[1]?.split("&")[0];

    if (result.type === "success" && authorizationId) {
      await capturePayment(order.id);
    } else {
      setPaypalLoading(false);
      setShowCheckoutModal(false);
      handlePaymentFailure("Payment was not completed");
    }
  };

  const handlePaymentError = (error: { error: string }) => {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: error.error,
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 10,
    });
  };

  const pay = async () => {
    setPaypalLoading(true);
    const barCodeList = getBarCodeList(products);
    const orderRequest = await createPaypalOrder(barCodeList);

    orderRequest.fold(
      async (order) => await processPayment(order),
      async (error) => {
        setPaypalLoading(false);
        handlePaymentError(error);
      }
    );
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerWrapper}>
            <View style={[styles.searchBox, { flex: 1 }]}>
              <TextInput
                placeholder="Enter barcode “49176427478”"
                style={{ flex: 1 }}
                onEndEditing={() => {
                  handleManualAdd(searchBarValue);
                }}
                value={searchBarValue}
                onChange={(e) => setSearchBarValue(e.nativeEvent.text)}
                editable={!fetching}
                placeholderTextColor={"lightgray"}
                keyboardType="numbers-and-punctuation"
              ></TextInput>
              <TouchableOpacity
                onPress={() => handleManualAdd(searchBarValue)}
                disabled={fetching}
              >
                <Ionicons name="search" size={20} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowMenu(true)}
            style={[styles.menuBurger, styles.button, styles.buttonSquare]}
            hitSlop={10}
          >
            <Ionicons name="menu" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, overflow: "visible" }}>
          <CameraContainer
            scanning={scanning}
            handleBarCodeScanned={handleBarCodeScanned}
            products={Array.from(products.values())}
            onClear={() => setShowClearConfirmation(true)}
          />
        </View>

        <View style={[styles.buttons]}>
          <View
            style={{
              width: "100%",
              alignItems: "center",
              position: "absolute",
              bottom: "100%",
            }}
          >
            <View
              style={{
                padding: 10,
                backgroundColor: "white",
                borderTopLeftRadius: 9999,
                borderTopRightRadius: 9999,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.button,
                  fetching ? styles.buttonDisabled : null,
                  styles.buttonSquare,
                  { width: 60 },
                ]}
                onPress={() => setScanning((prev) => !prev)}
                disabled={fetching}
              >
                {!scanning ? (
                  <Ionicons name="barcode-outline" size={40} color="white" />
                ) : (
                  <Ionicons name="list-outline" size={40} color="white" />
                )}
                {fetching ? <ActivityIndicator color="white" /> : null}
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.button,
              products.size < 1 || scanning ? styles.buttonDisabled : null,
              { width: "100%" },
            ]}
            onPress={() => setShowCheckoutModal(true)}
            disabled={products.size < 1 || scanning}
          >
            <Ionicons name="card" size={20} color="white" />
            <Text style={styles.buttonText}>
              Checkout {totalPrice.toFixed(2)} €
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <ClearConfirmationModal
        text={"Are you sure you want to clear all products?"}
        onClose={() => setShowClearConfirmation(false)}
        onConfirm={() => {
          setShowClearConfirmation(false);
          clearProducts();
        }}
        visible={showClearConfirmation}
      />
      <PayPalModal
        visible={showCheckoutModal}
        loading={paypalLoading}
        onClose={() => setShowCheckoutModal(false)}
        pay={pay}
      />
      <ReceiptModal
        visible={showReceiptModal}
        invoice={lastInvoice.current}
        onClose={() => setShowReceiptModal(false)}
      />
      <BurgerMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        handleLogout={handleLogout}
      ></BurgerMenu>
      <Toast />
    </>
  );
};

export default Home;
