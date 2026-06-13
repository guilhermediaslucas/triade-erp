import { Capacitor } from '@capacitor/core';

// Leitura de código de barras pela câmera (apps nativos Android/iOS via Capacitor).
// No navegador NÃO há scanner nativo — devolve null e o chamador segue com o
// leitor USB / digitação no campo de bipagem (fallback que já existe).

export function scannerNativo(): boolean {
  return Capacitor.isNativePlatform();
}

// Abre a câmera e devolve o primeiro código lido (ou null se cancelar/negar/erro).
// O import do plugin é dinâmico: só carrega no app nativo, não pesa o bundle web.
export async function escanearCodigo(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');
    const sup = await BarcodeScanner.isSupported();
    if (!sup.supported) return null;
    const perm = await BarcodeScanner.requestPermissions();
    if (perm.camera !== 'granted' && perm.camera !== 'limited') return null;
    // Android: o módulo do Google ML Kit é baixado sob demanda na 1ª vez.
    try {
      const mod = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!mod.available) await BarcodeScanner.installGoogleBarcodeScannerModule();
    } catch { /* iOS não usa esse módulo — ignora */ }
    const { barcodes } = await BarcodeScanner.scan();
    return barcodes[0]?.rawValue ?? null;
  } catch {
    return null;
  }
}
