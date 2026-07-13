import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

// ==========================================
// TIPOS Y CONTROLADOR GLOBAL (SINGLETON)
// ==========================================

export interface CustomAlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

export interface CustomAlertConfig {
  title: string;
  message: string;
  buttons?: CustomAlertButton[];
}

type AlertListener = (config: CustomAlertConfig) => void;

class CustomAlertController {
  private listener: AlertListener | null = null;

  register(listener: AlertListener) {
    this.listener = listener;
  }

  unregister() {
    this.listener = null;
  }

  alert(title: string, message: string, buttons?: CustomAlertButton[]) {
    if (this.listener) {
      this.listener({ title, message, buttons });
    } else {
      console.warn("[CustomAlert] No listener registered. Alert shown in console:", title, message);
    }
  }
}

export const CustomAlert = new CustomAlertController();

// ==========================================
// COLORES DE TEMA PERSONALIZADOS
// ==========================================

const THEME_COLORS = {
  light: {
    bg: "#FFFFFF",
    text: "#1E293B",
    textMuted: "#64748B",
    border: "#E2E8F0",
    buttonDefaultBg: "#2563EB",
    buttonDefaultText: "#FFFFFF",
    buttonCancelBg: "#F1F5F9",
    buttonCancelText: "#475569",
    buttonDestructiveBg: "#EF4444",
    buttonDestructiveText: "#FFFFFF",
    iconColor: "#3B82F6",
  },
  dark: {
    bg: "#171717",
    text: "#E2E8F0",
    textMuted: "#A3A3A3",
    border: "#262626",
    buttonDefaultBg: "#2563EB",
    buttonDefaultText: "#FFFFFF",
    buttonCancelBg: "#262626",
    buttonCancelText: "#D4D4D4",
    buttonDestructiveBg: "#EF4444",
    buttonDestructiveText: "#FFFFFF",
    iconColor: "#3B82F6",
  },
  sepia: {
    bg: "#ECE2C8",
    text: "#4A3728",
    textMuted: "#7A6250",
    border: "#DCD0B4",
    buttonDefaultBg: "#8B6B4F",
    buttonDefaultText: "#FFFFFF",
    buttonCancelBg: "#F4ECD8",
    buttonCancelText: "#4A3728",
    buttonDestructiveBg: "#C2410C",
    buttonDestructiveText: "#FFFFFF",
    iconColor: "#8B6B4F",
  },
  forest: {
    bg: "#0E1B15",
    text: "#E6EFE9",
    textMuted: "#9CB3A6",
    border: "#1C362A",
    buttonDefaultBg: "#2D5A43",
    buttonDefaultText: "#FFFFFF",
    buttonCancelBg: "#14241C",
    buttonCancelText: "#E6EFE9",
    buttonDestructiveBg: "#DC2626",
    buttonDestructiveText: "#FFFFFF",
    iconColor: "#2D5A43",
  },
} as const;

type ThemeType = keyof typeof THEME_COLORS;

// ==========================================
// COMPONENTE DE INTERFAZ GRÁFICA (MODAL)
// ==========================================

interface CustomAlertModalProps {
  theme: ThemeType;
}

export const CustomAlertModal = React.memo(({ theme }: CustomAlertModalProps) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<CustomAlertConfig | null>(null);

  const colors = THEME_COLORS[theme];

  useEffect(() => {
    const handleNewAlert = (alertConfig: CustomAlertConfig) => {
      setConfig(alertConfig);
      setVisible(true);
    };

    CustomAlert.register(handleNewAlert);

    return () => {
      CustomAlert.unregister();
    };
  }, []);

  if (!visible || !config) return null;

  const { title, message, buttons } = config;

  // Si no se especifican botones, mostrar botón "OK" por defecto
  const resolvedButtons: CustomAlertButton[] = buttons && buttons.length > 0 
    ? buttons 
    : [{ text: "Aceptar", style: "default" }];

  const handleButtonPress = (btn: CustomAlertButton) => {
    setVisible(false);
    if (btn.onPress) {
      btn.onPress();
    }
  };

  // Elegir icono dependiendo del contexto o título del alert
  const getIconName = () => {
    const lowerTitle = title.toLowerCase();
    const lowerMessage = message.toLowerCase();
    if (lowerTitle.includes("error") || lowerMessage.includes("error") || lowerTitle.includes("falló")) {
      return "alert-octagon";
    }
    if (lowerTitle.includes("limpiar") || lowerTitle.includes("borrar") || lowerTitle.includes("eliminar")) {
      return "trash-2";
    }
    if (lowerTitle.includes("pomodoro") || lowerTitle.includes("descanso") || lowerTitle.includes("pausa")) {
      return "clock";
    }
    return "info";
  };

  const iconName = getIconName();

  // Color de icono según tipo
  const getIconColor = () => {
    if (iconName === "alert-octagon" || iconName === "trash-2") return "#EF4444";
    return colors.iconColor;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.overlay}>
        {/* Fondo semi-transparente que cierra al tocar si solo hay un botón de aceptar */}
        {resolvedButtons.length === 1 && (
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setVisible(false)} 
            style={StyleSheet.absoluteFill} 
          />
        )}

        <View style={{ backgroundColor: colors.bg, borderColor: colors.border }} className="w-full max-w-sm rounded-3xl border p-6 shadow-2xl relative z-10 mx-6">
          {/* Icono de Alerta Ilustrativo */}
          <View className="items-center mb-4">
            <View className="bg-slate-200/10 rounded-full p-4 mb-2">
              <Feather name={iconName} size={32} color={getIconColor()} />
            </View>
            <Text style={{ color: colors.text }} className="font-bold text-xl text-center">
              {title}
            </Text>
          </View>

          {/* Mensaje de la Alerta */}
          <Text style={{ color: colors.textMuted }} className="text-center text-sm leading-relaxed mb-6 px-2">
            {message}
          </Text>

          {/* Botones de Acción (Layout en fila si hay 2, en columna si hay más) */}
          <View style={resolvedButtons.length === 2 ? styles.rowButtons : styles.columnButtons}>
            {resolvedButtons.map((btn, index) => {
              // Estilos visuales del botón según su tipo
              let bg: string = colors.buttonDefaultBg;
              let textCol: string = colors.buttonDefaultText;

              if (btn.style === "cancel") {
                bg = colors.buttonCancelBg;
                textCol = colors.buttonCancelText;
              } else if (btn.style === "destructive") {
                bg = colors.buttonDestructiveBg;
                textCol = colors.buttonDestructiveText;
              }

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleButtonPress(btn)}
                  style={{ backgroundColor: bg }}
                  className={`rounded-2xl py-3 px-4 items-center justify-center flex-1 min-h-[48px] ${resolvedButtons.length === 2 ? 'mx-1' : 'w-full mb-2'}`}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: textCol }} className="font-semibold text-sm">
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  rowButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  columnButtons: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
});
