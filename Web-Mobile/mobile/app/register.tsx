import React, { useState } from "react";
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { register } from "./services/api";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import styles from "./styles/homeStyles";
import formStyles from "./styles/formStyles";
import { Ionicons } from "@expo/vector-icons";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    if (loading) return;

    if (!email || !password || !username) {
      setErrorMessage("All fields are required.");
      return;
    }

    const emailRegex = /^.*@.*\..*$/;

    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    const response = await register(email, username, password);
    setLoading(false);

    response.fold(
      () => {
        router.replace("/login");
      },
      ({ error }) => {
        setErrorMessage(error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error,
          visibilityTime: 3000,
          autoHide: true,
          bottomOffset: 10,
        });
      }
    );
  };

  return (
    <View style={formStyles.container}>
      <Text
        style={{
          fontWeight: 600,
          fontSize: 30,
          textAlign: "center",
          color: "rgb(199, 99, 99)",
        }}
      >
        Register
      </Text>
      <View style={formStyles.inputs}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TextInput
          style={formStyles.input}
          placeholder="Username"
          onChangeText={setUsername}
          value={username}
          autoCapitalize="none"
          onSubmitEditing={handleRegister}
          editable={!loading}
          placeholderTextColor={"lightgray"}
        />
        <TextInput
          style={formStyles.input}
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          onSubmitEditing={handleRegister}
          editable={!loading}
          placeholderTextColor={"lightgray"}
          keyboardType="email-address"
        />
        <TextInput
          style={formStyles.input}
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          autoCapitalize="none"
          onSubmitEditing={handleRegister}
          editable={!loading}
          placeholderTextColor={"lightgray"}
        />
      </View>
      <View style={formStyles.buttons}>
        <TouchableOpacity
          style={[
            styles.button,
            loading ? styles.buttonDisabled : null,
            formStyles.button,
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Register</Text>
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
          onPress={() => router.back()}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text style={styles.buttonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;
