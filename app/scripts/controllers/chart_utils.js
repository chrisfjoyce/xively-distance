
var buildChart = function(scope) {
  scope.chartDatastreams = [];
  scope.$apply(function () {
    for (var datastreamId in scope.seriesByDataSource){
      scope.chartDatastreams.push(
        {
          'id':datastreamId,
          'label':scope.seriesByDataSource[datastreamId].label
        }
      );
    }
  });

  for (var datastreamId in scope.seriesByDataSource) {
    // Build Graph

    var data = scope.seriesByDataSource[datastreamId];
    var series = data.series; 
    var graph = new Rickshaw.Graph( {
      element: document.querySelector('#graph-' + datastreamId),
      width: 600,
      height: 200,
      renderer: 'line',
      min: parseFloat(data.min_value) - .25*(parseFloat(data.max_value) - parseFloat(data.min_value)),
      max: parseFloat(data.max_value) + .25*(parseFloat(data.max_value) - parseFloat(data.min_value)),
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
      formatter: function(series, x, y) {
        var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + ' padding: 4px;"></span>';
        var content = swatch + "&nbsp;&nbsp;" + parseFloat(y) + '&nbsp;&nbsp;<br>';
        return content;
      }
    });

    var slider = new Rickshaw.Graph.RangeSlider({
      graph: graph,
      element: document.querySelector('#slider-' + datastreamId)
    });
  }

};
