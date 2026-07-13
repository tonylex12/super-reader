import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DASHBOARD_THEME_COLORS, DashboardThemeType } from "./types";

interface WelcomeBannerProps {
  colors: typeof DASHBOARD_THEME_COLORS[DashboardThemeType];
  onPickFile: () => void;
}

export const WelcomeBanner = React.memo(({
  colors,
  onPickFile,
}: WelcomeBannerProps) => (
  <View style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }} className="rounded-3xl border p-6 mb-8 items-center">
    <Text style={{ color: colors.text }} className="text-center font-semibold text-lg">
      Lector de PDFs Cómodo
    </Text>
    <Text style={{ color: colors.textMuted }} className="mt-2 text-center text-sm px-4">
      Carga tus archivos PDF locales. Podrás cambiar el tamaño de letra y usar colores relajantes para leer sin cansar tu vista.
    </Text>
    
    <TouchableOpacity
      onPress={onPickFile}
      activeOpacity={0.8}
      style={{ backgroundColor: colors.accent }}
      className="mt-6 w-full flex-row items-center justify-center rounded-2xl py-4 px-6"
    >
      <Feather name="folder" size={20} color="#FFFFFF" className="mr-3" />
      <Text className="font-semibold text-white text-base">
        Cargar archivo PDF
      </Text>
    </TouchableOpacity>
  </View>
));
