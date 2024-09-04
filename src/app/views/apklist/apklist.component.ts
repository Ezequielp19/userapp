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
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { FileOpener } from '@capacitor-community/file-opener';
import { FileOpenerService } from 'src/file-opener.service';

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';



import { Capacitor } from '@capacitor/core';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';





@Component({
  selector: 'app-apk-list',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './apklist.component.html',
  styleUrls: ['./apklist.component.scss'],
})
export class ApkListComponent implements OnInit {
  apks$: Observable<Apk[]>;
  categorias$: Observable<Categoria[]>;
  filteredApks$: Observable<Apk[]>;
  selectedCategory: string = '';

  private categoryFilter$ = new BehaviorSubject<string>('');

      form: FormGroup;




  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private router: Router,
    private http: HttpClient,
    private platform: Platform,
    private fileOpener: FileOpenerService,
    private alertController: AlertController,
    private diagnostic: Diagnostic

  )    {      this.checkPermissions();
     this.form = this.fb.group({
      selectedCategory: new FormControl(''),
    });
  }

  selectedCategoryControl = new FormControl('');


  async ngOnInit() {
   

    this.apks$ = this.firestoreService.getApks();
    this.categorias$ = this.firestoreService.getCategorias();

    this.filteredApks$ = combineLatest([this.apks$, this.categoryFilter$]).pipe(
      map(([apks, filter]) =>
        filter ? apks.filter(apk => apk.categoriaId === filter) : apks
      )
    );
  }

    async checkPermissions() {
    try {
      const status = await this.diagnostic.getLocationAuthorizationStatus();
      console.log('Diagnostic status:', status);
    } catch (error) {
      console.error('Diagnostic error:', error);
    }
  }


  navigateToDetail(apkId: string) {
    this.router.navigate(['/apk', apkId]);
  }

  // filterApks() {
  //   this.categoryFilter$.next(this.selectedCategory);
  // }

    filterApks() {
    const selectedCategory = this.form.get('selectedCategory')?.value;
    this.categoryFilter$.next(selectedCategory);
  }




//    async downloadApk(url: string, fileName: string) {
//   if (this.platform.is('android')) {
//     let downloadAlert: HTMLIonAlertElement;

//     try {

//       downloadAlert = await this.alertController.create({
//         header: 'Descargando',
//         message: 'La descarga del APK está en progreso...',
//         backdropDismiss: false,
//       });
//       await downloadAlert.present();


//       const response = await this.http.get(url, { responseType: 'arraybuffer' }).toPromise();
//       const blob = new Blob([response], { type: 'application/vnd.android.package-archive' });

//       const filePath = `Download/${fileName}.apk`;
//       await Filesystem.writeFile({
//         path: filePath,
//         data: blob,
//         directory: Directory.External,
//       });


//       await downloadAlert.dismiss();
//       const successAlert = await this.alertController.create({
//         header: 'Descarga completada',
//         message: `El APK se ha descargado correctamente en la carpeta de Descargas (${filePath}).`,
//         buttons: ['OK'],
//       });
//       await successAlert.present();

//       console.log('APK descargado correctamente');
//     } catch (error) {

//       if (downloadAlert) {
//         await downloadAlert.dismiss();
//       }


//       const errorAlert = await this.alertController.create({
//         header: 'Error',
//         message: 'Hubo un error al descargar el APK.',
//         buttons: ['OK'],
//       });
//       await errorAlert.present();

//       console.error('Error al descargar el archivo:', error);
//     }
//   } else {
//     const warningAlert = await this.alertController.create({
//       header: 'Advertencia',
//       message: 'Este proceso solo es compatible con dispositivos Android.',
//       buttons: ['OK'],
//     });
//     await warningAlert.present();
//   }
// }


  async downloadAndOpenApk(url: string, fileName: string) {
  let downloadAlert: HTMLIonAlertElement;

  try {
    downloadAlert = await this.alertController.create({
      header: 'Descargando',
      message: 'La descarga del APK está en progreso...',
      backdropDismiss: false,
    });
    await downloadAlert.present();

    console.log('Iniciando descarga del APK');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al descargar el archivo: ${response.statusText}`);
    }
    const blob = await response.blob();
    console.log('Archivo descargado, convirtiendo a base64');

    const base64Promise = new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const base64Data = await base64Promise;
    const base64DataString = base64Data.split(',')[1];
    console.log('Conversión a base64 completa, guardando archivo');

    const filePath = `Download/${fileName}.apk`;
    await Filesystem.writeFile({
      path: filePath,
      data: base64DataString,
      directory: Directory.External,
    });

    console.log('Archivo guardado en:', filePath);

    await downloadAlert.dismiss();
    const successAlert = await this.alertController.create({
      header: 'Descarga completada',
      message: `El APK se ha descargado correctamente en la carpeta de Descargas (${filePath}).`,
      buttons: ['OK'],
    });
    await successAlert.present();

    const fileUri = (await Filesystem.getUri({ directory: Directory.External, path: filePath })).uri;
    console.log('Abriendo archivo con FileOpener:', fileUri);

    await this.fileOpener.open(fileUri, 'application/vnd.android.package-archive');

    console.log(`APK descargado y guardado correctamente en: ${filePath}`);
  } catch (error) {
    console.error('Error en el proceso:', error);

    if (downloadAlert) {
      await downloadAlert.dismiss();
    }

    const errorAlert = await this.alertController.create({
      header: 'Error',
      message: 'Hubo un error al descargar el APK.',
      buttons: ['OK'],
    });
    await errorAlert.present();
  }
}

}
