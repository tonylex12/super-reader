import React, { useState, useRef, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ReaderProps {
  pdfUri: string;
  pdfName: string;
  initialPage: number;
  theme: "light" | "dark" | "sepia" | "forest";
  onBack: () => void;
  onPageChange: (page: number, totalPages: number) => void;
  onThemeChange: (theme: "light" | "dark" | "sepia" | "forest") => void;
}

export default function Reader({
  pdfUri,
  pdfName,
  initialPage,
  theme,
  onBack,
  onPageChange,
  onThemeChange,
}: ReaderProps) {
  const webViewRef = useRef<WebView>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage || 1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const insets = useSafeAreaInsets();

  const [viewMode, setViewMode] = useState<"original" | "text">("original");
  const [fontSize, setFontSize] = useState(18);
  const [scrollDirection, setScrollDirection] = useState<"vertical" | "horizontal">("vertical");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Ruta del archivo HTML local copiado en el Document Directory
  const viewerUrl = `${FileSystem.documentDirectory}pdf_viewer/viewer.html`;

  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  const logMsg = (msg: string) => {
    // Logs silenciados en producción
  };

  // Memoizar el source del WebView para evitar recargas destructivas en cada render
  const webViewSource = useMemo(() => {
    return { html: htmlContent || "", baseUrl: `${FileSystem.documentDirectory}pdf_viewer/` };
  }, [htmlContent]);

  // Leer el HTML del lector y las librerías para inyectar todo en línea
  useEffect(() => {
    async function loadHtml() {
      try {
        logMsg("Iniciando carga de HTML y scripts...");
        const pdfJsUrl = `${FileSystem.documentDirectory}pdf_viewer/pdf.min.js`;
        const pdfWorkerJsUrl = `${FileSystem.documentDirectory}pdf_viewer/pdf.worker.min.js`;

        logMsg(`Ruta html: ${viewerUrl}`);
        logMsg("Leyendo viewer.html...");
        let html = await FileSystem.readAsStringAsync(viewerUrl);
        logMsg(`viewer.html leído (${html.length} bytes)`);

        logMsg("Leyendo pdf.min.js...");
        const pdfJsCode = await FileSystem.readAsStringAsync(pdfJsUrl);
        logMsg(`pdf.min.js leído (${pdfJsCode.length} bytes)`);

        logMsg("Leyendo pdf.worker.min.js como Base64...");
        const pdfWorkerBase64 = await FileSystem.readAsStringAsync(pdfWorkerJsUrl, {
          encoding: FileSystem.EncodingType.Base64,
        });
        logMsg(`pdf.worker.min.js leído (${pdfWorkerBase64.length} bytes base64)`);
        
        logMsg("Inyectando código en HTML...");
        html = html.replace(
          '<script src="pdf.min.js"></script>',
          `<script>${pdfJsCode}</script>`
        );

        const injectScript = `<script>window.PDF_WORKER_BASE64 = "${pdfWorkerBase64}";</script>`;
        html = html.replace('<head>', `<head>${injectScript}`);
        logMsg("Inyección completada");

        setHtmlContent(html);
        logMsg("htmlContent guardado (WebView listo para montarse)");
      } catch (err: any) {
        logMsg(`ERROR preparando archivos: ${err.message}`);
        console.error("Error al leer y preparar archivos del lector:", err);
        setErrorMsg(`Error al inicializar: ${err.message}`);
      }
    }
    loadHtml();
  }, [viewerUrl]);

  // Estilos de colores en crudo (hex) para evitar bugs de NativeWind v4 al inyectar clases dinámicas
  const colors = {
    light: {
      bg: "#FFFFFF",          // white
      headerBg: "#FFFFFF",    // white
      headerBorder: "#E2E8F0",// slate-200
      text: "#1E293B",        // slate-800
      textMuted: "#64748B",   // slate-500
      border: "#E2E8F0",      // slate-200
      accent: "#2563EB",      // blue-600
      accentText: "#FFFFFF",
      buttonBg: "#F1F5F9",    // slate-100
      sheetBg: "#F8FAFC",     // slate-50
      iconColor: "#475569",   // slate-600
    },
    dark: {
      bg: "#0A0A0A",          // neutral-950
      headerBg: "#0A0A0A",    // neutral-950
      headerBorder: "#262626",// neutral-800
      text: "#E2E8F0",        // neutral-200
      textMuted: "#737373",   // neutral-500
      border: "#262626",      // neutral-800
      accent: "#2563EB",      // blue-600
      accentText: "#FFFFFF",
      buttonBg: "#171717",    // neutral-900
      sheetBg: "#171717",     // neutral-900
      iconColor: "#E2E8F0",   // neutral-200
    },
    sepia: {
      bg: "#F4ECD8",          // sepia-bg
      headerBg: "#F4ECD8",    // sepia-bg
      headerBorder: "#DCD0B4",// sepia-border
      text: "#4A3728",        // sepia-text
      textMuted: "#7A6250",   // sepia-muted
      border: "#DCD0B4",      // sepia-border
      accent: "#8B6B4F",      // sepia-accent
      accentText: "#FFFFFF",
      buttonBg: "#ECE2C8",    // sepia card/button
      sheetBg: "#ECE2C8",     // sepia sheet
      iconColor: "#4A3728",   // sepia-text
    },
    forest: {
      bg: "#14241C",          // forest-bg
      headerBg: "#14241C",    // forest-bg
      headerBorder: "#1C362A",// forest-border
      text: "#E6EFE9",        // forest-text
      textMuted: "#9CB3A6",   // forest-muted
      border: "#1C362A",      // forest-border
      accent: "#2D5A43",      // forest-accent
      accentText: "#FFFFFF",
      buttonBg: "#0E1B15",    // forest card/button
      sheetBg: "#0E1B15",     // forest sheet
      iconColor: "#E6EFE9",   // forest-text
    },
  }[theme];

  // Enviar comando al WebView
  const sendCommand = (type: string, payload: any) => {
    if (webViewRef.current) {
      const msg = JSON.stringify({ type, ...payload });
      webViewRef.current.postMessage(msg);
    }
  };

  // Cargar PDF enviando su ruta local al WebView
  const loadPdfIntoWebView = async () => {
    try {
      logMsg("Carga del PDF solicitada...");
      setLoading(true);
      setErrorMsg(null);
      
      const tempPdfUri = `${FileSystem.documentDirectory}pdf_viewer/temp_active.pdf`;
      logMsg(`Ruta PDF origen: ${pdfUri}`);
      logMsg(`Ruta PDF destino: ${tempPdfUri}`);
      
      const fileInfo = await FileSystem.getInfoAsync(tempPdfUri);
      if (fileInfo.exists) {
        logMsg("Borrando PDF temporal anterior...");
        await FileSystem.deleteAsync(tempPdfUri, { idempotent: true });
        logMsg("PDF temporal anterior borrado");
      }

      logMsg("Copiando nuevo PDF temporal...");
      await FileSystem.copyAsync({
        from: pdfUri,
        to: tempPdfUri,
      });
      logMsg("Copia completada");

      logMsg("Enviando comando load-pdf-path con 'temp_active.pdf'...");
      sendCommand("load-pdf-path", { path: "temp_active.pdf" });
      logMsg("Comando enviado");
    } catch (err: any) {
      logMsg(`ERROR en loadPdfIntoWebView: ${err.message}`);
      console.error("Error copiando archivo temporal del lector:", err);
      setErrorMsg("Error al iniciar la carga del archivo PDF.");
      setLoading(false);
    }
  };

  // Escuchar mensajes del WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case "ready":
          logMsg("Visor listo (ready)");
          loadPdfIntoWebView();
          break;
        case "pdf-loaded":
          logMsg(`PDF cargado con éxito. Páginas: ${data.numPages}`);
          setTotalPages(data.numPages);
          setLoading(false);
          sendCommand("set-mode", { mode: viewMode });
          sendCommand("set-theme", { theme });
          sendCommand("set-font-size", { fontSize });
          sendCommand("set-scroll-direction", { direction: scrollDirection });
          if (initialPage > 1) {
            sendCommand("go-to-page", { page: initialPage });
          }
          onPageChange(initialPage || 1, data.numPages);
          break;
        case "page-changed":
          // Omitir spam de cambio de página en logs del terminal para mantener limpia la consola
          setCurrentPage(data.page);
          onPageChange(data.page, totalPages);
          break;
        case "error":
          logMsg(`ERROR de WebView: ${data.message}`);
          setErrorMsg(data.message);
          setLoading(false);
          break;
        case "log":
          // Solo reportar logs importantes del visor
          if (data.message.includes("Error") || data.message.includes("Excepción") || data.message.includes("procesando")) {
            logMsg(`WebView Log Importante: ${data.message}`);
          }
          break;
        case "console":
          // Solo reportar errores de consola en logs para no spamear
          if (data.consoleType === "error") {
            logMsg(`WebView Console [ERROR]: ${data.message}`);
          }
          break;
      }
    } catch (err: any) {
      logMsg(`ERROR procesando mensaje: ${err.message}`);
      console.error("Error al procesar mensaje del WebView:", err);
    }
  };

  // Aplicar cambios en el WebView cuando cambian los estados
  useEffect(() => {
    if (!loading) {
      logMsg(`React Native: Cambiando modo a '${viewMode}'...`);
      sendCommand("set-mode", { mode: viewMode });
    }
  }, [viewMode]);

  useEffect(() => {
    if (!loading) {
      logMsg(`React Native: Cambiando tema a '${theme}'...`);
      sendCommand("set-theme", { theme });
    }
  }, [theme]);

  useEffect(() => {
    if (!loading) {
      logMsg(`React Native: Cambiando tamaño letra a '${fontSize}px'...`);
      sendCommand("set-font-size", { fontSize });
    }
  }, [fontSize]);

  useEffect(() => {
    if (!loading) {
      logMsg(`React Native: Cambiando dirección de scroll a '${scrollDirection}'...`);
      sendCommand("set-scroll-direction", { direction: scrollDirection });
    }
  }, [scrollDirection]);

  // Navegar páginas
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      sendCommand("go-to-page", { page: nextPage });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      sendCommand("go-to-page", { page: prevPage });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Barra de herramientas superior */}
      <View style={{ backgroundColor: colors.headerBg, borderColor: colors.headerBorder, paddingTop: Math.max(insets.top, 16) }} className="border-b px-4 pb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={onBack} className="p-2 rounded-full">
          <Feather name="chevron-left" size={24} color={colors.iconColor} />
        </TouchableOpacity>
        
        <View className="flex-1 mx-2">
          <Text numberOfLines={1} style={{ color: colors.text }} className="font-semibold text-center text-sm">
            {pdfName}
          </Text>
        </View>

        <View className="flex-row items-center">
          {/* Alternar modo vista */}
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === "original" ? "text" : "original")}
            style={{ backgroundColor: viewMode === "text" ? colors.accent : colors.buttonBg }}
            className="p-2 rounded-xl mr-1"
          >
            <Feather
              name={viewMode === "text" ? "file-text" : "book-open"}
              size={20}
              color={viewMode === "text" ? "#FFFFFF" : colors.iconColor}
            />
          </TouchableOpacity>

          {/* Abrir ajustes */}
          <TouchableOpacity
            onPress={() => setIsSettingsOpen(true)}
            style={{ backgroundColor: colors.buttonBg }}
            className="p-2 rounded-xl"
          >
            <Feather name="sliders" size={20} color={colors.iconColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenedor del Visor */}
      <View className="flex-1 relative">
        {webViewRef && htmlContent && (
          <WebView
            ref={webViewRef}
            source={webViewSource}
            originWhitelist={["*"]}
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            javaScriptEnabled={true}
            onMessage={handleWebViewMessage}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error("[WebView Native Error]:", nativeEvent);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error("[WebView HTTP Error]:", nativeEvent);
            }}
            className="flex-1 bg-transparent"
            style={{ backgroundColor: "transparent" }}
          />
        )}

        {/* Spinner de carga */}
        {loading && (
          <View className="absolute inset-0 items-center justify-center bg-black/95 z-10 px-6">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-3 text-sm font-semibold text-white">Cargando documento...</Text>
          </View>
        )}

        {/* Pantalla de error */}
        {errorMsg && (
          <View className="absolute inset-0 items-center justify-center p-6 bg-red-100/10 z-20">
            <Feather name="alert-triangle" size={40} color="#EF4444" />
            <Text className="mt-4 text-center font-semibold text-red-500">{errorMsg}</Text>
            <TouchableOpacity
              onPress={onBack}
              className="mt-6 rounded-xl bg-red-500 py-3 px-6"
            >
              <Text className="text-white font-semibold">Regresar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Barra de progreso inferior */}
      {!loading && !errorMsg && (
        <View style={{ backgroundColor: colors.headerBg, borderColor: colors.headerBorder, paddingBottom: Math.max(insets.bottom, 16) }} className="border-t px-6 pt-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handlePrevPage}
            disabled={currentPage <= 1}
            className={`p-2 rounded-full ${currentPage <= 1 ? "opacity-30" : ""}`}
          >
            <Feather name="chevron-left" size={20} color={colors.iconColor} />
          </TouchableOpacity>

          <Text style={{ color: colors.text }} className="text-xs font-semibold">
            Página {currentPage} de {totalPages}
          </Text>

          <TouchableOpacity
            onPress={handleNextPage}
            disabled={currentPage >= totalPages}
            className={`p-2 rounded-full ${currentPage >= totalPages ? "opacity-30" : ""}`}
          >
            <Feather name="chevron-right" size={20} color={colors.iconColor} />
          </TouchableOpacity>
        </View>
      )}

      {/* Modal / Sheet inferior de ajustes de lectura */}
      <Modal
        visible={isSettingsOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSettingsOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          {/* Backdrop para cerrar haciendo tap afuera */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsSettingsOpen(false)}
            className="flex-1"
          />

          <View style={{ backgroundColor: colors.sheetBg }} className="rounded-t-3xl p-6">
            {/* Cabecera Modal */}
            <View className="flex-row items-center justify-between mb-6">
              <Text style={{ color: colors.text }} className="font-bold text-lg">
                Ajustes de Lectura
              </Text>
              <TouchableOpacity
                onPress={() => setIsSettingsOpen(false)}
                style={{ backgroundColor: colors.buttonBg }}
                className="p-1.5 rounded-full"
              >
                <Feather name="x" size={18} color={colors.iconColor} />
              </TouchableOpacity>
            </View>

            {/* Ajuste de Tamaño de Fuente (Modo Texto) */}
            {viewMode === "text" && (
              <View className="mb-6">
                <Text style={{ color: colors.textMuted }} className="text-sm font-semibold mb-3">
                  Tamaño de Letra ({fontSize}px)
                </Text>
                <View className="flex-row items-center justify-between bg-slate-200/10 rounded-2xl p-2">
                  <TouchableOpacity
                    onPress={() => setFontSize(Math.max(12, fontSize - 2))}
                    style={{ backgroundColor: colors.buttonBg }}
                    className="h-11 flex-1 items-center justify-center rounded-xl"
                  >
                    <Feather name="minus" size={18} color={colors.iconColor} />
                  </TouchableOpacity>
                  <Text style={{ color: colors.text }} className="mx-6 font-bold text-base">{fontSize}</Text>
                  <TouchableOpacity
                    onPress={() => setFontSize(Math.min(32, fontSize + 2))}
                    style={{ backgroundColor: colors.buttonBg }}
                    className="h-11 flex-1 items-center justify-center rounded-xl"
                  >
                    <Feather name="plus" size={18} color={colors.iconColor} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Selector de Dirección de Desplazamiento */}
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

            {/* Selector de Temas Visuales */}
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
    </View>
  );
}
