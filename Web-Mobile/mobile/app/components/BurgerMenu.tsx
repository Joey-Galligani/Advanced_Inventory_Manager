import React, { useEffect, useRef } from "react";
import {
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const BurgerMenu = ({
  visible,
  onClose,
  handleLogout,
}: {
  visible: boolean;
  onClose: () => void;
  handleLogout: () => void;
}) => {
  const translateX = useRef(new Animated.Value(250)).current;

  const showMenu = () => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideMenu = (callback?: () => void) => {
    Animated.timing(translateX, {
      toValue: 250,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      if (callback) callback(); // Close the modal after animation completes
    });
  };

  useEffect(() => {
    if (visible) {
      showMenu();
    }
  }, [visible]);

  const handleClose = () => {
    hideMenu(onClose);
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableOpacity
        style={styles.menuOverlay}
        onPress={handleClose}
        activeOpacity={1}
      >
        <Animated.View
          style={[styles.menuContainer, { transform: [{ translateX }] }]}
        >
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              handleClose();
              router.push("/profile");
            }}
          >
            <Ionicons name="person" size={24} color={"rgba(34, 17, 17, 0.2)"} />
            <Text style={styles.menuText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              handleClose();
              router.push("/invoices");
            }}
          >
            <Ionicons name="receipt" size={24} color={"rgba(34, 17, 17, 0.2)"} />
            <Text style={styles.menuText}>Past Invoices</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              handleClose();
              router.push("/rateProducts");
            }}
          >
            <Ionicons name="star" size={24} color={"rgba(34, 17, 17, 0.2)"} />
            <Text style={styles.menuText}>Rate products</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              handleClose();
              handleLogout();
            }}
          >
            <Ionicons name="log-out" size={24} color={"rgba(34, 17, 17, 0.2)"} />
            <Text style={styles.menuText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 80,
  },
  menuContainer: {
    backgroundColor: "white",
    width: 250,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
    marginLeft: "auto",
  },
  menuItem: {
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    borderBottomColor: "rgba(0,0,0,.1)",
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 18,
    color: "rgb(34, 17, 17)",
  },
});

export default BurgerMenu;
