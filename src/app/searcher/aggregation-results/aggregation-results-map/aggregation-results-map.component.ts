import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {AggregationData, AggregationDistance} from '../aggregation-results.component';
import * as ngeoHash from 'ngeohash';

import * as L from 'leaflet';
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
    timeDimensionControlOptions: {
      timeSliderDragUpdate: true,
      loopButton: true,
      playerOptions: {
        transitionTime: 1000,
        loop: true
      }
    }

  };
  leafletLayers: L.Layer[] = [];
  treeLayers: L.Control.Layers.TreeObject[];
  geoJson: L.GeoJSON = new L.GeoJSON();
  hasTimeAgg = false;
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
    this.hasTimeAgg = false;
    this.leafletLayers = [];
    this.changeDetectorRef.detectChanges();
    const treeGroupLayers: L.Control.Layers.TreeObject[] = [];
    const layers: L.Layer[] = [];
    if (val.geoData) {
      for (const element of val.geoData) {
        debugger
        let treeGroup: L.Control.Layers.TreeObject | undefined;
        if (element.agg_geohash && element.agg_geohash.length > 0) {
          treeGroup = this.constructTree(element, {label: element.name, children: []}, this.constructGeoHashLayers);
        }
        if (element.agg_distance && element.agg_distance.length > 0) {
          treeGroup = this.constructTree(element.agg_distance, {
            label: element.name,
            children: []
          }, this.constructDistanceLayers);
        }
        if (element.agg_centroid) {
          treeGroup = this.constructTree(element.agg_centroid, {
            label: element.name,
            children: []
          }, this.constructCentroidLayers);
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

    this.treeLayers = treeGroupLayers;
    this.isReady = true;
    this.changeDetectorRef.detectChanges();
  }

  onMapReady(map: L.Map): void {
    this.map = map;
    if (this.hasTimeAgg) {
      this.convertTreeLayersToTimeDimension(this.treeLayers);
    }
    const overlaysTree = {
      label: 'Un/select all',
      selectAllCheckbox: true,
      children: this.treeLayers,
    };
    map.on('baselayerchange', (x => {
      console.log(x);
    }));
    const treeLayer = L.control.layers.tree(undefined, overlaysTree);
    treeLayer.addTo(map);
  }

  convertTreeLayersToTimeDimension(objects: L.Control.Layers.TreeObject[]): void {
    debugger
    for (const treeElLayer of objects) {
      if (treeElLayer.layer) {
        treeElLayer.layer = L.timeDimension.layer.cTreeTimeDimension(treeElLayer.layer, {
          updateDimensions: true,
          duration: 'PT22H',
          updateTimeDimensionMode: 'replace',
        });
      } else if (treeElLayer.children) {
        for (const element of treeElLayer.children) {
          this.convertTreeLayersToTimeDimension([element]);
        }
      }
    }
  }

  // tslint:disable-next-line:no-any
  constructTree(element: any, treeObject: L.Control.Layers.TreeObject, layerFunction: (el: any, label: string, time?: number) => L.LayerGroup, time?: number): any {
    const elementKeys = ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term', 'fact_val_reverse', 'agg_geohash', 'agg_distance', 'agg_centroid'];
    if (!element?.length) {
      const keys = Object.keys(element);
      const key = keys.find(d => elementKeys.includes(d));
      if (key) {
        this.constructTree(element[key], treeObject, layerFunction, time);
      } else if (keys.includes('buckets')) {
        this.constructTree(element.buckets, treeObject, layerFunction, time);
      } else if (keys.includes('location')) {
        delete treeObject.children;
        treeObject.layer = layerFunction(element, treeObject.label, time);
      }
    } else {
      let hasGeoHashes = false;
      for (const el of element) {
        if (el?.key_as_string) {
          this.hasTimeAgg = true;
          this.constructTree(el, treeObject, el.key);
          continue;
        }
        const keys = Object.keys(el);
        const key = keys.find(d => elementKeys.includes(d));
        if (key) {
          if (treeObject.children) {
            const existingLabel = treeObject.children.find(x => x.label === el.key);
            if (existingLabel) {
              this.constructTree(el, existingLabel, layerFunction, time);
            } else {
              treeObject.selectAllCheckbox = true;
              treeObject.collapsed = true;
              treeObject.children.push({label: el.key, children: []});
              this.constructTree(el, treeObject.children[treeObject.children.length - 1], layerFunction, time);
            }

          }
        } else {
          hasGeoHashes = true;
          break;
        }
      }
      if (treeObject.children && hasGeoHashes) {
        delete treeObject.children;
        treeObject.layer = layerFunction(element, treeObject.label, time);
      } else if (treeObject.layer && hasGeoHashes) {
        const layerGrp: L.LayerGroup = treeObject.layer as L.LayerGroup;
        const lry = layerFunction(element, treeObject.label, time);
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
      opacity: 0.5,
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

  constructDistanceLayers(element: AggregationDistance[], elementName: string, time?: number): L.LayerGroup {
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


  private constructCentroidLayers(element: { location: { lat: number; lon: number }; count: number }, elementName: string, time?: number): L.LayerGroup {
    const layerGroup = new L.LayerGroup();
    const mapMarker = L.marker([element.location.lat, element.location.lon], {
      title: `${elementName}\nDocument count: ${element.count}`, icon: L.icon({
        iconSize: [25, 41],
        iconAnchor: [13, 41],
        iconUrl: 'assets/marker-icon.png',
        shadowUrl: 'assets/marker-shadow.png'
      })
    });
    if (time) {
      debugger
      const geoJson = mapMarker.toGeoJSON();
      geoJson.properties = {time};
      const fff = L.geoJSON(geoJson);
      // @ts-ignore
      mapMarker.feature = {time};
      layerGroup.addLayer(mapMarker);
      this.geoJson.addLayer(mapMarker);
    } else {
      layerGroup.addLayer(mapMarker);
    }
    return layerGroup;
  }

}

L.TimeDimension.Layer.CTreeTimeDimension = L.TimeDimension.Layer.GeoJson.extend({

  // tslint:disable-next-line:typedef no-any
  initialize(layer: any, options: any) {
    L.TimeDimension.Layer.prototype.initialize.call(this, layer, options);
    this._updateTimeDimension = this.options.updateTimeDimension || false;
    this._updateTimeDimensionMode = this.options.updateTimeDimensionMode || 'extremes'; // 'union', 'replace' or extremes
    this._duration = this.options.duration || null;
    this._addlastPoint = this.options.addlastPoint || false;
    this._waitForReady = this.options.waitForReady || false;
    this._defaultTime = 0;
    this._availableTimes = [];
    this._loaded = false;
    if (this._baseLayer.getLayers().length === 0) {
      if (this._waitForReady) {
        this._baseLayer.on('ready', this._onReadyBaseLayer, this);
      } else {
        this._loaded = true;
      }
    } else {
      this._loaded = true;
      this._setAvailableTimes();
    }
    // reload available times if data is added to the base layer
    this._baseLayer.on('layeradd', (() => {
      if (this._loaded) {
        this._setAvailableTimes();
      }
    }));
  },

  // tslint:disable-next-line:typedef no-any
  onAdd(map: any) {
    L.TimeDimension.Layer.prototype.onAdd.call(this, map);
    if (this._loaded) {
      this._setAvailableTimes();
    }
  },

  // tslint:disable-next-line:no-any typedef
  eachLayer(method: { call: (arg0: any, arg1: any) => void; }, context: any) {
    if (this._currentLayer) {
      method.call(context, this._currentLayer);
    }
    return L.TimeDimension.Layer.prototype.eachLayer.call(this, method, context);
  },

  // tslint:disable-next-line:typedef no-any
  isReady(time: any) {
    return this._loaded;
  },

  _update(): void {
    if (!this._map) {
      return;
    }
    if (!this._loaded) {
      return;
    }
    debugger
    const time = this._timeDimension.getCurrentTime();

    const maxTime = this._timeDimension.getCurrentTime();
    let minTime = 0;
    if (this._duration) {
      const date = new Date(maxTime);
      L.TimeDimension.Util.subtractTimeDuration(date, this._duration, true);
      minTime = date.getTime();
    }

    // new coordinates:
    // @ts-ignore
    const layer = L.geoJSON(null, this._baseLayer.options);
    const layers = this._baseLayer.getLayers();
    for (let i = 0, l = layers.length; i < l; i++) {
      const feature = this._getFeatureBetweenDates(layers[i].feature, minTime, maxTime);
      if (feature) {
        layer.addLayer(layers[i]);
      }
    }

    if (this._currentLayer) {
      this._map.removeLayer(this._currentLayer);
    }
    if (layer.getLayers().length) {
      layer.addTo(this._map);
      this._currentLayer = layer;
    }
  },

  // tslint:disable-next-line:typedef
  _setAvailableTimes() {
    const times = [];
    debugger
    const layers = this._baseLayer.getLayers();
    for (let i = 0, l = layers.length; i < l; i++) {
      if (layers[i].feature) {
        const featureTimes = this._getFeatureTimes(layers[i].feature);
        for (let j = 0, m = featureTimes.length; j < m; j++) {
          times.push(featureTimes[j]);
        }
      }
    }
    this._availableTimes = L.TimeDimension.Util.sort_and_deduplicate(times);
    if (this._timeDimension && (this._updateTimeDimension || this._timeDimension.getAvailableTimes().length === 0)) {
      this._timeDimension.setAvailableTimes(this._availableTimes, this._updateTimeDimensionMode);
    }
  },

  // tslint:disable-next-line:typedef no-any max-line-length
  _getFeatureTimes(feature: { featureTimes: string | any[]; properties: { hasOwnProperty: (arg0: string) => any; coordTimes: any; times: any; linestringTimestamps: any; time: any; }; }) {
    if (!feature.featureTimes) {
      if (!feature.properties) {
        feature.featureTimes = [];
      } else if (feature.properties.hasOwnProperty('coordTimes')) {
        feature.featureTimes = feature.properties.coordTimes;
      } else if (feature.properties.hasOwnProperty('times')) {
        feature.featureTimes = feature.properties.times;
      } else if (feature.properties.hasOwnProperty('linestringTimestamps')) {
        feature.featureTimes = feature.properties.linestringTimestamps;
      } else if (feature.properties.hasOwnProperty('time')) {
        feature.featureTimes = [feature.properties.time];
      } else {
        feature.featureTimes = [];
      }
      // String dates to ms
      for (let i = 0, l = feature.featureTimes.length; i < l; i++) {
        let time = feature.featureTimes[i];
        if (typeof time === 'string' || time instanceof String) {
          time = Date.parse(time.trim());
          // @ts-ignore
          feature.featureTimes[i] = time;
        }
      }
    }
    return feature.featureTimes;
  },

  // tslint:disable-next-line:typedef no-any
  _getFeatureBetweenDates(feature: { geometry: { coordinates: any[]; type: any; }; properties: any; }, minTime: number, maxTime: number) {
    const featureTimes = this._getFeatureTimes(feature);
    if (featureTimes.length === 0) {
      return feature;
    }

    let indexMin = null;
    let indexMax = null;
    const l = featureTimes.length;

    if (featureTimes[0] > maxTime || featureTimes[l - 1] < minTime) {
      return null;
    }

    if (featureTimes[l - 1] > minTime) {
      for (let i = 0; i < l; i++) {
        if (indexMin === null && featureTimes[i] > minTime) {
          // set index_min the first time that current time is greater the minTime
          indexMin = i;
        }
        if (featureTimes[i] > maxTime) {
          indexMax = i;
          break;
        }
      }
    }
    if (indexMin === null) {
      indexMin = 0;
    }
    if (indexMax === null) {
      indexMax = l;
    }
    let newCoordinates = [];
    if (feature.geometry.coordinates[0].length) {
      newCoordinates = feature.geometry.coordinates.slice(indexMin, indexMax);
    } else {
      newCoordinates = feature.geometry.coordinates;
    }
    return {
      type: 'Feature',
      properties: feature.properties,
      geometry: {
        type: feature.geometry.type,
        coordinates: newCoordinates
      }
    };
  },

  _onReadyBaseLayer(): void {
    this._loaded = true;
    this._setAvailableTimes();
    this._update();
  },
});

// tslint:disable-next-line:only-arrow-functions typedef no-any
L.timeDimension.layer.cTreeTimeDimension = function (layer: any, options: any) {
  return new L.TimeDimension.Layer.CTreeTimeDimension(layer, options);
};
