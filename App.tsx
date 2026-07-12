import './global.css';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';

// Importar Componentes
import Dashboard, { RecentFile } from './components/Dashboard';
import Reader from './components/Reader';

// Prevenir que la pantalla de carga nativa se oculte sola
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'reader'>('dashboard');
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [globalTheme, setGlobalTheme] = useState<'light' | 'dark' | 'sepia' | 'forest'>('light');
  
  // Estado del archivo PDF abierto
  const [selectedPdf, setSelectedPdf] = useState<{ uri: string; name: string } | null>(null);
  const [initialPage, setInitialPage] = useState(1);
  const [initialViewMode, setInitialViewMode] = useState<'original' | 'text'>('original');

  // Inicializar recursos y cargar historial
  useEffect(() => {
    async function initApp() {
      try {
        // 1. Preparar recursos de PDF.js en el almacenamiento de la app
        await copyAssetsToDocDir();
        
        // 2. Cargar configuraciones guardadas e historial
        await loadSettingsAndHistory();
      } catch (err) {
        console.error("Error durante la inicialización:", err);
        Alert.alert("Error", "Ocurrió un error al preparar el lector local.");
      } finally {
        setAppReady(true);
        // Ocultar pantalla de carga nativa
        await SplashScreen.hideAsync();
      }
    }
    initApp();
  }, []);

  // Copiar archivos del visor de PDF.js desde assets al DocumentDirectory (Soluciona problemas de permisos locales en WebView)
  const copyAssetsToDocDir = async () => {
    try {
      const assets = {
        'viewer.html': require('./assets/pdf_viewer/viewer.html'),
        'pdf.min.js': require('./assets/pdf_viewer/pdf.js.pdf'),
        'pdf.worker.min.js': require('./assets/pdf_viewer/pdf.worker.js.pdf'),
      };

      const targetDir = `${FileSystem.documentDirectory}pdf_viewer/`;
      const dirInfo = await FileSystem.getInfoAsync(targetDir);
      
      // Creamos la carpeta si no existe
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
      }

      // Copiamos los archivos uno por uno
      for (const [filename, module] of Object.entries(assets)) {
        const asset = Asset.fromModule(module);
        await asset.downloadAsync();
        
        const dest = `${targetDir}${filename}`;
        
        // Eliminar el archivo existente para forzar la actualización del asset modificado
        const fileInfo = await FileSystem.getInfoAsync(dest);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(dest, { idempotent: true });
        }

        await FileSystem.copyAsync({
          from: asset.localUri || asset.uri,
          to: dest
        });
      }
    } catch (err) {
      console.error("Error al copiar recursos locales:", err);
      throw err;
    }
  };

  // Cargar tema e historial de AsyncStorage
  const loadSettingsAndHistory = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@superreader_theme');
      if (savedTheme) {
        setGlobalTheme(savedTheme as any);
      }

      const savedHistory = await AsyncStorage.getItem('@superreader_history');
      if (savedHistory) {
        setRecentFiles(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error("Error cargando historial de AsyncStorage:", err);
    }
  };

  // Cambiar tema global y guardarlo
  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'sepia' | 'forest') => {
    try {
      setGlobalTheme(newTheme);
      await AsyncStorage.setItem('@superreader_theme', newTheme);
    } catch (err) {
      console.error("Error guardando tema:", err);
    }
  };

  // Abrir selector de archivos local
  const handlePickNewFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: false
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedAsset = result.assets[0];
      
      // Creamos la carpeta de documentos guardados si no existe
      const documentsDir = `${FileSystem.documentDirectory}documents/`;
      const dirInfo = await FileSystem.getInfoAsync(documentsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(documentsDir, { intermediates: true });
      }

      // Nombre de archivo seguro
      const safeName = selectedAsset.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const destinationUri = `${documentsDir}${Date.now()}_${safeName}`;

      // Copiamos el archivo al almacenamiento persistente de la app
      await FileSystem.copyAsync({
        from: selectedAsset.uri,
        to: destinationUri
      });

      // Abrir el lector con el archivo copiado
      handleOpenFile(destinationUri, selectedAsset.name, 1);
    } catch (err) {
      console.error("Error seleccionando archivo:", err);
      Alert.alert("Error", "No se pudo abrir o guardar el archivo seleccionado.");
    }
  };

  // Abrir lector de PDF
  const handleOpenFile = (uri: string, name: string, pageProgress: number, viewModeProgress: 'original' | 'text' = 'original') => {
    setSelectedPdf({ uri, name });
    setInitialPage(pageProgress);
    setInitialViewMode(viewModeProgress);
    setCurrentScreen('reader');
  };

  // Actualizar historial al avanzar páginas o abrir archivo
  const handlePageChange = async (page: number, totalPages: number, viewMode?: 'original' | 'text') => {
    if (!selectedPdf) return;

    try {
      // Filtrar y actualizar el archivo actual en la lista
      const updatedHistory = recentFiles.filter(file => file.uri !== selectedPdf.uri);
      
      // Intentar preservar el viewMode anterior si no se pasa uno nuevo
      const existingFile = recentFiles.find(file => file.uri === selectedPdf.uri);
      const resolvedViewMode = viewMode || existingFile?.viewMode || "original";

      const updatedFile: RecentFile = {
        uri: selectedPdf.uri,
        name: selectedPdf.name,
        lastOpened: new Date().toISOString(),
        page: page,
        totalPages: totalPages,
        viewMode: resolvedViewMode
      };

      // Colocar al inicio
      const newHistory = [updatedFile, ...updatedHistory];
      setRecentFiles(newHistory);
      
      // Guardar en AsyncStorage
      await AsyncStorage.setItem('@superreader_history', JSON.stringify(newHistory));
    } catch (err) {
      console.error("Error guardando progreso:", err);
    }
  };

  // Limpiar historial de lectura
  const handleClearHistory = async () => {
    Alert.alert(
      "Limpiar Historial",
      "¿Estás seguro de que quieres borrar el historial de lectura? Los archivos guardados localmente en la app se mantendrán en el almacenamiento.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            try {
              setRecentFiles([]);
              await AsyncStorage.removeItem('@superreader_history');
            } catch (err) {
              console.error("Error borrando historial:", err);
            }
          }
        }
      ]
    );
  };

  if (!appReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const outerBgStyle = {
    light: '#F8FAFC', // slate-50
    dark: '#121212',  // neutral-950
    sepia: '#F4ECD8', // sepia-bg
    forest: '#14241C', // forest-bg
  }[globalTheme];

  const statusBarContentStyle = 
    globalTheme === 'dark' || globalTheme === 'forest' ? 'light-content' : 'dark-content';

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: outerBgStyle }}>
        <StatusBar barStyle={statusBarContentStyle} translucent backgroundColor="transparent" />
        
        {currentScreen === 'dashboard' ? (
          <Dashboard
            recentFiles={recentFiles}
            theme={globalTheme}
            onSelectFile={(uri, name) => {
              // Buscar página de inicio guardada y el modo de vista anterior
              const file = recentFiles.find(f => f.uri === uri);
              handleOpenFile(uri, name, file ? file.page : 1, file?.viewMode || "original");
            }}
            onPickNewFile={handlePickNewFile}
            onClearHistory={handleClearHistory}
            onToggleTheme={handleThemeChange}
          />
        ) : (
          selectedPdf && (
            <Reader
              pdfUri={selectedPdf.uri}
              pdfName={selectedPdf.name}
              initialPage={initialPage}
              initialViewMode={initialViewMode}
              theme={globalTheme}
              onBack={() => setCurrentScreen('dashboard')}
              onPageChange={handlePageChange}
              onThemeChange={handleThemeChange}
            />
          )
        )}
      </View>
    </SafeAreaProvider>
  );
}
