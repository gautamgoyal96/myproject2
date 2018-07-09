google.charts.load('current', {'packages':['bar']});
google.charts.setOnLoadCallback(barChart);

function barChart() {
  var data = google.visualization.arrayToDataTable([
    ['Week', 'Sales', 'Expenses'],
    ['1', 1000, 400],
    ['2', 1170, 460],
    ['3', 660, 1120],
    ['4', 1030, 540]
  ]);

  var options = {
    chart: {
      title: 'Sales',
      subtitle: 'Today Sales',
    },
    colors: ['#f83272', '#3f8efc'],
    bars: 'horizontal' // Required for Material Bar Charts.
  };

  var chart = new google.charts.Bar(document.getElementById('barchart_material'));

  chart.draw(data, google.charts.Bar.convertOptions(options));
}


/*===============*/

google.charts.load('current', {'packages':['line']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {

var data = new google.visualization.DataTable();
data.addColumn('number', 'X');
data.addColumn('number', 'Sales');
data.addRows([
  [0, 0,],    [1, 30],   [2, 50],  [3, 100],   [4, 40],  [5, 60],
  [6, 120],   [7, 150],  [8, 170],  [9, 130],  [10, 200], [11, 250],
  [12, 300], [13, 320], [14, 350], [15, 290], [16, 340], [17, 400],
  [18, 430], [19, 460], [20, 500], [21, 550], [22, 600], [23, 700], [24, 900]
]);

var options = {
  hAxis: {
    title: 'Time',
    viewWindow: {
            min: 0,
            max: 24
        },
        ticks: [0,2,4,6,8,10,12,14,16,18,20,22,24]
  },
  vAxis: {
    title: 'Popularity',
    logScale: false,
     viewWindow: {
            min: 0,
            max: 1000
        },
        ticks: [0,100,200,300,400,500,600,700,800,900,1000]
  },
  colors: ['#a52714', '#097138']
};

var chart = new google.charts.Line(document.getElementById('linechart_material'));

chart.draw(data, google.charts.Line.convertOptions(options));
}