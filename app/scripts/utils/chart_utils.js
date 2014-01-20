/*jshint sub:true*/
'use strict';

var defaultKey    = '', // Unique master Xively API key to be used as a default
  defaultFeeds  = [], // Comma separated array of Xively Feed ID numbers
  applicationName = '', // Replaces Xively logo in the header
  dataDuration  = '', // Default duration of data to be displayed // ref: https://xively.com/dev/docs/api/data/read/historical_data/
  dataInterval  = 0, // Default interval for data to be displayed (in seconds)
  dataColor   = '000000', // CSS HEX value of color to represent data (omit leading #)
  hideForm    = 0; // To hide input form use value of 1, otherwise set to 0

// Parse Xively ISO Date Format to Date Object
Date.prototype.parseISO = function(iso){
  var stamp= Date.parse(iso);
  if(!stamp) {
    throw iso +' Unknown date format';
  }
  return new Date(stamp);
};

var colorList = [
  '#000000',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#00FFFF',
  '#FF00FF',
  '#C0C0C0',
  '#808080',
  '#800000',
  '#808000',
  '#008000',
  '#800080',
  '#008080',
  '#000080'
];

var buildFormatter = function(series, x, y) {
  var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + ' padding: 4px;"></span>';
  var content = swatch + '&nbsp;&nbsp;' + parseFloat(y) + '&nbsp;&nbsp;<br>';
  return content;
};

var buildChart = function(seriesByDataSource) {
  for (var datastreamId in seriesByDataSource) {
    // Build Graph

    var data = seriesByDataSource[datastreamId];
    var series = data.series;
    for (var i = 0; i < series.length; i++) {
      series[i].color = colorList[i % colorList.length];
    }
    var graph = new Rickshaw.Graph( {
      element: document.querySelector('#graph-' + datastreamId),
      height: 200,
      renderer: 'line',
      min: parseFloat(data.min_value) - 0.25*(parseFloat(data.max_value) - parseFloat(data.min_value)),
      max: parseFloat(data.max_value) + 0.25*(parseFloat(data.max_value) - parseFloat(data.min_value)),
      padding: {
        top: 0.02,
        right: 0.02,
        bottom: 0.02,
        left: 0.02
      },
      series: series
    });

    graph.render();

    var ticksTreatment = 'glow';

    // Define and Render X Axis (Time Values)
    var xAxis = new Rickshaw.Graph.Axis.Time( {
      graph: graph,
      ticksTreatment: ticksTreatment
    });
    xAxis.render();

    // Define and Render Y Axis (Datastream Values)
    var yAxis = new Rickshaw.Graph.Axis.Y( {
      graph: graph,
      tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
      ticksTreatment: ticksTreatment
    });
    yAxis.render();

    // Enable Datapoint Hover Values
    var hoverDetail = new Rickshaw.Graph.HoverDetail({
      graph: graph,
      formatter: buildFormatter
    });

    //Legend
    var legend = new Rickshaw.Graph.Legend({
      graph: graph,
      element: document.querySelector('#legend-' + datastreamId)
    });

    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
      graph: graph,
      legend: legend
    });

    var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
      graph: graph,
      legend: legend
    });

    var order = new Rickshaw.Graph.Behavior.Series.Order({
      graph: graph,
      legend: legend
    });

    var slider = new Rickshaw.Graph.RangeSlider({
      graph: graph,
      element: document.querySelector('#slider-' + datastreamId)
    });
  }

};
