import { StyleSheet } from "react-native";

export const formStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, gap: 20 },
  input: { width: "100%", borderWidth: 1, padding: 13, paddingLeft: 15, borderRadius: 9999 },
  inputs: {
    flexDirection: "column",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttons: {
    flexDirection: "column",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: "100%",
  },
  passwordWrapper: {
    flexDirection: "column",
    gap: 0,
    alignItems: "flex-start",
    width: "100%",
  },
  forgotPassword: {
    color: "rgb(199, 99, 99)",
    fontSize: 13,
    paddingLeft: 5,
    textDecorationLine: "underline",
  },
  inlineLoadingIndicator: {
    width: 0,
    transform: [{ translateX: 10 }],
  },
});

export default formStyles;
