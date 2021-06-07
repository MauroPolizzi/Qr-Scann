import { Injectable } from '@angular/core';
import { RegistroModel } from '../models/registro.model';
import { Storage } from '@ionic/storage-angular';
import { NavController, Platform, ToastController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { File } from '@ionic-native/file/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {
  
  scaneosGuardados: RegistroModel[] = [];
  path: string;

  constructor( private storage: Storage,
               private navigation: NavController,
               private browser: InAppBrowser,
               private file: File,
               private email: EmailComposer,
               private toastCtrl: ToastController,
               private platform: Platform ) { 

    storage.create();
    this.cargarScaneos();
  }

  guardarScaneo( format: string, text: string ) {

    const nuevoScaneo = new RegistroModel( format, text );
    this.storage.set('Scanners', this.scaneosGuardados);
    this.scaneosGuardados.unshift( nuevoScaneo );

    //console.log('Registros: ', this.scaneosGuardados);
    
    this.abrirScaneo( nuevoScaneo );
  }

  borrarScaneo( item: RegistroModel ) {
    this.scaneosGuardados = this.scaneosGuardados.filter( s => s.created !== item.created );
    this.storage.set('Scanners', this.scaneosGuardados);
    this.presentToast('Se borro el escaneo.', 'danger');
  }  

  abrirScaneo( item: RegistroModel ) {
   
    this.navigation.navigateForward('/tabs/tab2');
    
    switch ( item.type ) {
      case 'web':
        this.browser.create( item.text, 'system' );
      break;

      case 'maps':
        this.navigation.navigateForward(`/tabs/tab2/mapa/${ item.text }`);
      break;
    }
  }

  async cargarScaneos() {

    const scaneos = await this.storage.get('Scanners');
    this.scaneosGuardados = scaneos || [];

    return this.scaneosGuardados;
  }

  enviarCorreo() {
    
    // Creamos un archivo de tipo CSV
    // esto es un archivo de texto plano, que posee sus columnas y la informacion,
    // separadas por comas
    const arrayTemp = [];
    // aquui definimos las columnas que va a tener el archivo
    // son las propiedades que vienen al leer un QR o Codigo Barra
    // indicamos tambien un salto de linea
    const titulos = 'Tipo, Formato, Creado en, Texto\n';
    
    // insertamos esa constante al arreglo
    arrayTemp.push(titulos);

    this.scaneosGuardados.forEach( scaneo => {
      
      // recorremos cada scaneo guardado y lo acomodamos en el orden
      // de las columnas antes mensionadas

      // es importante que cada props sea separada con una coma y un espacio en blanco
      // la prop text de las geolocation vienen la lat y lng separadas por coma
      // esto podria hacer que nuestro archivo agregue esos valores como nuevas columnas
      // para evitarlo remplzamos la coma por un espacio en blanco
      const linea = `${ scaneo.type }, ${ scaneo.format }, ${ scaneo.created }, ${ scaneo.text.replace(',', ' ') }\n`;

      arrayTemp.push(linea);
    } )

    this.crearArchivoFisico( arrayTemp.join('') );
    
  }

  crearArchivoFisico( texto: string ) {

    this.path = this.file.applicationStorageDirectory, 'app://';

    if ( this.platform.is("android") ) {
      this.path = this.file.externalDataDirectory;
    }else{
      this.path = this.file.dataDirectory;
    }
    
    // el checkFile verifica que exista el archivo
    // el dataDirectory busca en el lugar donde guarda los archivos cada plataforma (android, ios)
    // y lo busca con el nombre de 'scaneos.csv' 
    this.file.checkFile( this.path,'scaneos.csv' )
      .then( existe => { 
        //console.log('Existe? ', existe);
        return this.escribirArchivo( texto ); 
      })
      .catch( err => {
        // si el archivo no existe, lo crea
        return this.file.createFile( this.path, 'scaneos.csv', false )
          .then( creado => this.escribirArchivo( texto ) )
          .catch( err2 => console.log('No se pudo crear el archivo', err2) );
      } )
  }

  async escribirArchivo( texto: string ) {
    
    await this.file.writeExistingFile( this.path, 'scaneos.csv', texto );
    
    this.path = this.path.replace( this.file.applicationStorageDirectory, 'app://' );

    const archivo = `${ this.path }scaneos.csv`;
    
    //console.log('Archivo creado', this.path + 'scaneos.csv');
    //console.log('Archivo creado');

    const email = {
      to: 'mauropolizzi2@gmail.com', // A quien sera enviado
      //cc: 'erika@mustermann.de', // realizar una copia del correo
      //bcc: ['john@doe.com', 'jane@doe.com'], // gente adjuntada
      attachments: [
        archivo
      ],
      subject: 'Historial de escaneos',
      body: 'Aqui puedes ver todos los escaneos realizados hasta ahora. Gracias',
      isHtml: true
    };
    
    // Send a text message using default options
    this.email.open(email)
      .then( enviado => {
        this.presentToast('El correo se envio con exito.', 'success');
      } )
      .catch( err => {
        this.presentToast('Fallo el envio de correo.', 'danger');
      } );
    
  }

  async presentToast( mensaje: string, color: string ) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2200,
      color: color
    });

    toast.present();
  }
  
}
