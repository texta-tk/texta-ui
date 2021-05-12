import {Component, Input, OnInit} from '@angular/core';
import {AggregationData} from '../aggregation-results.component';
import * as ngeoHash from 'ngeohash';

@Component({
  selector: 'app-aggregation-results-map',
  templateUrl: './aggregation-results-map.component.html',
  styleUrls: ['./aggregation-results-map.component.scss']
})
export class AggregationResultsMapComponent implements OnInit {
  // tslint:disable-next-line:no-any
  data: any[];
  // tslint:disable-next-line:no-any
  layout: Partial<any> | undefined;
  revision = 0;
  title = '';

  constructor() {
  }

  @Input() set yLabel(val: string) {
    this.title = val;
    if (this.layout?.hasOwnProperty('title')) {
      this.layout['title'] = val;
    }
    this.revision += 1;
  }

  // tslint:disable-next-line:no-any
  @Input() set aggregationData(val: AggregationData) {
    console.log(val);
    const latD: (number | null)[] = [];
    const lonD: (number | null)[] = [];
    const docCounts: number[] = [];
    if (val.geoData) {
      for (const element of val.geoData) {
        if (element.data && element.data.length > 0) {
          element.data.map(x => {
            const geoHashData = ngeoHash.decode_bbox(x.key);
            console.log(geoHashData);
            lonD.push(...[geoHashData[1], geoHashData[3], geoHashData[3], geoHashData[1]]);
            latD.push(...[geoHashData[2], geoHashData[2], geoHashData[0], geoHashData[0]]);
            lonD.push(null);
            latD.push(null);
            docCounts.push(x.doc_count);
          });
        }
      }
    }
    console.log(latD);
    console.log(lonD);
    this.data = [{
      type: 'scattermapbox',
      fill: 'toself',
      mode: 'lines+markers',
      text: docCounts,
      lat: latD,
      lon: lonD,
    }];

    this.layout = {
      mapbox: {
        style: 'carto-positron',
        center: {lon: -73, lat: 46},
        zoom: 5
      },
    };

    this.revision += 1;
  }

  ngOnInit(): void {
  }

  // tslint:disable-next-line:no-any
  onClick($event: any): void {
    console.log($event);
  }
}
