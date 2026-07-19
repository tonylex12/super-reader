import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { THEME_COLORS, ThemeType } from "../Reader/types";

interface ReadingNoteModalProps {
  visible: boolean;
  pdfName: string;
  page: number;
  theme: ThemeType;
  onClose: () => void;
  onSave: (text: string) => void;
}

export const ReadingNoteModal = React.memo(({
  visible,
  pdfName,
  page,
  theme,
  onClose,
  onSave,
}: ReadingNoteModalProps) => {
  const [noteText, setNoteText] = useState("");
  const colors = THEME_COLORS[theme];
  const insets = useSafeAreaInsets();

  const handleSave = () => {
    if (noteText.trim()) {
      onSave(noteText.trim());
      setNoteText("");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <View style={styles.overlay}>
          {/* Backdrop para cerrar (si el usuario pulsa fuera) */}
          <TouchableOpacity activeOpacity={1} onPress={onClose} style={StyleSheet.absoluteFill} />

          {/* Tarjeta de notas flotante */}
          <View 
            style={{ 
              backgroundColor: colors.sheetBg, 
              borderColor: colors.border,
              paddingBottom: Math.max(insets.bottom + 20, 28), // Solución al Error 1: evitar superposición con navbar del dispositivo
            }} 
            className="w-full max-w-md rounded-t-3xl border-t border-x p-6 shadow-2xl"
          >
            {/* Cabecera del Modal */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Feather name="edit-3" size={20} color={colors.accent} className="mr-2" />
                <Text style={{ color: colors.text }} className="font-bold text-lg">
                  Reflexión de Lectura
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{ backgroundColor: colors.buttonBg }}
                className="p-1.5 rounded-full"
              >
                <Feather name="x" size={18} color={colors.iconColor} />
              </TouchableOpacity>
            </View>

            {/* Información del Contexto de Lectura */}
            <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.02)', borderColor: colors.border }} className="rounded-xl border p-3 mb-4">
              <Text numberOfLines={1} style={{ color: colors.text }} className="font-semibold text-xs mb-1">
                Documento: {pdfName}
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-[10px]">
                Completado en Página: {page}
              </Text>
            </View>

            {/* Caja de Texto Multilínea */}
            <TextInput
              multiline={true}
              numberOfLines={5}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="¿Qué aprendiste en esta sesión de lectura? Escribe aquí tus notas, reflexiones o ideas principales..."
              placeholderTextColor={colors.textMuted}
              autoFocus={true}
              style={{
                color: colors.text,
                borderColor: colors.border,
                borderWidth: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.01)',
                fontSize: 14,
                padding: 16,
                borderRadius: 16,
                height: 110,
                textAlignVertical: "top",
                marginBottom: 20,
              }}
            />

            {/* Botones de acción */}
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
                onPress={handleSave}
                disabled={!noteText.trim()}
                style={{ backgroundColor: colors.accent, opacity: noteText.trim() ? 1 : 0.5 }}
                className="flex-1 rounded-2xl py-3 items-center"
              >
                <Text className="text-white font-semibold text-sm">
                  Guardar Nota
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
});
