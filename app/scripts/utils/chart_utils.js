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

var customRenderer = function(args) {
  args = args || {};

  var graph = this.graph;

  var series = args.series || graph.series;
  var vis = args.vis || graph.vis;

  var dotSize = this.dotSize;

  vis.selectAll('*').remove();

  series.forEach( function(series) {

    if (series.disabled) {
      return;
    }

    var nodes = vis.selectAll('path')
      .data(series.stack.filter( function(d) { return d.y !== null; } ))
      .enter().append('svg:circle')
        .attr('cx', function(d) { return graph.x(d.x); })
        .attr('cy', function(d) { return graph.y(d.y); })
        .attr('r', function(d) { return ('r' in d) ? d.r : dotSize; });
    if (series.className) {
      nodes.classed(series.className, true);
    }

    Array.prototype.forEach.call(nodes[0], function(n) {
      if (!n) {
        return;
      }
      n.setAttribute('data-color', series.color);
      n.setAttribute('fill', 'white');
      n.setAttribute('stroke', series.color);
      n.setAttribute('stroke-width', dotSize - 1);
    } );

  }, this );
};

Rickshaw.Graph.Renderer.ScatterPlot.prototype.render = customRenderer;

var colorList = [
  '#27aae1',
  '#f15a29',
  '#8dc63f',
  '#594a42',
  '#00a14b',
  '#7f3f98',
  '#a97c50',
  '#931f63',
  '#da1c5c',
  '#da1c5c',
  '#be1e2d',
  '#1c75bc',
  '#262262',
  '#fbb040',
  '#00a79d',
  '#754c29'
];

var buildFormatter = function(series, x, y) {
  var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + ' padding: 4px;"></span>';
  var content = '';
  if (series.noData != null && series.noData) {
    content = swatch + '&nbsp;&nbsp;No Data&nbsp;&nbsp;<br>';
  } else {
    content = swatch + '&nbsp;&nbsp;' + parseFloat(y) + '&nbsp;' + series.unit + '&nbsp;&nbsp;<br>';
  }
  return content;
};

var pointsComparator = function(a, b) {
  if (a.x < b.x) {
    return -1;
  } else if (a.x > b.x) {
    return 1;
  } else {
    if (a.y < b.y) {
      return -1;
    } else if (a.y > b.y) {
      return 1;
    } else {
      return 0;
    }
  }
};

var buildChart = function(seriesByDataSource) {
  for (var datastreamId in seriesByDataSource) {
    // Build Graph

    var data = seriesByDataSource[datastreamId];
    data.current_min_value = parseFloat(data.min_value) - 0.25*(parseFloat(data.max_value) - parseFloat(data.min_value));
    data.current_max_value = parseFloat(data.max_value) + 0.25*(parseFloat(data.max_value) - parseFloat(data.min_value));
    data.step = (data.current_max_value - data.current_min_value) / 10;
    data.zoom = 0;
    var series = data.series;
    for (var i = 0; i < series.length; i++) {
      series[i].color = colorList[i % colorList.length];
      series[i].enabledColor = series[i].color;
      series[i].disabledColor = d3.interpolateRgb(series[i].color, d3.rgb('#d8d8d8'))(0.9).toString();
      series[i].borderColor = '#9b9b9b';
      series[i].borderWidth = '1px';
      series[i].unit = data.unit;
      var lastReported = new Date(Date.parse(series[i].at));
      var now = new Date();
      series[i].hasNotReported = Math.round(Math.abs(now.getTime() - lastReported.getTime()) / 1000 / 3600 * 100) / 100;
      series[i].lastReported = _toEuroFormat(series[i].at);
      series[i].data.sort(pointsComparator);
    }

    // console.log(seriesByDataSource[datastreamId].graph);
    var graph = seriesByDataSource[datastreamId].graph;
    if (seriesByDataSource[datastreamId].graph == null) {
      graph = new Rickshaw.Graph( {
        element: document.querySelector('#graph-' + datastreamId),
        height: 200,
        width: 600,
        renderer: 'scatterplot',
        fill: false,
        dotSize: 2,
        min: parseFloat(data.min_value) - 0.25*(parseFloat(data.max_value) - parseFloat(data.min_value)),
        max: parseFloat(data.max_value) + 0.25*(parseFloat(data.max_value) - parseFloat(data.min_value)),
        padding: {
          top: 0.02,
          right: 0.02,
          bottom: 0.02,
          left: 0.02
        },
        interpolation: 'linear',
        series: series
      });

      graph.render();

      seriesByDataSource[datastreamId].graph = graph;
    }


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

    var slider = new Rickshaw.Graph.RangeSlider({
      graph: graph,
      element: document.querySelector('#slider-' + datastreamId)
    });

    $('#vslider-' + datastreamId).slider({
      orientation: 'vertical',
      range: true,
      max: graph.max,
      min: graph.min,
      datastreamId: datastreamId,
      values: [ graph.min, graph.max ],
      slide: function( event, ui ) {
        var dsid = event.target.id.substring(event.target.id.indexOf('-') + 1);
        // console.log(dsid);
        // console.log(ui);
        _seriesByDataSource[dsid].graph.min = ui.values[0];
        _seriesByDataSource[dsid].graph.max = ui.values[1];
        _seriesByDataSource[dsid].graph.update();
      }
    });

  }
};

var updateChart = function(seriesByDataSource, datastream) {
  for (var datastreamId in seriesByDataSource) {
    seriesByDataSource[datastreamId].id = datastreamId;
    var data = seriesByDataSource[datastreamId];
    var series = data.series;
    for (var i = 0; i < series.length; i++) {
      series[i].color = colorList[i % colorList.length];
      series[i].enabledColor = series[i].color;
      series[i].disabledColor = d3.interpolateRgb(series[i].color, d3.rgb('#d8d8d8'))(0.9).toString();
      series[i].unit = data.unit;
      var lastReported = new Date(Date.parse(series[i].at));
      var now = new Date();
      series[i].hasNotReported = Math.round(Math.abs(now.getTime() - lastReported.getTime()) / 1000 / 3600 * 100) / 100;
      series[i].lastReported = _toEuroFormat(series[i].at);
      series[i].data.sort(pointsComparator);
    }
    var graph = _seriesByDataSource[datastreamId].graph;
    graph.min_value = parseFloat(data.min_value) - 0.25*(parseFloat(data.max_value) - parseFloat(data.min_value));
    graph.max_value = parseFloat(data.max_value) + 0.25*(parseFloat(data.max_value) - parseFloat(data.min_value));
    graph.min = graph.min_value;
    graph.max = graph.max_value;
    for (i = 0; i < seriesByDataSource[datastreamId].series.length; i++) {
      graph.series[i] = seriesByDataSource[datastreamId].series[i];
    }
    seriesByDataSource[datastreamId].graph = graph;
    graph.update();
  }
};
