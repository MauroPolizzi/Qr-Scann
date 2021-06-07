import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
declare var mapboxgl: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit, AfterViewInit {

  lat: number;
  lng: number;
  
  constructor( private route: ActivatedRoute ) { }

  ngOnInit() {
    // obtenemos el valpr de latitud y longitud que pasamos por url
    let geo: any = this.route.snapshot.paramMap.get('geo');

    geo = geo.substr(4);
    geo = geo.split(',');
    
    this.lat = Number(geo[0]);
    this.lng = Number(geo[1]);

    //console.log(this.lat, this.lng);
  }

  // Este metodo se dispara cuando ya cargo todo el componente
  // despues del ngOnInit
  ngAfterViewInit() {
    // // Esto es codigo propio de MapBox
    // mapboxgl.accessToken = 'pk.eyJ1IjoibWF1cm9wb2xpenppIiwiYSI6ImNrcDkydG44ODAwa3cyb29hajFvdDIza2YifQ.zcrjvIbwix1ywhymai3Rqw';
    // const map = new mapboxgl.Map({
    //   container: 'map',
    //   style: 'mapbox://styles/mapbox/streets-v11'
    // });
    this.mapa3D();
  }

  mapa3D() {

    mapboxgl.accessToken = 'pk.eyJ1IjoibWF1cm9wb2xpenppIiwiYSI6ImNrcDkydG44ODAwa3cyb29hajFvdDIza2YifQ.zcrjvIbwix1ywhymai3Rqw';
      const map = new mapboxgl.Map({
        style: 'mapbox://styles/mapbox/light-v10',
        center: [this.lng, this.lat],
        zoom: 15.5,
        pitch: 45,
        bearing: -17.6,
        container: 'map',
        antialias: true
      });
 
    map.on('load', () => {
      
      // Este metodo es el que renderiza el mapa, segun las dimensiones de su contenedor
      map.resize();

      new mapboxgl.Marker({
        draggable: false
      })
        .setLngLat([this.lng, this.lat])
        .addTo(map);

      // Insert the layer beneath any symbol layer.
      const layers = map.getStyle().layers;
      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }
 
        // The 'building' layer in the Mapbox Streets
        // vector tileset contains building height data
        // from OpenStreetMap.
        map.addLayer({
            'id': 'add-3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
              'fill-extrusion-color': '#aaa',
         
              // Use an 'interpolate' expression to
              // add a smooth transition effect to
              // the buildings as the user zooms in.
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.6
            }
        },
      
          labelLayerId
      
        );
    });  
  }
}
