import { Button, Text, View } from "react-native";
import styles from "../styles/homeStyles";

const PermissionRequest = ({ requestPermission }: any) => (
  <View style={styles.container}>
    <Text style={styles.resultText}>
      We need your permission to show the camera
    </Text>
    <Button onPress={requestPermission} title="Grant Permission" />
  </View>
);

export default PermissionRequest;
