import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { styles } from "../styles/homeStyles";
import modalStyles from "../styles/modalStyles";

const PayPalModal = ({
  visible,
  loading,
  onClose,
  pay,
}: {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  pay: () => void;
}) => {
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal transparent visible={visible}>
      <TouchableOpacity
        style={modalStyles.modalOverlay}
        onPress={() => handleClose()}
      >
        <View style={{ ...modalStyles.modalContent }}>
          <Text style={{ fontSize: 20, fontWeight: 500 }}>
            Complete Your Payment
          </Text>
          <TouchableOpacity
            onPress={() => pay()}
            style={[
              { ...styles.button, width: "100%" },
              loading && styles.buttonDisabled,
            ]}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Pay with Paypal</Text>
            {loading ? <ActivityIndicator color="white" /> : null}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleClose()}
            style={[
              { ...styles.button, width: "100%" },
              loading && styles.buttonDisabled,
            ]}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default PayPalModal;
