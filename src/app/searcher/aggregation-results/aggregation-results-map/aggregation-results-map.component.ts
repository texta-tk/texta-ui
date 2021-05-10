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
  }

  // tslint:disable-next-line:no-any
  @Input() set aggregationData(val: AggregationData) {
    console.log(val);
    const latD: number[] = [];
    const lonD: number[] = [];
    const docCounts: number[] = [];
    if (val.geoData) {
      for (const element of val.geoData) {
        if (element.data && element.data.length > 0) {
          element.data.map(x => {
            const geoHashData = ngeoHash.decode_bbox(x.key);
            latD.push(geoHashData[0]);
            lonD.push(geoHashData[1]);
            docCounts.push(x.doc_count);
          });
        }
      }
    }
    this.data = [{
      type: 'scattergeo',
      mode: 'markers+text',
      text: docCounts,
      lat: latD,
      lon: lonD,
      marker: {
        size: 7,
        line: {
          width: 1
        }
      },
      name: 'Canadian cities',
      textposition: [
        'top right', 'top left', 'top center', 'bottom right', 'top right',
        'top left', 'bottom right', 'bottom left', 'top right', 'top right'
      ],
    }];

    this.layout = {
      title: this.title || '',
      font: {
        family: 'Droid Serif, serif',
        size: 6
      },
      titlefont: {
        size: 16
      },
      geo: {
        scope: 'world',
        resolution: 110,
        showrivers: true,
        rivercolor: '#fff',
        showlakes: true,
        lakecolor: '#fff',
        showland: true,
        showcountries: true,
        landcolor: '#EAEAAE',
        countrycolor: '#d3d3d3',
        countrywidth: 1.5,
        subunitcolor: '#d3d3d3'
      }
    };

  }

  ngOnInit(): void {
  }

}
