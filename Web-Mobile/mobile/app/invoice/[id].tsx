import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useLocalSearchParams } from "expo-router";
import InvoiceCard from "../components/InvoiceCard";
import PageHeader from "../components/PageHeader";
import { Invoice } from "../interfaces/Paypal";
import { getInvoice } from "../services/api";

const InvoiceScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      getInvoice(id).then((response) => {
        response.fold(
          (data) => {
            setInvoice(data);
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

    fetchInvoices();
  }, []);

  if (loading || !invoice) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading invoice...</Text>
        <Toast />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Invoices" />

      <InvoiceCard style={{ flex: 1, paddingTop: 20 }} invoice={invoice} />
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default InvoiceScreen;
