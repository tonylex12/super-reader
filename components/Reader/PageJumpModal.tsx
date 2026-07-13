import React from "react";
import { View, Text, TouchableOpacity, Modal, TextInput } from "react-native";
import { THEME_COLORS, ThemeType } from "./types";

interface PageJumpModalProps {
  visible: boolean;
  currentPage: number;
  totalPages: number;
  inputPage: string;
  colors: typeof THEME_COLORS[ThemeType];
  setInputPage: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const PageJumpModal = React.memo(({
  visible,
  currentPage,
  totalPages,
  inputPage,
  colors,
  setInputPage,
  onClose,
  onConfirm,
}: PageJumpModalProps) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-center items-center bg-black/60 px-6">
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="absolute inset-0" />

      <View style={{ backgroundColor: colors.sheetBg, borderColor: colors.border }} className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl relative z-10">
        <Text style={{ color: colors.text }} className="font-bold text-lg text-center mb-4">
          Ir a la página
        </Text>
        
        <View className="flex-row items-center justify-center mb-6">
          <TextInput
            keyboardType="number-pad"
            value={inputPage}
            onChangeText={setInputPage}
            placeholder={`${currentPage}`}
            placeholderTextColor={colors.textMuted}
            autoFocus={true}
            selectTextOnFocus={true}
            style={{
              color: colors.text,
              backgroundColor: 'rgba(0, 0, 0, 0.03)',
              borderColor: colors.border,
              borderWidth: 1,
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              borderRadius: 16,
              width: 100,
              height: 50,
            }}
          />
          <Text style={{ color: colors.textMuted }} className="ml-3 text-base">
            de {totalPages}
          </Text>
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onClose}
            style={{ backgroundColor: colors.buttonBg }}
            className="flex-1 rounded-2xl py-3 items-center"
          >
            <Text style={{ color: colors.text }} className="font-semibold text-sm">
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onConfirm}
            style={{ backgroundColor: colors.accent }}
            className="flex-1 rounded-2xl py-3 items-center"
          >
            <Text className="text-white font-semibold text-sm">
              Ir
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
));
