import React, { useState } from "react";
import { Product } from "../home";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import IngredientCard from "./IngredientsCard";
import { useProductStore } from "../services/useProductsStore";
import { Ionicons } from "@expo/vector-icons";
import { styles as homeStyles } from "../styles/homeStyles";
import ProductModal from "./ProductModal";

const Stars = ({ score }: { score: number }) => (
  <View style={styles.ratingContainer}>
    <View style={styles.ratingBackground}>
      {Array(5)
        .fill(null)
        .map((_, i) => (
          <Ionicons key={i} name="star" size={16} color="lightgray" />
        ))}
    </View>
    <View style={[styles.ratingOverlay, { width: `${(score / 5) * 100}%` }]}>
      {Array(5)
        .fill(null)
        .map((_, i) => (
          <Ionicons key={i} name="star" size={16} color="gold" />
        ))}
    </View>
  </View>
);

const ProductInfo = ({ product }: { product: Product }) => {
  return (
    <View style={styles.productInfo}>
      <Text numberOfLines={1} style={styles.productName}>
        {product.name ?? "Unknown"}
      </Text>
      <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
        <Text
          style={{ fontWeight: "400", color: "gray", flexShrink: 1 }}
          numberOfLines={2}
        >
          {product.category ? product.category.split(",")[0] : ""}
        </Text>
        <Stars score={product.averageRating ?? 0} />
      </View>
      <Text numberOfLines={2} style={{ flexShrink: 1 }}>
        {Array.from(new Set((product.ingredients?.[0] ?? "").split(","))).map(
          (ingredient) => (
            <IngredientCard key={ingredient} ingredient={ingredient} />
          )
        )}
      </Text>
    </View>
  );
};

const ProductTools = ({
  removeProduct,
  decreaseProduct,
  addProduct,
  amount,
  product,
}: {
  removeProduct: (id: string) => void;
  decreaseProduct: (id: string) => void;
  addProduct: (product: Product) => void;
  amount: number;
  product: Product;
}) => {
  return (
    <View style={styles.tools}>
      <TouchableOpacity
        style={{
          ...homeStyles.button,
          padding: 2,
        }}
        onPress={() => removeProduct(product._id)}
      >
        <Ionicons
          name="trash"
          size={20}
          color="white"
          style={{ padding: 2.5 }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          ...homeStyles.button,
          backgroundColor: "gray",
          padding: 2,
        }}
        onPress={() => decreaseProduct(product._id)}
      >
        <Ionicons name="remove" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          ...homeStyles.button,
          backgroundColor: "white",
          padding: 2,
          aspectRatio: 1,
          height: "100%",
        }}
      >
        <Text>{amount}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          ...homeStyles.button,
          padding: 2,
          backgroundColor: "gray",
        }}
        onPress={() => addProduct(product)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const ProductFooter = ({
  removeProduct,
  decreaseProduct,
  addProduct,
  amount,
  product,
}: {
  removeProduct: (id: string) => void;
  decreaseProduct: (id: string) => void;
  addProduct: (product: Product) => void;
  amount: number;
  product: Product;
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "bold", color: "black" }}>
        {product.price?.toFixed(2)} €
      </Text>
      <ProductTools
        removeProduct={removeProduct}
        decreaseProduct={decreaseProduct}
        addProduct={addProduct}
        amount={amount}
        product={product}
      />
    </View>
  );
};

const ProductCard = ({
  product,
  amount,
}: {
  product: Product;
  amount: number;
}) => {
  const { removeProduct, decreaseProduct, addProduct } = useProductStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => handleProductPress(product)}
        style={styles.productCard}
      >
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
        <View
          style={{
            flexDirection: "column",
            gap: 20,
            flex: 1,
            flexShrink: 1,
          }}
        >
          <ProductInfo product={product} />
          <ProductFooter
            addProduct={addProduct}
            decreaseProduct={decreaseProduct}
            removeProduct={removeProduct}
            amount={amount}
            product={product}
          />
        </View>
      </TouchableOpacity>
      <ProductModal onClose={() => setModalVisible(false)} product={selectedProduct} visible={modalVisible} />
    </>
  );
};

const styles = StyleSheet.create({
  productCard: {
    borderRadius: 8,
    boxShadow: "0 0 10px rgba(0, 0, 0, .2)",
    padding: 10,
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    gap: 10,
  },
  productImage: {
    height: "100%",
    width: 100,
    borderRadius: 8,
    backgroundColor: "lightgray",
  },
  productInfo: { gap: 5 },
  productName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "rgba(0, 0, 0, .7)",
  },
  tools: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 30,
  },
  ratingContainer: {
    position: "relative",
    flexDirection: "row",
    width: 80,
    overflow: "hidden",
  },
  ratingBackground: {
    flexDirection: "row",
    position: "absolute",
  },
  ratingOverlay: {
    flexDirection: "row",
    position: "absolute",
    overflow: "hidden",
  },
});

export default ProductCard;
