import { Component, ViewChild, OnInit } from '@angular/core';
import { DataLocalService } from '../../services/data-local.service';
import { IonList } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  @ViewChild(IonList) ionList: IonList;

  constructor( public dataLocal: DataLocalService ) {}

  enviarCorreo() {
    this.dataLocal.enviarCorreo();
  }

  detalleScaneo( item: any ) {
    this.dataLocal.abrirScaneo( item );
  }

  borrarScaneo( item: any ) {
    this.dataLocal.borrarScaneo( item );
    this.ionList.closeSlidingItems();
  }
}
