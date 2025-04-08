import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { Invoice } from "../interfaces/Paypal";

interface InvoiceCardProps {
  invoice: Invoice;
  style?: any;
}

const InvoiceCard = ({ invoice, style }: InvoiceCardProps) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { textAlign: "center" }]}>
        ID: {invoice.id}
      </Text>

      <View style={styles.table}>
        <View style={styles.tableRowHeader}>
          <Text style={styles.tableHeader}>Product</Text>
          <Text style={styles.tableHeader}>Barcode</Text>
          <Text style={styles.tableHeader}>Quantity</Text>
          <Text style={styles.tableHeader}>Price</Text>
          <Text style={styles.tableHeader}>Total</Text>
        </View>
        <FlatList
          style={styles.scrollList}
          data={invoice.items}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.product?.name ?? "Unknown"}</Text>
              <Text style={styles.tableCell}>{item.productId}</Text>
              <Text style={styles.tableCell}>{item.quantity} pcs</Text>
              <Text style={styles.tableCell}>{item.price.toFixed(2)} €</Text>
              <Text style={styles.tableCell}>
                {(item.quantity * item.price).toFixed(2)} €
              </Text>
            </View>
          )}
        />
      </View>

      <Text style={styles.totalAmount}>
        Total Amount: {invoice.totalAmount.toFixed(2)} €
      </Text>
      <Text
        style={[
          styles.status,
          { color: invoice.status === "COMPLETED" ? "green" : "orange" },
        ]}
      >
        Status: {invoice.status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scrollList: {
    flex: 1,
    overflow: "scroll",
  },
  table: {
    flex: 1,
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    borderRadius: 10,
  },
  tableRowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(197, 138, 138, 0.6)",
    paddingVertical: 5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  tableHeader: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    alignItems: "center",
    padding: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    maxHeight: 70,
    fontSize: 12,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  status: {
    fontSize: 16,
    marginTop: 5,
    color: "#666",
  },
});

export default InvoiceCard;
