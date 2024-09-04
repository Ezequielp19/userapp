import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@capacitor-community/file-opener';

@Injectable({
  providedIn: 'root',
})
export class FileOpenerService {

  async open(filePath: string, mimeType: string) {
    if (Capacitor.getPlatform() !== 'web') {
      try {
        await FileOpener.open({
          filePath,
          mimeType
        } as any); // Usar 'as any' para evitar errores de tipo
      } catch (error) {
        console.error('Error opening file:', error);
      }
    } else {
      console.warn('FileOpener plugin is not available on the web platform');
      // Implementar una alternativa aquí si es necesario
    }
  }
}
