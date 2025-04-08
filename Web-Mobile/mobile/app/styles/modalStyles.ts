import { StyleSheet } from "react-native";

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 20,
  },
  modalActions: {
    flexDirection: "column",
    width: "100%",
    gap: 10,
  },
});

export default modalStyles;
