import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DashboardProps, DASHBOARD_THEME_COLORS } from "./types";
import {
  DashboardHeader,
  ContinueReadingBanner,
  WelcomeBanner,
  RecentFileCard,
  EmptyHistoryState
} from "./index";

export default function Dashboard({
  recentFiles,
  theme,
  onSelectFile,
  onPickNewFile,
  onClearHistory,
  onToggleTheme,
}: DashboardProps) {
  const insets = useSafeAreaInsets();
  const colors = DASHBOARD_THEME_COLORS[theme];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* 1. Cabecera (Logotipo y tema rápido) */}
      <DashboardHeader
        theme={theme}
        colors={colors}
        insets={insets}
        onToggleTheme={onToggleTheme}
      />

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: Math.max(insets.bottom + 24, 24) }} className="flex-1">
        {/* 2. Banner de reanudación rápida "Continuar leyendo" */}
        {recentFiles.length > 0 && (
          <ContinueReadingBanner
            file={recentFiles[0]}
            colors={colors}
            onResume={() => onSelectFile(recentFiles[0].uri, recentFiles[0].name)}
          />
        )}

        {/* 3. Banner informativo de bienvenida con botón de carga */}
        <WelcomeBanner
          colors={colors}
          onPickFile={onPickNewFile}
        />

        {/* 4. Sección de Historial */}
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
            <EmptyHistoryState colors={colors} />
          ) : (
            /* Lista de historial (Map simple para evitar bugs de FlatList dentro de ScrollView) */
            <View>
              {recentFiles.map((file) => (
                <RecentFileCard
                  key={file.uri}
                  file={file}
                  colors={colors}
                  onOpen={() => onSelectFile(file.uri, file.name)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
