import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { BackupData } from "../components/Notes/types";

export class BackupService {
  /**
   * Exporta toda la información local (Tema, Historial y Notas) a un archivo JSON compartible
   */
  static async exportBackup(): Promise<boolean> {
    try {
      // 1. Obtener toda la información de AsyncStorage
      const theme = await AsyncStorage.getItem("@superreader_theme") || "light";
      const historyStr = await AsyncStorage.getItem("@superreader_history");
      const notesStr = await AsyncStorage.getItem("@superreader_notes");

      const history = historyStr ? JSON.parse(historyStr) : [];
      const notes = notesStr ? JSON.parse(notesStr) : [];

      // 2. Construir la estructura del Backup
      const backup: BackupData = {
        version: "1.0.0",
        theme: theme as any,
        history,
        notes,
        exportedAt: new Date().toISOString(),
      };

      // 3. Escribir el archivo en el directorio de cache temporal
      const backupUri = `${FileSystem.cacheDirectory}superreader_backup.json`;
      await FileSystem.writeAsStringAsync(backupUri, JSON.stringify(backup, null, 2));

      // 4. Compartir el archivo usando el menú nativo (correo, Drive, etc.)
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        throw new Error("La función de compartir no está disponible en este dispositivo.");
      }

      await Sharing.shareAsync(backupUri, {
        mimeType: "application/json",
        dialogTitle: "Copia de Seguridad de SuperReader",
        UTI: "public.json",
      });

      return true;
    } catch (err: any) {
      console.error("Error al exportar copia de seguridad:", err);
      throw new Error(err.message || "Ocurrió un error al intentar crear el archivo de copia de seguridad.");
    }
  }

  /**
   * Permite seleccionar un archivo JSON de respaldo e importar sus datos a AsyncStorage
   */
  static async importBackup(): Promise<BackupData | null> {
    try {
      // 1. Abrir selector de documentos para elegir el archivo JSON
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null; // Cancelado por el usuario
      }

      const fileAsset = result.assets[0];

      // 2. Leer el contenido del archivo JSON
      const jsonContent = await FileSystem.readAsStringAsync(fileAsset.uri);
      const backup: BackupData = JSON.parse(jsonContent);

      // 3. Validar la estructura básica de los datos importados para evitar inyección corrupta
      if (!backup || typeof backup !== "object") {
        throw new Error("El archivo seleccionado no es válido.");
      }
      if (!("history" in backup) || !("notes" in backup) || !("theme" in backup)) {
        throw new Error("El archivo no tiene el formato de copia de seguridad oficial de SuperReader.");
      }

      // 4. Escribir los datos importados en AsyncStorage
      await AsyncStorage.setItem("@superreader_theme", backup.theme);
      await AsyncStorage.setItem("@superreader_history", JSON.stringify(backup.history));
      await AsyncStorage.setItem("@superreader_notes", JSON.stringify(backup.notes));

      // 5. Retornar los datos cargados para refrescar el estado global de la app
      return backup;
    } catch (err: any) {
      console.error("Error al importar copia de seguridad:", err);
      throw new Error(err.message || "No se pudo leer el archivo de copia de seguridad seleccionado.");
    }
  }
}
