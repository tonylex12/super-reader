import { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system/legacy";

/**
 * Hook para preparar y compilar el archivo HTML e inyectar scripts de PDF.js
 */
export function useReaderHtml(viewerUrl: string) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadHtml() {
      try {
        const pdfJsUrl = `${FileSystem.documentDirectory}pdf_viewer/pdf.min.js`;
        const pdfWorkerJsUrl = `${FileSystem.documentDirectory}pdf_viewer/pdf.worker.min.js`;

        let html = await FileSystem.readAsStringAsync(viewerUrl);
        const pdfJsCode = await FileSystem.readAsStringAsync(pdfJsUrl);
        const pdfWorkerBase64 = await FileSystem.readAsStringAsync(pdfWorkerJsUrl, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        html = html.replace(
          '<script src="pdf.min.js"></script>',
          `<script>${pdfJsCode}</script>`
        );

        const injectScript = `<script>window.PDF_WORKER_BASE64 = "${pdfWorkerBase64}";</script>`;
        html = html.replace('<head>', `<head>${injectScript}`);

        setHtmlContent(html);
      } catch (err: any) {
        console.error("Error al preparar archivos del lector:", err);
        setErrorMsg(`Error al inicializar: ${err.message}`);
      }
    }
    loadHtml();
  }, [viewerUrl]);

  return { htmlContent, errorMsg };
}
