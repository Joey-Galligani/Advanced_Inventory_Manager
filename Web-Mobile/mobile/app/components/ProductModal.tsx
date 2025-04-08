import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "../home";

interface ProductModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  visible,
  product,
  onClose,
}) => {
  if (!product) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={30} color="#333" />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
            />
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>{product.category}</Text>
            <Text style={styles.productPrice}>
              € {product.price.toFixed(2)}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#f1c40f" />
              <Text style={styles.productRating}>{product.averageRating}</Text>
            </View>

            <Text style={styles.sectionTitle}>Ingredients</Text>
            {product.ingredients.map((ingredient, index) => (
              <Text key={index} style={styles.ingredient}>
                - {ingredient}
              </Text>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    width: "90%",
    maxWidth: 400,
    borderRadius: 15,
    alignItems: "flex-start",
    elevation: 5, // Add shadow for Android
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    resizeMode: "cover",
  },
  productName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  productCategory: {
    fontSize: 18,
    color: "#888",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    color: "#2ecc71", // Green color for price
    fontWeight: "bold",
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  productRating: {
    fontSize: 18,
    color: "#333",
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 10,
  },
  ingredient: {
    fontSize: 16,
    color: "#555",
    marginLeft: 10,
    marginBottom: 6,
  },
  scrollView: {
    paddingBottom: 20, // Ensure content is not hidden
  },
});

export default ProductModal;
