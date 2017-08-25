function exportAsCSV(data, name){
  var csvContent = "data:text/csv;charset=utf-8,";

  data.forEach(function(item, index){

     dataString = item.toString() + ",";
     csvContent += index < data.length ? dataString+ "\n" : dataString;

  });

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", name + ".csv");
  document.body.appendChild(link); // Required for FF

  link.click();
}


function chart(vel, yaw, accel){
  Highcharts.chart('chart', {

    title: {
        text: '10 sec'
    },

    yAxis: {
        title: {
            text: 'Amount'
        }
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },

    plotOptions: {
        series: {
            pointStart: 0
        }
    },

    series: [{
        name: 'Velocity',
        data: vel
    }, {
        name: 'Yaw',
        data: yaw
    }, {
        name: 'Accel',
        data: accel
    }]
  });
}

function chart2(p, i, d, e){
  Highcharts.chart('chart2', {

    title: {
        text: '10 sec'
    },

    yAxis: {
        title: {
            text: 'Amount'
        }
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },

    plotOptions: {
        series: {
            pointStart: 0
        }
    },

    series: [{
        name: 'Error',
        data: e
    },{
        name: 'Proportional',
        data: p
    }, {
        name: 'Integral',
        data: i
    }, {
        name: 'Derivative',
        data: d
    }]
  });
}
