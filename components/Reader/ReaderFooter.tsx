import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { THEME_COLORS, ThemeType } from "./types";

interface ReaderFooterProps {
  currentPage: number;
  totalPages: number;
  colors: typeof THEME_COLORS[ThemeType];
  insets: { bottom: number };
  onPrevPage: () => void;
  onNextPage: () => void;
  onOpenPageJump: () => void;
}

export const ReaderFooter = React.memo(({
  currentPage,
  totalPages,
  colors,
  insets,
  onPrevPage,
  onNextPage,
  onOpenPageJump,
}: ReaderFooterProps) => (
  <View style={{ backgroundColor: colors.headerBg, borderColor: colors.headerBorder, paddingBottom: Math.max(insets.bottom, 16) }} className="border-t px-6 pt-4 flex-row items-center justify-between">
    <TouchableOpacity
      onPress={onPrevPage}
      disabled={currentPage <= 1}
      className={`p-2 rounded-full ${currentPage <= 1 ? "opacity-30" : ""}`}
    >
      <Feather name="chevron-left" size={20} color={colors.iconColor} />
    </TouchableOpacity>

    <TouchableOpacity 
      onPress={onOpenPageJump} 
      style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
      className="px-4 py-2 rounded-xl"
    >
      <Text style={{ color: colors.text }} className="text-xs font-semibold">
        Página {currentPage} de {totalPages}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={onNextPage}
      disabled={currentPage >= totalPages}
      className={`p-2 rounded-full ${currentPage >= totalPages ? "opacity-30" : ""}`}
    >
      <Feather name="chevron-right" size={20} color={colors.iconColor} />
    </TouchableOpacity>
  </View>
));
