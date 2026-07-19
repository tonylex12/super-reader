import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DASHBOARD_THEME_COLORS, DashboardThemeType } from "./types";
import { ReadingNote } from "../Notes/types";
import { BackupService } from "../../services/BackupService";
import { CustomAlert } from "../CustomAlert";

interface NotesListProps {
  notes: ReadingNote[];
  theme: DashboardThemeType;
  onDeleteNote: (id: string) => void;
  onRestoreComplete: (data: any) => void;
}

export const NotesList = React.memo(({
  notes,
  theme,
  onDeleteNote,
  onRestoreComplete,
}: NotesListProps) => {
  const colors = DASHBOARD_THEME_COLORS[theme];

  // Ejecuta la exportación de la copia de seguridad
  const handleExportBackup = async () => {
    try {
      const success = await BackupService.exportBackup();
      if (success) {
        CustomAlert.alert("Copia de Seguridad", "Copia creada con éxito. Puedes subir el archivo JSON resultante a tu Google Drive para respaldarlo.");
      }
    } catch (err: any) {
      CustomAlert.alert("Error", err.message || "No se pudo exportar la copia de seguridad.");
    }
  };

  // Ejecuta la importación de la copia de seguridad
  const handleImportBackup = async () => {
    try {
      const restoredData = await BackupService.importBackup();
      if (restoredData) {
        CustomAlert.alert(
          "Copia Restaurada",
          "Se ha cargado con éxito tu copia de seguridad. El historial, tema y notas de lectura han sido restaurados.",
          [{ text: "Ok", onPress: () => onRestoreComplete(restoredData) }]
        );
      }
    } catch (err: any) {
      CustomAlert.alert("Error", err.message || "No se pudo restaurar la copia de seguridad.");
    }
  };

  // Confirmar eliminación de nota individual
  const confirmDeleteNote = (id: string) => {
    CustomAlert.alert(
      "Eliminar Nota",
      "¿Estás seguro de que deseas eliminar esta reflexión de lectura?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => onDeleteNote(id),
        },
      ]
    );
  };

  return (
    <View className="flex-1">
      {/* Panel de Copia de Seguridad */}
      <View style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }} className="rounded-3xl border p-5 mb-6">
        <View className="flex-row items-center mb-3">
          <Feather name="shield" size={18} color={colors.accent} className="mr-2" />
          <Text style={{ color: colors.text }} className="font-bold text-sm">
            Copias de Seguridad y Respaldo
          </Text>
        </View>
        <Text style={{ color: colors.textMuted }} className="text-xs mb-4 leading-relaxed">
          Exporta tus notas y tu historial en un archivo JSON local que puedes subir a Drive, y restáuralo en cualquier dispositivo.
        </Text>
        
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleExportBackup}
            activeOpacity={0.8}
            style={{ backgroundColor: colors.accent }}
            className="flex-1 flex-row items-center justify-center rounded-2xl py-3 px-4"
          >
            <Feather name="upload" size={14} color="#FFFFFF" className="mr-2" />
            <Text className="font-semibold text-white text-xs">
              Crear Copia
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleImportBackup}
            activeOpacity={0.8}
            style={{ backgroundColor: colors.bg, borderColor: colors.cardBorder }}
            className="flex-1 flex-row items-center justify-center rounded-2xl py-3 px-4 border"
          >
            <Feather name="download" size={14} color={colors.iconColor} className="mr-2" />
            <Text style={{ color: colors.text }} className="font-semibold text-xs">
              Restaurar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Listado de Notas */}
      <Text style={{ color: colors.text }} className="font-bold text-lg mb-4">
        Mis Notas de Lectura ({notes.length})
      </Text>

      {notes.length === 0 ? (
        <View style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }} className="rounded-3xl border border-dashed p-8 items-center justify-center">
          <Feather name="edit-3" size={40} color={colors.iconColor} className="opacity-40 mb-3" />
          <Text style={{ color: colors.text }} className="font-semibold text-sm">
            No tienes notas escritas
          </Text>
          <Text style={{ color: colors.textMuted }} className="mt-1 text-center text-xs px-6">
            Usa el temporizador Pomodoro en el lector de PDFs y escribe tus reflexiones al finalizar la sesión.
          </Text>
        </View>
      ) : (
        <View>
          {notes.map((note) => (
            <View
              key={note.id}
              style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
              className="mb-4 rounded-2xl border p-4"
            >
              {/* Encabezado de la nota */}
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-1 mr-2">
                  <Text numberOfLines={1} style={{ color: colors.text }} className="font-bold text-sm">
                    {note.pdfName}
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-[10px] mt-0.5">
                    Pág. {note.page} • {new Date(note.date).toLocaleString()}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => confirmDeleteNote(note.id)}
                  className="p-2"
                >
                  <Feather name="trash-2" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {/* Contenido de la nota */}
              <Text style={{ color: colors.text }} className="text-xs leading-relaxed mt-1">
                {note.text}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});
