import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { THEME_COLORS, ThemeType } from "./types";

interface SettingsModalProps {
  visible: boolean;
  viewMode: "original" | "text";
  fontSize: number;
  scrollDirection: "vertical" | "horizontal";
  theme: ThemeType;
  colors: typeof THEME_COLORS[ThemeType];
  onClose: () => void;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  setScrollDirection: React.Dispatch<React.SetStateAction<"vertical" | "horizontal">>;
  onThemeChange: (theme: ThemeType) => void;
}

export const SettingsModal = React.memo(({
  visible,
  viewMode,
  fontSize,
  scrollDirection,
  theme,
  colors,
  onClose,
  setFontSize,
  setScrollDirection,
  onThemeChange,
}: SettingsModalProps) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-end bg-black/40">
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1" />

      <View style={{ backgroundColor: colors.sheetBg }} className="rounded-t-3xl p-6">
        <View className="flex-row items-center justify-between mb-6">
          <Text style={{ color: colors.text }} className="font-bold text-lg">
            Ajustes de Lectura
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{ backgroundColor: colors.buttonBg }}
            className="p-1.5 rounded-full"
          >
            <Feather name="x" size={18} color={colors.iconColor} />
          </TouchableOpacity>
        </View>

        {viewMode === "text" && (
          <View className="mb-6">
            <Text style={{ color: colors.textMuted }} className="text-sm font-semibold mb-3">
              Tamaño de Letra ({fontSize}px)
            </Text>
            <View className="flex-row items-center justify-between bg-slate-200/10 rounded-2xl p-2">
              <TouchableOpacity
                onPress={() => setFontSize(prev => Math.max(12, prev - 2))}
                style={{ backgroundColor: colors.buttonBg }}
                className="h-11 flex-1 items-center justify-center rounded-xl"
              >
                <Feather name="minus" size={18} color={colors.iconColor} />
              </TouchableOpacity>
              <Text style={{ color: colors.text }} className="mx-6 font-bold text-base">{fontSize}</Text>
              <TouchableOpacity
                onPress={() => setFontSize(prev => Math.min(32, prev + 2))}
                style={{ backgroundColor: colors.buttonBg }}
                className="h-11 flex-1 items-center justify-center rounded-xl"
              >
                <Feather name="plus" size={18} color={colors.iconColor} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="mb-6">
          <Text style={{ color: colors.textMuted }} className="text-sm font-semibold mb-3">
            Dirección de Desplazamiento
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setScrollDirection("vertical")}
              style={{ backgroundColor: scrollDirection === "vertical" ? colors.accent : colors.buttonBg, borderColor: scrollDirection === "vertical" ? "transparent" : "rgba(255,255,255,0.05)" }}
              className="flex-1 flex-row items-center justify-center rounded-2xl py-3 px-4 border"
            >
              <Feather
                name="arrow-down"
                size={16}
                color={scrollDirection === "vertical" ? "#FFFFFF" : colors.iconColor}
                className="mr-2"
              />
              <Text style={{ color: scrollDirection === "vertical" ? "#FFFFFF" : colors.text }} className="font-semibold text-sm">
                Vertical
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setScrollDirection("horizontal")}
              style={{ backgroundColor: scrollDirection === "horizontal" ? colors.accent : colors.buttonBg, borderColor: scrollDirection === "horizontal" ? "transparent" : "rgba(255,255,255,0.05)" }}
              className="flex-1 flex-row items-center justify-center rounded-2xl py-3 px-4 border"
            >
              <Feather
                name="arrow-right"
                size={16}
                color={scrollDirection === "horizontal" ? "#FFFFFF" : colors.iconColor}
                className="mr-2"
              />
              <Text style={{ color: scrollDirection === "horizontal" ? "#FFFFFF" : colors.text }} className="font-semibold text-sm">
                Horizontal
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-6">
          <Text style={{ color: colors.textMuted }} className="text-sm font-semibold mb-3">
            Tema Visual
          </Text>
          <View className="flex-row justify-between bg-slate-200/10 rounded-2xl p-3">
            {(["light", "dark", "sepia", "forest"] as const).map((t) => {
              const label = {
                light: "Claro",
                dark: "Oscuro",
                sepia: "Sepia",
                forest: "Bosque",
              }[t];
              
              const activeBorderColor = theme === t ? "#3B82F6" : "rgba(255,255,255,0.05)";
              const colorCircle = {
                light: "bg-white",
                dark: "bg-neutral-950",
                sepia: "bg-[#F4ECD8]",
                forest: "bg-[#14241C]",
              }[t];

              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => onThemeChange(t)}
                  style={{ borderColor: activeBorderColor }}
                  className="items-center justify-center rounded-xl p-2 border"
                >
                  <View className={`h-8 w-8 rounded-full border border-slate-200/20 mb-1 ${colorCircle}`} />
                  <Text style={{ color: colors.text }} className="text-xs font-semibold">
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  </Modal>
));
