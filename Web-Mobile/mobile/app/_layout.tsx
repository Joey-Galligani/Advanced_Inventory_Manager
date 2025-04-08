import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{ title: "Login", headerShown: false }}
      />
      <Stack.Screen
        name="register"
        options={{ title: "Register", headerShown: false }}
      />
      <Stack.Screen
        name="home"
        options={{ title: "Home", headerShown: false }}
      />
      <Stack.Screen
        name="profile"
        options={{ title: "Profile", headerShown: false }}
      />
      <Stack.Screen
        name="invoices"
        options={{ title: "Invoices", headerShown: false }}
      />
      <Stack.Screen
        name="invoice/[id]"
        options={{ title: "Invoice", headerShown: false }}
      />
      <Stack.Screen
        name="rateProducts"
        options={{ title: "Rate", headerShown: false }}
      />
    </Stack>
  );
}
