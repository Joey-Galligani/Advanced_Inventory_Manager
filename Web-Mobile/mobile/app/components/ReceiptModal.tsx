import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import InvoiceCard from "./InvoiceCard";
import { styles } from "../styles/homeStyles";
import { Invoice } from "../interfaces/Paypal";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const ReceiptModal = ({
  visible,
  onClose,
  invoice,
}: {
  visible: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}) => {
  if (!visible || !invoice) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.modal, { gap: 10 }]}>
      <InvoiceCard style={{ flex: 1 }} invoice={invoice} />

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log("Go to invoices");
            onClose();
            router.push("/invoices");
          }}
        >
          <Ionicons name="receipt" size={20} color="white" />
          <Text style={styles.buttonText}>Go to Invoices</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onClose}
        >
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ReceiptModal;
