 import { IonicModule,Platform } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../common/services/firestore.service';
import { Apk } from '../../common/models/apk.model';
import { Categoria } from './../../common/models/categoria.models';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';  // Asegúrate de importar FormsModule
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';


import { File } from '@awesome-cordova-plugins/file/ngx'; // Importa File
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Importa HttpClient

import { Filesystem, Directory, Encoding, FilesystemEncoding } from '@capacitor/filesystem';




@Component({
  selector: 'app-apk-list',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,HttpClientModule],
  templateUrl: './apklist.component.html',
  styleUrls: ['./apklist.component.scss'],
})
export class ApkListComponent implements OnInit {
  apks$: Observable<Apk[]>;

   categorias$: Observable<Categoria[]>;
  filteredApks$: Observable<Apk[]>;
  selectedCategory: string = '';

    private categoryFilter$ = new BehaviorSubject<string>('');


  constructor(private firestoreService: FirestoreService,private router: Router, private file: File,  // Inyecta File
    private http: HttpClient, // Inyecta HttpClient
    private platform: Platform  // Inyecta Platform
private fileOpener: FileOpener
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

// async downloadApk(url: string) {
//   try {

//     await Browser.open({ url });
//   } catch (error) {
//     console.error('Error al abrir el navegador:', error);
//   }
// }

//   isAndroidTV(): boolean {
//     return this.platform.is('android') && (navigator.userAgent.includes('TV') || navigator.userAgent.includes('AFT'));
//   }


 async downloadAndInstallApk(url: string) {
    try {
      const fileName = url.split('/').pop()!; // Extrae el nombre del archivo del URL
      const filePath = this.file.dataDirectory + fileName; // Define la ruta donde se guardará el APK

      // Descarga el APK usando HttpClient
      const response = await this.http.get(url, { responseType: 'blob' }).toPromise();
      const blob = new Blob([response], { type: 'application/vnd.android.package-archive' });

      // Guarda el archivo APK
      this.file.writeFile(this.file.dataDirectory, fileName, blob, { replace: true }).then(() => {
        // Abre el archivo APK para la instalación
        this.fileOpener.open(filePath, 'application/vnd.android.package-archive')
          .then(() => console.log('APK abierto para instalación'))
          .catch((error) => console.error('Error al abrir el APK:', error));
      }).catch(error => console.error('Error al guardar el archivo APK:', error));
    } catch (error) {
      console.error('Error al descargar o instalar el APK:', error);
    }
  }


 


}
