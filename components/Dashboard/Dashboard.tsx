import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DashboardProps, DASHBOARD_THEME_COLORS } from "./types";
import {
  DashboardHeader,
  ContinueReadingBanner,
  WelcomeBanner,
  RecentFileCard,
  EmptyHistoryState,
  NotesList
} from "./index";

export default function Dashboard({
  recentFiles,
  notes,
  theme,
  onSelectFile,
  onPickNewFile,
  onClearHistory,
  onToggleTheme,
  onDeleteNote,
  onRestoreComplete,
}: DashboardProps) {
  const insets = useSafeAreaInsets();
  const colors = DASHBOARD_THEME_COLORS[theme];
  const [activeTab, setActiveTab] = useState<"history" | "notes">("history");

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* 1. Cabecera (Logotipo y tema rápido) */}
      <DashboardHeader
        theme={theme}
        colors={colors}
        insets={insets}
        onToggleTheme={onToggleTheme}
      />

      {/* 2. Barra de Pestañas (Tabs) */}
      <View style={{ borderColor: colors.cardBorder }} className="flex-row border-b px-6 bg-slate-200/5">
        <TouchableOpacity
          onPress={() => setActiveTab("history")}
          className="flex-1 py-3 items-center"
          style={{ 
            borderBottomWidth: activeTab === "history" ? 3 : 0, 
            borderBottomColor: colors.accent 
          }}
        >
          <Text 
            style={{ color: activeTab === "history" ? colors.text : colors.textMuted }} 
            className="font-bold text-sm"
          >
            Historial
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab("notes")}
          className="flex-1 py-3 items-center"
          style={{ 
            borderBottomWidth: activeTab === "notes" ? 3 : 0, 
            borderBottomColor: colors.accent 
          }}
        >
          <Text 
            style={{ color: activeTab === "notes" ? colors.text : colors.textMuted }} 
            className="font-bold text-sm"
          >
            Mis Notas ({notes.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: Math.max(insets.bottom + 24, 24) }} className="flex-1">
        {activeTab === "history" ? (
          <>
            {/* Banner de reanudación rápida "Continuar leyendo" */}
            {recentFiles.length > 0 && (
              <ContinueReadingBanner
                file={recentFiles[0]}
                colors={colors}
                onResume={() => onSelectFile(recentFiles[0].uri, recentFiles[0].name)}
              />
            )}

            {/* Banner informativo de bienvenida con botón de carga */}
            <WelcomeBanner
              colors={colors}
              onPickFile={onPickNewFile}
            />

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
                <EmptyHistoryState colors={colors} />
              ) : (
                /* Lista de historial */
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
          </>
        ) : (
          /* Pestaña de Notas y Copias de Seguridad */
          <NotesList
            notes={notes}
            theme={theme}
            onDeleteNote={onDeleteNote}
            onRestoreComplete={onRestoreComplete}
          />
        )}
      </ScrollView>
    </View>
  );
}
