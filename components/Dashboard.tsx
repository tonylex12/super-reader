import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Tipado de archivos recientes
export interface RecentFile {
  uri: string;
  name: string;
  lastOpened: string;
  page: number;
  totalPages: number;
}

interface DashboardProps {
  recentFiles: RecentFile[];
  theme: "light" | "dark" | "sepia" | "forest";
  onSelectFile: (uri: string, name: string) => void;
  onPickNewFile: () => void;
  onClearHistory: () => void;
  onToggleTheme: (theme: "light" | "dark" | "sepia" | "forest") => void;
}

export default function Dashboard({
  recentFiles,
  theme,
  onSelectFile,
  onPickNewFile,
  onClearHistory,
  onToggleTheme,
}: DashboardProps) {
  const insets = useSafeAreaInsets();
  
  // Estilos de colores en crudo (hex) para evitar bugs de NativeWind v4 al inyectar clases dinámicas
  const colors = {
    light: {
      bg: "#F8FAFC",          // slate-50
      cardBg: "#FFFFFF",      // white
      cardBorder: "#E2E8F0",  // slate-200
      text: "#1E293B",        // slate-800
      textMuted: "#64748B",   // slate-500
      accent: "#2563EB",      // blue-600
      iconColor: "#475569",   // slate-600
      headerBorder: "#E2E8F0" // slate-200
    },
    dark: {
      bg: "#0A0A0A",          // neutral-950
      cardBg: "#171717",      // neutral-900
      cardBorder: "#262626",  // neutral-800
      text: "#E2E8F0",        // neutral-200
      textMuted: "#737373",   // neutral-500
      accent: "#2563EB",      // blue-600
      iconColor: "#A3A3A3",   // neutral-400
      headerBorder: "#262626" // neutral-800
    },
    sepia: {
      bg: "#F4ECD8",          // sepia-bg
      cardBg: "#ECE2C8",      // sepia card
      cardBorder: "#DCD0B4",  // sepia border
      text: "#4A3728",        // sepia text
      textMuted: "#7A6250",   // sepia muted
      accent: "#8B6B4F",      // sepia accent
      iconColor: "#4A3728",   // sepia icon
      headerBorder: "#DCD0B4" // sepia border
    },
    forest: {
      bg: "#14241C",          // forest-bg
      cardBg: "#0E1B15",      // forest card
      cardBorder: "#1C362A",  // forest border
      text: "#E6EFE9",        // forest text
      textMuted: "#9CB3A6",   // forest muted
      accent: "#2D5A43",      // forest accent
      iconColor: "#E6EFE9",   // forest icon
      headerBorder: "#1C362A" // forest border
    },
  }[theme];

  // Renderizado de las tarjetas del historial
  const renderRecentCard = (item: RecentFile) => {
    const progress = item.totalPages > 0 ? (item.page / item.totalPages) * 100 : 0;
    
    return (
      <TouchableOpacity
        key={item.uri}
        onPress={() => onSelectFile(item.uri, item.name)}
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
            {item.name}
          </Text>
          <Text style={{ color: colors.textMuted }} className="mt-1 text-xs">
            Página {item.page} de {item.totalPages} (Abierto el {new Date(item.lastOpened).toLocaleDateString()})
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
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Cabecera */}
      <View style={{ borderColor: colors.headerBorder, paddingTop: Math.max(insets.top, 16) }} className="border-b px-6 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Feather name="book-open" size={28} color={colors.iconColor} className="mr-3" />
          <Text style={{ color: colors.text }} className="font-bold text-2xl tracking-tight">
            SuperReader
          </Text>
        </View>
        
        {/* Selector de temas rápido */}
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

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: Math.max(insets.bottom + 24, 24) }} className="flex-1">
        {/* Banner de bienvenida / Carga principal */}
        <View style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }} className="rounded-3xl border p-6 mb-8 items-center">
          <Text style={{ color: colors.text }} className="text-center font-semibold text-lg">
            Lector de PDFs Cómodo
          </Text>
          <Text style={{ color: colors.textMuted }} className="mt-2 text-center text-sm px-4">
            Carga tus archivos PDF locales. Podrás cambiar el tamaño de letra y usar colores relajantes para leer sin cansar tu vista.
          </Text>
          
          <TouchableOpacity
            onPress={onPickNewFile}
            activeOpacity={0.8}
            style={{ backgroundColor: colors.accent }}
            className="mt-6 w-full flex-row items-center justify-center rounded-2xl py-4 px-6"
          >
            <Feather name="folder" size={20} color="#FFFFFF" className="mr-3" />
            <Text className="font-semibold text-white text-base">
              Cargar archivo PDF
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sección de Historial */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-4">
            <Text style={{ color: colors.text }} className="font-bold text-lg">
              Leídos Recientemente
            </Text>
            {recentFiles.length > 0 && (
              <TouchableOpacity
                onPress={onClearHistory}
                className="flex-row items-center"
              >
                <Feather name="trash-2" size={14} color="#EF4444" className="mr-1" />
                <Text className="text-red-500 text-xs font-semibold">
                  Limpiar historial
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {recentFiles.length === 0 ? (
            /* Estado vacío */
            <View style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }} className="rounded-3xl border border-dashed p-10 items-center justify-center">
              <Feather name="file-text" size={48} color={colors.iconColor} className="opacity-40 mb-4" />
              <Text style={{ color: colors.text }} className="font-semibold text-sm">
                No hay archivos recientes
              </Text>
              <Text style={{ color: colors.textMuted }} className="mt-1 text-center text-xs">
                Toca en "Cargar archivo PDF" para empezar a leer.
              </Text>
            </View>
          ) : (
            /* Lista - Usamos map simple en lugar de FlatList anidado en ScrollView para evitar advertencias de VirtualizedList y loops de diseño */
            <View>
              {recentFiles.map((file) => renderRecentCard(file))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
