import { SafeAreaView } from "react-native-safe-area-context";
import PageHeader from "./components/PageHeader";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
} from "react-native";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import {
  getBoughtProducts,
  ProductWithRating,
  updateRating,
} from "./services/api";
import { Ionicons } from "@expo/vector-icons";

const RateProducts = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductWithRating[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    getBoughtProducts().then((response) => {
      response.fold(
        (data) => setProducts(data),
        (error) => showToast("error", "Error", error.error)
      );
      setLoading(false);
    });
  };

  const handleRating = (product: ProductWithRating, rating: number) => {
    updateRating(product.barCode, rating).then((response) => {
      response.fold(
        () => {
          setProducts((prev) =>
            prev.map((p) =>
              p._id === product._id ? { ...p, rating: rating } : p
            )
          );
        },
        (error) => showToast("error", "Error", error.error)
      );
    });
  };

  const showToast = (type: string, text1: string, text2: string) => {
    Toast.show({ type, text1, text2 });
  };

  const renderProduct = ({ item }: { item: ProductWithRating }) => (
    <View style={styles.wrapper}>
      <View style={styles.product}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <View style={styles.infoBlock}>
          <Text style={styles.text}>
            <Text style={styles.productName}>{item.name}</Text>
          </Text>
          <Text style={styles.text}>
            Current price: {item.price?.toFixed(2)} €
          </Text>
          <Text style={styles.text}>Barcode: {item.barCode}</Text>
          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }).map((_, index) => (
              <TouchableOpacity
                key={`${item._id}-star-${index}`}
                onPress={() => handleRating(item, index + 1)}
              >
                <Ionicons
                  name="star"
                  size={30}
                  color={
                    item.rating >= index + 1
                      ? "gold"
                      : "rgba(34, 17, 17, 0.2)"
                  }
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Rate Products" />
      <Text style={styles.tips}>
        Tips: Rate products by clicking on the corresponding star!
      </Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchProducts} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No past products</Text>
        }
        renderItem={renderProduct}
      />
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white" },
  tips: { color: "darkgrey", padding: 5 },
  emptyText: { textAlign: "center", fontSize: 20, color: "gray", padding: 20 },
  wrapper: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  product: { flexDirection: "row", alignItems: "center", gap: 10 },
  image: {
    height: "100%",
    width: 100,
    borderRadius: 8,
    backgroundColor: "lightgray",
  },
  infoBlock: { flexDirection: "column", gap: 5 },
  text: { fontSize: 16 },
  productName: { color: "rgb(197, 138, 138)" },
  ratingRow: { flexDirection: "row" },
});

export default RateProducts;
