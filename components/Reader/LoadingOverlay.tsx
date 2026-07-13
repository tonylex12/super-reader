import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

interface LoadingOverlayProps {
  visible: boolean;
}

export const LoadingOverlay = React.memo(({ visible }: LoadingOverlayProps) => {
  if (!visible) return null;
  return (
    <View className="absolute inset-0 items-center justify-center bg-black/95 z-10 px-6">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="mt-3 text-sm font-semibold text-white">Cargando documento...</Text>
    </View>
  );
});
