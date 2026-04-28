import { TouchableOpacityProps, ViewStyle } from "react-native";

export interface ButtonProps extends TouchableOpacityProps {
  style?: ViewStyle;
  onPress?: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

export type Detection = {
  id: string;
  image_url: string;
  confidence: number;
  detected_at: string;
  disease: {
    id: string;
    name: string;
    description: string;
    treatment: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    plant: {
      id: string;
      name: string;
    };
  };
};

export type Disease = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  treatment: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  plant: {
    id: string;
    name: string;
    description: string;
  };
};
