import { Text, StyleSheet, View, TouchableOpacity, Modal } from "react-native";
import { useUserStore } from "./services/useUserStore";
import { deleteAccount } from "./services/api";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import styles from "./styles/homeStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import ClearConfirmationModal from "./components/ClearConfirmation";
import PageHeader from "./components/PageHeader";

const ProfileScreen = () => {
  const { user } = useUserStore();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  if (!user) {
    router.replace("/login");
    return null;
  }

  const handleDelete = async () => {
    const deleteResponse = await deleteAccount();

    deleteResponse.fold(
      () => {
        Toast.show({
          type: "success",
          text1: "Accounted deleted",
          text2: "Redirecting to login...",
        });
        setTimeout(() => {
          router.dismissTo("/login");
        }, 1000);
      },
      (error) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.error,
        });
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Profile" />
      <View style={profileStyles.main}>
        <View style={profileStyles.info}>
          <View>
            <Text>Username: {user?.username}</Text>
            <Text>Email: {user?.email}</Text>
            <Text>Role: {user?.role}</Text>
          </View>
          <Text>
            Member since the{" "}
            <Text style={{ fontWeight: 800 }}>
              {new Date(user?.since).toLocaleDateString()}
            </Text>
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={{ ...styles.button }}
            onPress={() => router.back()}
          >
            <Ionicons name="home" size={20} color="white" />
            <Text style={styles.buttonText}>Back home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setShowDeleteConfirmation(true)}
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.buttonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
      <ClearConfirmationModal
        text={"Your account will be deleted permanently, are you sure?"}
        onConfirm={handleDelete}
        onClose={() => setShowDeleteConfirmation(false)}
        visible={showDeleteConfirmation}
      />
    </SafeAreaView>
  );
};

const profileStyles = StyleSheet.create({
  main: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  info: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    boxShadow: "0 0 10px rgba(0,0,0,.1)",
    marginBottom: 20,
    gap: 5,
  },
});

export default ProfileScreen;
