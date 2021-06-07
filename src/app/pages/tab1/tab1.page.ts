import { Component } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { ToastController } from '@ionic/angular';
import { DataLocalService } from 'src/app/services/data-local.service';
import { RegistroModel } from '../../models/registro.model';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  
  codigo: RegistroModel;
  constructor( private scanner: BarcodeScanner,
               private dataLocal: DataLocalService,
               private toastCtrl: ToastController ) {}

  scan() {
    this.scanner.scan().then(barcodeData => {
      //this.codigo.text = barcodeData.text;
      
      if ( !barcodeData.cancelled ) {
        this.dataLocal.guardarScaneo( barcodeData.format, barcodeData.text );
        this.presentToast( 'Scaneo guardado en Historial.', 'success' );
        //this.dataLocal.abrirScaneo( barcodeData.text );
        console.log('Barcode data', barcodeData);
      }

     }).catch(err => {

        // usamos el metodo para probar en el navegador, ya que no podemos 
        // abrir la camara
        //this.dataLocal.guardarScaneo('QRCode', 'geo:-26.847472,-65.189542'); 
        this.presentToast('Scaneo Erroneo.', 'danger');
        //this.dataLocal.abrirScaneo( 'https://github.com/MauroPolizzi' );
        console.log('Error', err);
     });
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
