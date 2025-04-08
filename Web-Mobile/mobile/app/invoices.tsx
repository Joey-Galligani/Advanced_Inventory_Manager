import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { getInvoices } from "./services/api";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Invoice } from "./interfaces/Paypal";
import Toast from "react-native-toast-message";
import PageHeader from "./components/PageHeader";

const InvoicesScreen = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    getInvoices().then((response) => {
      response.fold(
        (data) => {
          setInvoices(data);
          setLoading(false);
        },
        (error) => {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: error.error,
          });
          setLoading(false);
        }
      );
    });
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading invoices...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Invoices" />

      <FlatList
        data={[...invoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              setLoading(true);
              fetchInvoices();
            }}
          />
        }
        ListEmptyComponent={
          <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ textAlign: "center", fontSize: 20, color: "gray" }}>
              No past invoices
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.invoiceItem}
            onPress={() => router.push(`/invoice/${item.id}`)}
          >
            <View style={styles.invoiceInfo}>
              <Text style={styles.invoiceText}>
                Invoice ID:{" "}
                <Text
                  style={{
                    color: "rgb(197, 138, 138)",
                  }}
                >
                  {item.id}
                </Text>
              </Text>
              <Text style={styles.invoiceText}>
                Total: {item.totalAmount?.toFixed(2)} €
              </Text>
              <Text style={styles.invoiceText}>
                Status:{" "}
                <Text
                  style={{
                    color: item.status === "COMPLETED" ? "green" : "orange",
                  }}
                >
                  {item.status}
                </Text>
              </Text>
              <Text style={styles.invoiceText}>
                Date: {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  invoiceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  invoiceInfo: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    textAlign: "justify",
  },
  invoiceText: {
    fontSize: 16,
  },
});

export default InvoicesScreen;
