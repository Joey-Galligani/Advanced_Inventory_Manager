import { CameraView } from "expo-camera";
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { Product } from "../home";
import ProductCard from "./ProductCard";
import { useRef } from "react";

const CameraBorders = () => {
  return (
    <View
      style={{
        position: "absolute",
        width: "65%",
        height: "60%",
        top: "45%",
        left: "50%",
        borderColor: "white",
        borderWidth: 2,
        borderRadius: 10,
        borderStyle: "dashed",
        transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
      }}
    ></View>
  );
};

const ScannedProductList = ({
  products,
  onClear,
}: {
  products: { product: Product; amount: number }[];
  onClear: () => void;
}) => {
  return Object.keys(products).length > 0 ? (
    <>
      <View style={styles.tools}>
        <TouchableOpacity onPress={onClear} disabled={products.length < 1}>
          <Text
            style={{
              ...styles.tool,
              ...(products.length < 1 ? styles.toolDisabled : {}),
            }}
          >
            CLEAR
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.productList}>
        <View style={{ flexDirection: "column", gap: 10 }}>
          {products.map(
            (product: { product: Product; amount: number }, index) => (
              <ProductCard
                key={`${product.product._id}-${index}`}
                product={product.product}
                amount={product.amount}
              />
            )
          )}
        </View>
      </ScrollView>
    </>
  ) : (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, color: "gray" }}>No products scanned</Text>
    </View>
  );
};

const CameraContainer = ({
  scanning,
  handleBarCodeScanned,
  products,
  onClear,
}: {
  scanning: boolean;
  handleBarCodeScanned: (event: any) => void;
  products: { product: Product; amount: number }[];
  onClear: () => void;
}) => {
  const scanned = useRef(false);

  const onBarcodeScanned = (event: any) => {
    if (!scanned.current) {
      scanned.current = true;
      handleBarCodeScanned(event);

      setTimeout(() => (scanned.current = false), 500);
    }
  };

  return (
    <View style={styles.cameraContainer}>
      {scanning ? (
        <View style={{ position: "relative" }}>
          <CameraView
            onBarcodeScanned={onBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["upc_a", "ean13", "ean8", "upc_e", "code128"],
            }}
            style={styles.cameraPreview}
          />
          <CameraBorders />
        </View>
      ) : (
        <ScannedProductList products={products} onClear={onClear} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flexGrow: 1,
    flexShrink: 1,
    overflow: "hidden",
    marginLeft: -20,
    marginRight: -20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  cameraPreview: {
    borderRadius: 20,
    height: "100%",
    width: "100%",
    overflow: "hidden",
    boxSizing: "border-box",
    backgroundColor: "black",
  },
  productList: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    overflow: "visible",
    paddingTop: 10,
  },
  tools: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
  },
  tool: {
    fontSize: 15,
    fontWeight: "bold",
    padding: 3,
    color: "rgb(199, 99, 99)",
  },
  toolDisabled: {
    opacity: 0.5,
  },
});

export default CameraContainer;
