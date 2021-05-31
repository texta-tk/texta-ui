import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {AggregationData, AggregationDistance} from '../aggregation-results.component';
import * as ngeoHash from 'ngeohash';

import * as L from 'leaflet';
import {GeoJSON, Layer, LayerGroup} from 'leaflet';
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
    timeDimensionControl: true,

  };
  leafletLayers: L.Layer[] = [];
  treeLayers: L.Control.Layers.TreeObject[];
  geoJson: L.GeoJSON = new GeoJSON();
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
    this.leafletLayers = [];
    this.changeDetectorRef.detectChanges();
    const treeGroupLayers: L.Control.Layers.TreeObject[] = [];
    const layers: L.Layer[] = [];
    if (val.geoData) {
      console.log(val.geoData);
      for (const element of val.geoData) {
        let treeGroup: L.Control.Layers.TreeObject | undefined;
        if (element.agg_geohash && element.agg_geohash.length > 0) {
          let sss: L.Control.Layers.TreeObject;
          sss = this.constructTree(element, {label: element.name, children: []});
          treeGroup = sss;
        }
        if (treeGroup) {
          treeGroupLayers.push(treeGroup);
        }
        /*        if (element.agg_distance && element.agg_distance.length > 0) {
                  layerGroup = this.constructDistanceLayers(element.agg_distance, element.name);
                }
                if (element.agg_centroid) {
                  layerGroup = this.constructCentroidLayers(element.agg_centroid, element.name);
                }*/
      }
    }
    console.log(treeGroupLayers);

    this.treeLayers = treeGroupLayers;
    this.isReady = true;
    this.changeDetectorRef.detectChanges();
  }

  onMapReady(map: L.Map): void {
    this.map = map;
    const geoJsonTimeLayer = L.timeDimension.layer.geoJson(this.treeLayers[0].layer, {updateDimensions: true});
    geoJsonTimeLayer.addTo(map);
    const overlaysTree = {
      label: 'Un/select all',
      selectAllCheckbox: true,
      children: this.treeLayers,
    };
    map.on('baselayerchange', (x => {
      console.log(x);
    }));
    console.log(this.geoJson);
    const treeLayer = L.control.layers.tree(undefined, overlaysTree);
    treeLayer.addTo(map);
    this.updateTimeline(this.leafletLayers);
  }

  // tslint:disable-next-line:no-any
  constructTree(element: any, treeObject: L.Control.Layers.TreeObject, time?: number): any {
    debugger
    const elementKeys = ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term', 'fact_val_reverse', 'agg_geohash', 'agg_distance', 'agg_centroid'];
    if (!element?.length) {
      const keys = Object.keys(element);
      const key = keys.find(d => elementKeys.includes(d));
      if (key) {
        this.constructTree(element[key], treeObject, time);
      } else if (keys.includes('buckets')) {
        this.constructTree(element.buckets, treeObject, time);
      }
    } else {
      let hasGeoHashes = false;
      for (const el of element) {
        if (el?.key_as_string) {
          this.constructTree(el, treeObject, el.key);
          continue;
        }
        const keys = Object.keys(el);
        const key = keys.find(d => elementKeys.includes(d));
        if (key) {
          if (treeObject.children) {
            treeObject.children.push({label: el.key, children: []});
            this.constructTree(el, treeObject.children[treeObject.children.length - 1], time);
          }
        } else {
          hasGeoHashes = true;
          break;
        }
      }
      if (treeObject.children && hasGeoHashes) {
        delete treeObject.children;
        treeObject.layer = this.constructGeoHashLayers(element, treeObject.label, time);
      } else if (treeObject.layer && hasGeoHashes) {
        const layerGrp: L.LayerGroup = treeObject.layer as L.LayerGroup;
        const lry = this.constructGeoHashLayers(element, treeObject.label, time);
        lry.eachLayer(x => {
          layerGrp.addLayer(x);
        });
      }
    }
    return treeObject;
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

  constructGeoHashLayers(element: { key: string, doc_count: number }[], elementName: string, time?: number): L.LayerGroup {
    const layerGroup = new L.LayerGroup();
    const docCounts = element.flatMap(y => [y.doc_count]);
    const maxDocCount = Math.max(...docCounts);
    element.map(x => {
      const geoHashData = ngeoHash.decode_bbox(x.key);
      const poly = L.polygon([[geoHashData[2], geoHashData[1]], [geoHashData[2], geoHashData[3]], [geoHashData[0], geoHashData[3]], [geoHashData[0], geoHashData[1]]]);
      poly.setStyle(this.style(x, maxDocCount));
      poly.bindTooltip(`<h4 style="margin: 0;">${elementName}</h4>Document count: ${x.doc_count}`);
      if (time) {
        const geoJson = poly.toGeoJSON();
        geoJson.properties = {time};
        const fff = L.geoJSON(geoJson);
        fff.setStyle(this.style(x, maxDocCount));
        fff.bindTooltip(`<h4 style="margin: 0;">${elementName}</h4>Document count: ${x.doc_count}`);
        // @ts-ignore
        fff.feature = fff.getLayers()[0].feature;
        layerGroup.addLayer(fff);
        this.geoJson.addLayer(fff);
      } else {
        poly.setStyle(this.style(x, maxDocCount));
        poly.bindTooltip(`<h4 style="margin: 0;">${elementName}</h4>Document count: ${x.doc_count}`);
        layerGroup.addLayer(poly);
      }
    });
    return layerGroup;
  }

  ngOnInit(): void {
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

  private updateTimeline(leafletLayers: Layer[]): void {
    console.log(leafletLayers);
  }
}
