import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/homeStyles";
import modalStyles from "../styles/modalStyles";

const ClearConfirmationModal = ({
  text,
  visible,
  onClose,
  onConfirm,
}: {
  text: string;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={modalStyles.modalOverlay}>
      <View style={modalStyles.modalContent}>
        <Text style={{ fontSize: 16 }}>{text}</Text>
        <View style={modalStyles.modalActions}>
          <TouchableOpacity
            onPress={() => {
              onConfirm();
            }}
            style={{ ...styles.button }}
          >
            <Ionicons name="trash" size={20} color="white" />
            <Text style={styles.buttonText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.button, styles.secondaryButton]}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default ClearConfirmationModal;
