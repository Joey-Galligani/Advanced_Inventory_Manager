import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { login, loginWithToken, initStoredTokens } from "./services/api";
import { Link, router } from "expo-router";
import { useUserStore } from "./services/useUserStore";
import Toast from "react-native-toast-message";
import styles from "./styles/homeStyles";
import formStyles from "./styles/formStyles";
import { Image } from "expo-image";

const LoginScreen = () => {
  const { setUser } = useUserStore();
  const [email, setEmail] = useState("a@a.com");
  const [password, setPassword] = useState("aaaaaa");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^.*@.*\..*$/;

  const handleLogin = async () => {
    if (loading) return;

    if (!email || !password) {
      setErrorMessage("Both fields are required.");
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const response = await login(email, password);
    setLoading(false);

    response.fold(
      (user) => {
        setUser(user);
        router.replace("/home");
      },
      (error) => setErrorMessage(error.error || "An unexpected error occurred")
    );
  };

  const handleAutoLogin = async () => {
    const tokensWereFound = await initStoredTokens();
    tokensWereFound.fold(
      () => handleTokenLogin(),
      async ({ error }) => showErrorToast(error)
    );
  };

  const handleTokenLogin = async () => {
    const response = await loginWithToken();
    response.fold(
      (user) => {
        setUser(user);
        router.replace("/home");
      },
      ({ error }) => showErrorToast(error)
    );
  };

  const showErrorToast = (error: string) => {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: error,
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 10,
    });
  };

  useEffect(() => {
    handleAutoLogin();
  }, []);

  return (
    <View style={formStyles.container}>
      <View style={loginStyles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={{
            aspectRatio: 1,
            height: "100%",
          }}
        />
      </View>
      <Text style={styles.errorText}>{errorMessage}</Text>
      <View style={formStyles.inputs}>
        <TextInput
          style={formStyles.input}
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          onSubmitEditing={handleLogin}
          editable={!loading}
          placeholderTextColor={"lightgray"}
          keyboardType="email-address"
        />
        <View style={formStyles.passwordWrapper}>
          <TextInput
            style={formStyles.input}
            placeholder="Password"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            autoCapitalize="none"
            onSubmitEditing={handleLogin}
            editable={!loading}
            placeholderTextColor={"lightgray"}
          />
          <Link style={formStyles.forgotPassword} href="">
            Forgot password
          </Link>
        </View>
      </View>
      <View style={formStyles.buttons}>
        <TouchableOpacity
          style={[
            styles.button,
            loading ? styles.buttonDisabled : null,
            formStyles.button,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Login</Text>
          {loading ? (
            <ActivityIndicator
              style={formStyles.inlineLoadingIndicator}
              color="white"
            />
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            loading ? styles.buttonDisabled : null,
            formStyles.button,
          ]}
          onPress={() => {
            router.navigate("/register");
          }}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const loginStyles = StyleSheet.create({
  logoContainer: {
    height: "13%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginScreen;
