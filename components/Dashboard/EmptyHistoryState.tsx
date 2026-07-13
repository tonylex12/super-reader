import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DASHBOARD_THEME_COLORS, DashboardThemeType } from "./types";

interface EmptyHistoryStateProps {
  colors: typeof DASHBOARD_THEME_COLORS[DashboardThemeType];
}

export const EmptyHistoryState = React.memo(({
  colors,
}: EmptyHistoryStateProps) => (
  <View style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }} className="rounded-3xl border border-dashed p-10 items-center justify-center">
    <Feather name="file-text" size={48} color={colors.iconColor} className="opacity-40 mb-4" />
    <Text style={{ color: colors.text }} className="font-semibold text-sm">
      No hay archivos recientes
    </Text>
    <Text style={{ color: colors.textMuted }} className="mt-1 text-center text-xs">
      Toca en "Cargar archivo PDF" para empezar a leer.
    </Text>
  </View>
));
