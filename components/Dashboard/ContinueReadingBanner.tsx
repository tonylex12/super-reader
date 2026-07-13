import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DASHBOARD_THEME_COLORS, DashboardThemeType, RecentFile } from "./types";

interface ContinueReadingBannerProps {
  file: RecentFile;
  colors: typeof DASHBOARD_THEME_COLORS[DashboardThemeType];
  onResume: () => void;
}

export const ContinueReadingBanner = React.memo(({
  file,
  colors,
  onResume,
}: ContinueReadingBannerProps) => (
  <TouchableOpacity
    onPress={onResume}
    activeOpacity={0.8}
    style={{ backgroundColor: colors.accent }}
    className="rounded-2xl p-4 mb-5 flex-row items-center justify-between shadow-md shadow-blue-500/20"
  >
    <View className="flex-1 mr-4">
      <Text className="text-white/70 text-[10px] font-bold uppercase tracking-wider mb-0.5">
        Continuar leyendo
      </Text>
      <Text numberOfLines={1} className="text-white font-bold text-base mb-0.5">
        {file.name}
      </Text>
      <Text className="text-white/90 text-xs">
        Pág. {file.page} de {file.totalPages}
      </Text>
    </View>
    <View className="bg-white/20 p-2 rounded-xl">
      <Feather name="arrow-right" size={20} color="#FFFFFF" />
    </View>
  </TouchableOpacity>
));
