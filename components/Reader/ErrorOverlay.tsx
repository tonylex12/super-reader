import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ErrorOverlayProps {
  errorMsg: string | null;
  onBack: () => void;
}

export const ErrorOverlay = React.memo(({ errorMsg, onBack }: ErrorOverlayProps) => {
  if (!errorMsg) return null;
  return (
    <View className="absolute inset-0 items-center justify-center p-6 bg-red-100/10 z-20">
      <Feather name="alert-triangle" size={40} color="#EF4444" />
      <Text className="mt-4 text-center font-semibold text-red-500">{errorMsg}</Text>
      <TouchableOpacity
        onPress={onBack}
        className="mt-6 rounded-xl bg-red-500 py-3 px-6"
      >
        <Text className="text-white font-semibold">Regresar</Text>
      </TouchableOpacity>
    </View>
  );
});
