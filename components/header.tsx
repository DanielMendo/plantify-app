import { StyleSheet, Text, View } from "react-native";

const Header = ({ tab }: { tab: string }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{tab}</Text>
    </View>
  );
};
export default Header;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingVertical: 10,
  },

  text: {
    fontSize: 32,
    fontWeight: "900",
    color: "#166534",
    marginBottom: 10,
  },
});
