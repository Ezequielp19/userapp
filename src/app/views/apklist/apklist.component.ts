// import { IonicModule, Platform } from '@ionic/angular';
// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { FirestoreService } from '../../common/services/firestore.service';
// import { Apk } from '../../common/models/apk.model';
// import { Categoria } from './../../common/models/categoria.models';
// import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
// import { map } from 'rxjs/operators';
// import { FormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { Filesystem, Directory } from '@capacitor/filesystem';
// import { Browser } from '@capacitor/browser';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-apk-list',
//   standalone: true,
//   imports: [IonicModule, CommonModule, FormsModule],
//   templateUrl: './apklist.component.html',
//   styleUrls: ['./apklist.component.scss'],
// })
// export class ApkListComponent implements OnInit {
//   apks$: Observable<Apk[]>;
//   categorias$: Observable<Categoria[]>;
//   filteredApks$: Observable<Apk[]>;
//   selectedCategory: string = '';
//   private categoryFilter$ = new BehaviorSubject<string>('');

//   constructor(
//     private firestoreService: FirestoreService,
//     private router: Router,
//     private http: HttpClient,
//     private platform: Platform
//   ) {}

//   ngOnInit() {
//     this.apks$ = this.firestoreService.getApks();
//     this.categorias$ = this.firestoreService.getCategorias();

//     this.filteredApks$ = combineLatest([this.apks$, this.categoryFilter$]).pipe(
//       map(([apks, filter]) =>
//         filter ? apks.filter(apk => apk.categoriaId === filter) : apks
//       )
//     );
//   }

//   navigateToDetail(apkId: string) {
//     this.router.navigate(['/apk', apkId]);
//   }

//   filterApks() {
//     this.categoryFilter$.next(this.selectedCategory);
//   }


//   async downloadAndInstallApk(url: string) {
//     try {
//       const fileName = url.split('/').pop()!;
//       const filePath = `${Directory.Data}/${fileName}`;

//       // Descarga el APK usando HttpClient
//       const response = await this.http.get(url, { responseType: 'blob' }).toPromise();
//       const blob = new Blob([response], { type: 'application/vnd.android.package-archive' });

//       // Guarda el archivo APK
//       await Filesystem.writeFile({
//         path: fileName,
//         data: blob,  // Usa directamente el Blob aquí
//         directory: Directory.Data
//       });

//       // Genera la URL del archivo para la instalación
//       const fileUri = await Filesystem.getUri({
//         path: fileName,
//         directory: Directory.Data
//       });

//       // Inicia la instalación del APK
//       await Browser.open({ url: fileUri.uri });
//     } catch (error) {
//       console.error('Error al descargar o instalar el APK:', error);
//     }
//   }

// }



import { IonicModule, Platform } from '@ionic/angular';
import { AlertController, IonHeader, IonSelectOption, IonToolbar, IonTitle, IonContent, IonLabel, IonList, IonItem, IonCard, IonInput, IonSpinner, IonButtons, IonButton, IonIcon, IonImg, IonCol, IonRow, IonBackButton, IonGrid } from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../common/services/firestore.service';
import { Apk } from '../../common/models/apk.model';
import { Categoria } from './../../common/models/categoria.models';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { FileOpenerService } from 'src/file-opener.service';

@Component({
  selector: 'app-apk-list',
  standalone: true,
  imports: [CommonModule, IonSelectOption, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonList, IonItem, IonCard, IonInput, IonSpinner, IonButtons, IonButton, IonIcon, IonImg, IonCol, IonRow, IonBackButton, IonGrid],
  templateUrl: './apklist.component.html',
  styleUrls: ['./apklist.component.scss'],
})
export class ApkListComponent implements OnInit {
  apks$: Observable<Apk[]>;
  categorias$: Observable<Categoria[]>;
  filteredApks$: Observable<Apk[]>;
  selectedCategory: string = '';

  private categoryFilter$ = new BehaviorSubject<string>('');

 constructor(
  private firestoreService: FirestoreService,
  private router: Router,
  private http: HttpClient,
  private platform: Platform,
  private fileOpener: FileOpenerService,
  private alertController: AlertController
) {}

  ngOnInit() {
    this.apks$ = this.firestoreService.getApks();
    this.categorias$ = this.firestoreService.getCategorias();

    this.filteredApks$ = combineLatest([this.apks$, this.categoryFilter$]).pipe(
      map(([apks, filter]) =>
        filter ? apks.filter(apk => apk.categoriaId === filter) : apks
      )
    );
  }

  navigateToDetail(apkId: string) {
    this.router.navigate(['/apk', apkId]);
  }

  filterApks() {
    this.categoryFilter$.next(this.selectedCategory);
  }

 async downloadAndOpenApk(url: string, fileName: string) {
    if (this.platform.is('android')) {
      try {
        const alert = await this.alertController.create({
          header: 'Descargando',
          message: 'Descargando APK...',
          backdropDismiss: false
        });
        await alert.present();

        // Descarga el archivo en formato arraybuffer
        const response = await this.http.get(url, { responseType: 'arraybuffer' }).toPromise();
        const blob = new Blob([response], { type: 'application/vnd.android.package-archive' });

        const filePath = `${fileName}.apk`;
        await Filesystem.writeFile({
          path: filePath,
          data: blob,
          directory: Directory.ExternalStorage
        });

        alert.message = 'APK descargado correctamente';
        setTimeout(() => alert.dismiss(), 2000); // Cierra la alerta después de 2 segundos

        const fileUri = await Filesystem.getUri({
          path: filePath,
          directory: Directory.ExternalStorage
        });

        // Abre el APK usando el FileOpener plugin
        await this.fileOpener.open(fileUri.uri, 'application/vnd.android.package-archive');
      } catch (error) {
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Error al descargar o abrir el archivo',
          buttons: ['OK']
        });
        await alert.present();
        console.error('Error al descargar o abrir el archivo:', error);
      }
    } else {
      const alert = await this.alertController.create({
        header: 'Advertencia',
        message: 'Este proceso solo es compatible con dispositivos Android.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }



}
