import Loading from "@/components/loading";
import { colors } from "@/constants/theme";
import { ButtonProps } from "@/types";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const Button = ({ style, onPress, children, loading = false }: ButtonProps) => {
  if (loading) {
    return (
      <View style={[styles.button, style, { backgroundColor: "transparent" }]}>
        <Loading />
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      {children}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 100,
    borderCurve: "continuous",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
});
