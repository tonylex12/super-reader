import React, { useState, useRef, useEffect, useMemo } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system/legacy";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReaderProps, THEME_COLORS } from "./types";
import { useReaderHtml } from "./useReaderHtml";
import {
  ReaderHeader,
  ReaderFooter,
  LoadingOverlay,
  ErrorOverlay,
  SettingsModal,
  PageJumpModal
} from "./index";

export default function Reader({
  pdfUri,
  pdfName,
  initialPage,
  initialViewMode,
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

  const [viewMode, setViewMode] = useState<"original" | "text">(initialViewMode || "original");
  const [fontSize, setFontSize] = useState(18);
  const [scrollDirection, setScrollDirection] = useState<"vertical" | "horizontal">("vertical");
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [inputPage, setInputPage] = useState("");

  const insets = useSafeAreaInsets();
  const colors = THEME_COLORS[theme];

  // Ruta del archivo HTML local copiado en el Document Directory
  const viewerUrl = `${FileSystem.documentDirectory}pdf_viewer/viewer.html`;
  
  // Utilizar Hook personalizado para aislar lectura de archivos HTML (SRP)
  const { htmlContent, errorMsg: htmlError } = useReaderHtml(viewerUrl);

  // Escuchar errores de carga de archivos HTML
  useEffect(() => {
    if (htmlError) {
      setErrorMsg(htmlError);
    }
  }, [htmlError]);

  // Memoizar el source del WebView para evitar recargas destructivas en cada render
  const webViewSource = useMemo(() => {
    return { html: htmlContent || "", baseUrl: `${FileSystem.documentDirectory}pdf_viewer/` };
  }, [htmlContent]);

  // Enviar comando al WebView
  const sendCommand = (type: string, payload: any) => {
    if (webViewRef.current) {
      const msg = JSON.stringify({ type, ...payload });
      webViewRef.current.postMessage(msg);
    }
  };

  // Cargar PDF copiándolo a directorio temporal para saltar restricciones de WebView
  const loadPdfIntoWebView = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const tempPdfUri = `${FileSystem.documentDirectory}pdf_viewer/temp_active.pdf`;
      const fileInfo = await FileSystem.getInfoAsync(tempPdfUri);
      
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(tempPdfUri, { idempotent: true });
      }

      await FileSystem.copyAsync({
        from: pdfUri,
        to: tempPdfUri,
      });

      sendCommand("load-pdf-path", { path: "temp_active.pdf" });
    } catch (err: any) {
      console.error("Error copiando archivo temporal del lector:", err);
      setErrorMsg("Error al iniciar la carga del archivo PDF.");
      setLoading(false);
    }
  };

  // Procesar mensajes asíncronos del WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case "ready":
          loadPdfIntoWebView();
          break;
        case "pdf-loaded":
          setTotalPages(data.numPages);
          setLoading(false);
          sendCommand("set-mode", { mode: viewMode });
          sendCommand("set-theme", { theme });
          sendCommand("set-font-size", { fontSize });
          sendCommand("set-scroll-direction", { direction: scrollDirection });
          if (initialPage > 1) {
            sendCommand("go-to-page", { page: initialPage, behavior: "auto" });
          }
          onPageChange(initialPage || 1, data.numPages, viewMode);
          break;
        case "page-changed":
          setCurrentPage(data.page);
          onPageChange(data.page, totalPages, viewMode);
          break;
        case "error":
          setErrorMsg(data.message);
          setLoading(false);
          break;
      }
    } catch (err: any) {
      console.error("Error al procesar mensaje del WebView:", err);
    }
  };

  // Efecto secundario: Enlace reactivo al cambiar de modo de vista
  useEffect(() => {
    if (!loading) {
      sendCommand("set-mode", { mode: viewMode });
      // Forzar salto instantáneo a la página actual en el nuevo modo para evitar desfase de altura
      sendCommand("go-to-page", { page: currentPage, behavior: "auto" });
      onPageChange(currentPage, totalPages, viewMode);
    }
  }, [viewMode]);

  // Efecto secundario: Enlace reactivo al cambiar tema
  useEffect(() => {
    if (!loading) {
      sendCommand("set-theme", { theme });
    }
  }, [theme]);

  // Efecto secundario: Enlace reactivo al cambiar tamaño de fuente
  useEffect(() => {
    if (!loading) {
      sendCommand("set-font-size", { fontSize });
    }
  }, [fontSize]);

  // Efecto secundario: Enlace reactivo al cambiar dirección de scroll
  useEffect(() => {
    if (!loading) {
      sendCommand("set-scroll-direction", { direction: scrollDirection });
    }
  }, [scrollDirection]);

  // Navegar páginas paso a paso (botones inferiores)
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

  // Confirmar salto manual de página desde el modal centrado
  const handleConfirmPageJump = () => {
    const num = parseInt(inputPage, 10);
    if (!isNaN(num)) {
      const targetPage = Math.max(1, Math.min(totalPages, num));
      setCurrentPage(targetPage);
      sendCommand("go-to-page", { page: targetPage, behavior: "auto" });
    }
    setIsPageModalOpen(false);
    setInputPage("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* 1. Header (Barra superior) */}
      <ReaderHeader
        pdfName={pdfName}
        viewMode={viewMode}
        colors={colors}
        insets={insets}
        onBack={onBack}
        onToggleViewMode={() => setViewMode(prev => prev === "original" ? "text" : "original")}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* 2. Contenedor del Visor WebView */}
      <View className="flex-1 relative">
        {htmlContent && (
          <WebView
            ref={webViewRef}
            source={webViewSource}
            originWhitelist={["*"]}
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            javaScriptEnabled={true}
            onMessage={handleWebViewMessage}
            className="flex-1 bg-transparent"
            style={{ backgroundColor: "transparent" }}
          />
        )}

        {/* Pantalla de carga asíncrona */}
        <LoadingOverlay visible={loading} />

        {/* Pantalla de visualización de errores */}
        <ErrorOverlay errorMsg={errorMsg} onBack={onBack} />
      </View>

      {/* 3. Footer (Barra de progreso inferior) */}
      {!loading && !errorMsg && (
        <ReaderFooter
          currentPage={currentPage}
          totalPages={totalPages}
          colors={colors}
          insets={insets}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          onOpenPageJump={() => {
            setInputPage(currentPage.toString());
            setIsPageModalOpen(true);
          }}
        />
      )}

      {/* 4. Modal deslizante inferior de Ajustes de Lectura */}
      <SettingsModal
        visible={isSettingsOpen}
        viewMode={viewMode}
        fontSize={fontSize}
        scrollDirection={scrollDirection}
        theme={theme}
        colors={colors}
        onClose={() => setIsSettingsOpen(false)}
        setFontSize={setFontSize}
        setScrollDirection={setScrollDirection}
        onThemeChange={onThemeChange}
      />

      {/* 5. Modal centrado para ingresar página manualmente */}
      <PageJumpModal
        visible={isPageModalOpen}
        currentPage={currentPage}
        totalPages={totalPages}
        inputPage={inputPage}
        colors={colors}
        setInputPage={setInputPage}
        onClose={() => {
          setIsPageModalOpen(false);
          setInputPage("");
        }}
        onConfirm={handleConfirmPageJump}
      />
    </View>
  );
}
