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
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../common/services/firestore.service';
import { Apk } from '../../common/models/apk.model';
import { Categoria } from './../../common/models/categoria.models';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { HttpClient } from '@angular/common/http';
import { Filesystem, Directory } from '@capacitor/filesystem';




@Component({
  selector: 'app-apk-list',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
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
    private file: File,
    private http: HttpClient,
    private platform: Platform
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

  downloadApk(url: string, fileName: string) {
  if (this.platform.is('android') || this.platform.is('ios')) {
    const filePath = `${Directory.Data}/${fileName}.apk`;

    this.http.get(url, { responseType: 'blob' }).subscribe(async (data: Blob) => {
      try {
        // Convert Blob to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = reader.result as string;

          // Save file
          await Filesystem.writeFile({
            path: `${fileName}.apk`,
            data: base64Data,
            directory: Directory.Data
          });

          // Optionally open file
          // await this.fileOpener.open(filePath, 'application/vnd.android.package-archive');

          console.log('Archivo descargado correctamente:', filePath);
        };
        reader.readAsDataURL(data);
      } catch (error) {
        console.error('Error al escribir el archivo:', error);
      }
    });
  }

  }


}
