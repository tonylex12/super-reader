import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DASHBOARD_THEME_COLORS, DashboardThemeType } from "./types";

interface DashboardHeaderProps {
  theme: DashboardThemeType;
  colors: typeof DASHBOARD_THEME_COLORS[DashboardThemeType];
  insets: { top: number };
  onToggleTheme: (theme: DashboardThemeType) => void;
}

export const DashboardHeader = React.memo(({
  theme,
  colors,
  insets,
  onToggleTheme,
}: DashboardHeaderProps) => (
  <View style={{ borderColor: colors.headerBorder, paddingTop: Math.max(insets.top, 16) }} className="border-b px-6 pb-4 flex-row items-center justify-between">
    <View className="flex-row items-center">
      <Feather name="book-open" size={28} color={colors.iconColor} className="mr-3" />
      <Text style={{ color: colors.text }} className="font-bold text-2xl tracking-tight">
        SuperReader
      </Text>
    </View>
    
    {/* Selector rápido de temas */}
    <View className="flex-row rounded-full bg-slate-200/10 p-1">
      {(["light", "dark", "sepia", "forest"] as const).map((t) => (
        <TouchableOpacity
          key={t}
          onPress={() => onToggleTheme(t)}
          style={{ backgroundColor: theme === t ? 'rgba(255,255,255,0.15)' : 'transparent' }}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <Feather
            name={
              t === "light"
                ? "sun"
                : t === "dark"
                ? "moon"
                : t === "sepia"
                ? "coffee"
                : "eye"
            }
            size={16}
            color={theme === t ? colors.iconColor : "#94A3B8"}
          />
        </TouchableOpacity>
      ))}
    </View>
  </View>
));
