import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DASHBOARD_THEME_COLORS, DashboardThemeType, RecentFile } from "./types";

interface RecentFileCardProps {
  file: RecentFile;
  colors: typeof DASHBOARD_THEME_COLORS[DashboardThemeType];
  onOpen: () => void;
}

export const RecentFileCard = React.memo(({
  file,
  colors,
  onOpen,
}: RecentFileCardProps) => {
  const progress = file.totalPages > 0 ? (file.page / file.totalPages) * 100 : 0;
  
  return (
    <TouchableOpacity
      onPress={onOpen}
      activeOpacity={0.7}
      style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
      className="mb-4 flex-row items-center rounded-2xl border p-4"
    >
      <View className="mr-4 rounded-xl bg-blue-100/10 p-3">
        <Feather name="file-text" size={24} color={colors.iconColor} />
      </View>
      <View className="flex-1">
        <Text
          numberOfLines={1}
          style={{ color: colors.text }}
          className="font-semibold text-base"
        >
          {file.name}
        </Text>
        <Text style={{ color: colors.textMuted }} className="mt-1 text-xs">
          Página {file.page} de {file.totalPages} (Abierto el {new Date(file.lastOpened).toLocaleDateString()})
        </Text>
        {/* Barra de progreso de lectura */}
        <View className="mt-3 h-1.5 w-full rounded-full bg-slate-200/20 overflow-hidden">
          <View
            style={{ width: `${progress}%`, backgroundColor: colors.accent }}
            className="h-full rounded-full"
          />
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={colors.iconColor} className="ml-2" />
    </TouchableOpacity>
  );
});
