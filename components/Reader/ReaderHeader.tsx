import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { THEME_COLORS, ThemeType } from "./types";

interface ReaderHeaderProps {
  pdfName: string;
  viewMode: "original" | "text";
  colors: typeof THEME_COLORS[ThemeType];
  insets: { top: number };
  onBack: () => void;
  onToggleViewMode: () => void;
  onOpenSettings: () => void;
}

export const ReaderHeader = React.memo(({
  pdfName,
  viewMode,
  colors,
  insets,
  onBack,
  onToggleViewMode,
  onOpenSettings,
}: ReaderHeaderProps) => (
  <View style={{ backgroundColor: colors.headerBg, borderColor: colors.headerBorder, paddingTop: Math.max(insets.top, 16) }} className="border-b px-4 pb-4 flex-row items-center justify-between">
    <TouchableOpacity onPress={onBack} className="p-2 rounded-full">
      <Feather name="chevron-left" size={24} color={colors.iconColor} />
    </TouchableOpacity>
    
    <View className="flex-1 mx-2">
      <Text numberOfLines={1} style={{ color: colors.text }} className="font-semibold text-center text-sm">
        {pdfName}
      </Text>
    </View>

    <View className="flex-row items-center">
      <TouchableOpacity
        onPress={onToggleViewMode}
        style={{ backgroundColor: viewMode === "text" ? colors.accent : colors.buttonBg }}
        className="p-2 rounded-xl mr-1"
      >
        <Feather
          name={viewMode === "text" ? "file-text" : "book-open"}
          size={20}
          color={viewMode === "text" ? "#FFFFFF" : colors.iconColor}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onOpenSettings}
        style={{ backgroundColor: colors.buttonBg }}
        className="p-2 rounded-xl"
      >
        <Feather name="sliders" size={20} color={colors.iconColor} />
      </TouchableOpacity>
    </View>
  </View>
));
