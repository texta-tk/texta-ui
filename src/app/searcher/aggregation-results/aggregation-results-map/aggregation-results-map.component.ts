import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {AggregationData, AggregationDistance} from '../aggregation-results.component';
import * as ngeoHash from 'ngeohash';

import * as L from 'leaflet';
import {Layer} from 'leaflet';
import '../../../../../node_modules/leaflet-timedimension/dist/leaflet.timedimension.src.js';
import '../../../../../node_modules/leaflet.control.layers.tree/L.Control.Layers.Tree.js';

@Component({
  selector: 'app-aggregation-results-map',
  templateUrl: './aggregation-results-map.component.html',
  styleUrls: ['./aggregation-results-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AggregationResultsMapComponent implements OnInit {
  // tslint:disable-next-line:no-any
  data: any[];
  // tslint:disable-next-line:no-any
  layout: Partial<any> | undefined;
  title = '';
  options = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: '...'})
    ],
    zoom: 5,
    center: L.latLng(46.879966, -121.726909),
    timeDimension: true,

  };
  leafletLayers: L.Layer[] = [];
  leafletLayersControl: { [name: string]: Layer };
  map: L.Map;
  isReady = false;

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  @Input() set yLabel(val: string) {
    this.title = val;
    if (this.layout?.hasOwnProperty('title')) {
      this.layout.title = val;
    }
  }

  // tslint:disable-next-line:no-any
  @Input() set aggregationData(val: AggregationData) {
    this.isReady = false;
    this.changeDetectorRef.detectChanges();
    const layersControlOverlays: { [name: string]: L.LayerGroup } = {};
    const layers: L.Layer[] = [];
    if (val.geoData) {
      for (const element of val.geoData) {
        let layerGroup = new L.LayerGroup();
        if (element.agg_geohash && element.agg_geohash.length > 0) {
          layerGroup = this.constructGeoHashLayers(element.agg_geohash, element.name);
        }
        if (element.agg_distance && element.agg_distance.length > 0) {
          layerGroup = this.constructDistanceLayers(element.agg_distance, element.name);
        }
        if (element.agg_centroid) {
          layerGroup = this.constructCentroidLayers(element.agg_centroid, element.name);
        }
        layers.push(layerGroup);
        layersControlOverlays[element.name] = layerGroup;
      }
    }
    this.leafletLayers = layers;
    this.leafletLayersControl = layersControlOverlays;
    this.isReady = true;
    this.changeDetectorRef.detectChanges();
  }

  onMapReady(map: L.Map): void {
    this.map = map;
    const children: L.Control.Layers.TreeObject[] = [];
    for (const key in this.leafletLayersControl) {
      if (this.leafletLayersControl.hasOwnProperty(key)) {
        children.push({label: key, layer: this.leafletLayersControl[key]});
      }
    }
    const overlaysTree = {
      label: 'Layers',
      selectAllCheckbox: 'Un/select all',
      children,
    };
    const treeLayer = L.control.layers.tree(undefined, overlaysTree);
    treeLayer.addTo(map);
  }

  style(doc: { key: string, doc_count: number }, maxDoc: number): { fillColor: string; color: string; fillOpacity: number; weight: number; opacity: number; dashArray: string } {

    return {
      fillColor: this.getColor(doc.doc_count, maxDoc),
      weight: 2,
      opacity: 1,
      color: 'black',
      dashArray: '3',
      fillOpacity: 0.5
    };
  }

  getColor(d: number, maxDoc: number): string {
    const percentage = (d / maxDoc) * 100;
    return percentage > 90 ? '#006837' :
      percentage > 60 ? '#31a354' :
        percentage > 30 ? '#78c679' :
          percentage > 10 ? '#c2e699' :
            '#ffffcc';
  }

  constructDistanceLayers(element: AggregationDistance[], elementName: string): L.LayerGroup {
    const layerGroup = new L.LayerGroup();
    const docCounts = element.flatMap(y => [y.doc_count]);
    const maxDocCount = Math.max(...docCounts);
    const coordFinder = /\(\s?(\S+)\s+(\S+)\s?\)/g;
    element.map(x => {
      const allMatches = coordFinder.exec(x.key);
      if (allMatches) {
        const latLngTpl: L.LatLngTuple = [Number(allMatches[2]), Number(allMatches[1])];
        const poly = L.circle(latLngTpl, {radius: x.to - x.from});
        poly.setStyle(this.style(x, maxDocCount));
        poly.bindTooltip(`<h4 style="margin: 0;">${elementName}</h4>Document count: ${x.doc_count}`);
        layerGroup.addLayer(poly);
      }
    });
    return layerGroup;
  }

  constructGeoHashLayers(element: { key: string, doc_count: number }[], elementName: string): L.LayerGroup {
    const layerGroup = new L.LayerGroup();
    const docCounts = element.flatMap(y => [y.doc_count]);
    const maxDocCount = Math.max(...docCounts);
    element.map(x => {
      const geoHashData = ngeoHash.decode_bbox(x.key);
      const poly = L.polygon([[geoHashData[2], geoHashData[1]], [geoHashData[2], geoHashData[3]], [geoHashData[0], geoHashData[3]], [geoHashData[0], geoHashData[1]]]);
      poly.setStyle(this.style(x, maxDocCount));
      poly.bindTooltip(`<h4 style="margin: 0;">${elementName}</h4>Document count: ${x.doc_count}`);
      layerGroup.addLayer(poly);
    });
    return layerGroup;
  }

  ngOnInit(): void {
  }

  // tslint:disable-next-line:no-any
  onClick($event: any): void {
    console.log($event);
  }


  private constructCentroidLayers(element: { location: { lat: number; lon: number }; count: number }, elementName: string): L.LayerGroup {
    const layerGroup = new L.LayerGroup();
    const mapMarker = L.marker([element.location.lat, element.location.lon], {
      title: `${elementName}\nDocument count: ${element.count}`, icon: L.icon({
        iconSize: [25, 41],
        iconAnchor: [13, 41],
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png'
      })
    });
    layerGroup.addLayer(mapMarker);
    return layerGroup;
  }
}
