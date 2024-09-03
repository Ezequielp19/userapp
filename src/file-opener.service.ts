import { Injectable } from '@angular/core';
declare var cordova: any;

@Injectable({
  providedIn: 'root'
})
export class FileOpenerService {
  open(filePath: string, mimeType: string) {
    return new Promise<void>((resolve, reject) => {
      cordova.plugins.fileOpener2.open(filePath, mimeType, {
        error : (e: any) => reject(e),
        success : () => resolve()
      });
    });
  }
}
