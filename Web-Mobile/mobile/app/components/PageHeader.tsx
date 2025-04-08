import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const PageHeader = ({ title }: { title: string }): JSX.Element => {
  return (
    <View style={profileStyles.header}>
      <TouchableOpacity onPress={() => router.back()} hitSlop={20}>
        <Ionicons name="arrow-back" size={25} color="black" />
      </TouchableOpacity>
      <Text style={profileStyles.title}>{title}</Text>
      <View style={{ width: 25 }} />
    </View>
  );
};

const profileStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "rgba(0,0,0,.1)",
    borderBottomWidth: 1,
    paddingBottom: 20,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
  },
});

export default PageHeader;
