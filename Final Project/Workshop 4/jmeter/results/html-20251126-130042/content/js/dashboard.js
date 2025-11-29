/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 85.71428571428571, "KoPercent": 14.285714285714286};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8571428571428571, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "GET /api/v1/health"], "isController": false}, {"data": [0.0, 500, 1500, "POST /academico/asignar-clase"], "isController": false}, {"data": [0.0, 500, 1500, "DELETE /academico/asignaciones/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "POST /vehiculos"], "isController": false}, {"data": [0.9666666666666667, 500, 1500, "POST /academico/cursos"], "isController": false}, {"data": [1.0, 500, 1500, "GET /academico/asignaciones (list)"], "isController": false}, {"data": [1.0, 500, 1500, "GET /academico/disponibilidad"], "isController": false}, {"data": [1.0, 500, 1500, "GET /vehiculos"], "isController": false}, {"data": [1.0, 500, 1500, "GET /"], "isController": false}, {"data": [0.82, 500, 1500, "POST /academico/cursos (asignaciones)"], "isController": false}, {"data": [0.0, 500, 1500, "PUT /academico/asignaciones/{id}"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 700, 100, 14.285714285714286, 22.242857142857154, 3, 344, 9.0, 42.799999999999955, 104.94999999999993, 201.8800000000001, 23.86309402059044, 684.4079182859481, 4.6606939686029865], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /api/v1/health", 100, 0, 0.0, 6.9300000000000015, 3, 43, 5.0, 10.0, 13.0, 42.97999999999999, 11.077877478675086, 1.774191314944057, 1.6876453971419076], "isController": false}, {"data": ["POST /academico/asignar-clase", 30, 30, 100.0, 55.699999999999996, 12, 344, 22.5, 310.4000000000006, 341.8, 344.0, 1.6922382671480145, 0.475942012635379, 0.5222141527527075], "isController": false}, {"data": ["DELETE /academico/asignaciones/{id}", 30, 30, 100.0, 8.799999999999999, 6, 14, 8.5, 11.900000000000002, 13.45, 14.0, 1.7273146015660985, 0.5330384903270383, 0.3441134557807462], "isController": false}, {"data": ["POST /vehiculos", 50, 0, 0.0, 23.92, 14, 204, 20.0, 26.0, 29.799999999999983, 204.0, 1.7098108949150226, 0.5426645906712718, 0.51761853264029], "isController": false}, {"data": ["POST /academico/cursos", 30, 1, 3.3333333333333335, 28.100000000000012, 13, 202, 20.5, 45.800000000000004, 117.2999999999999, 202.0, 1.5621745469693813, 0.40701969641741303, 0.3957305444178296], "isController": false}, {"data": ["GET /academico/asignaciones (list)", 30, 0, 0.0, 11.966666666666667, 6, 41, 9.5, 25.0, 32.749999999999986, 41.0, 1.7241379310344827, 0.24414062500000003, 0.3143521012931035], "isController": false}, {"data": ["GET /academico/disponibilidad", 200, 0, 0.0, 10.774999999999999, 5, 190, 8.0, 12.0, 15.0, 112.44000000000051, 10.39176971838304, 9.25273433440715, 1.897715759118778], "isController": false}, {"data": ["GET /vehiculos", 50, 0, 0.0, 111.86000000000001, 80, 273, 104.5, 144.29999999999998, 175.7999999999999, 273.0, 1.7190991920233798, 680.6675879963899, 0.26860924875365305], "isController": false}, {"data": ["GET /", 100, 0, 0.0, 10.73, 4, 190, 6.0, 11.900000000000006, 19.94999999999999, 189.98, 10.850694444444445, 1.9391377766927085, 1.5152825249565973], "isController": false}, {"data": ["POST /academico/cursos (asignaciones)", 50, 9, 18.0, 23.160000000000004, 14, 222, 17.5, 27.0, 28.89999999999999, 222.0, 2.595514950166113, 0.6412746898359635, 0.6495884486607143], "isController": false}, {"data": ["PUT /academico/asignaciones/{id}", 30, 30, 100.0, 18.83333333333334, 12, 37, 17.0, 29.800000000000004, 34.25, 37.0, 1.7249310027598896, 0.5323029266329347, 0.41556687341881327], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 10, 10.0, 1.4285714285714286], "isController": false}, {"data": ["422/Unprocessable Entity", 90, 90.0, 12.857142857142858], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 700, 100, "422/Unprocessable Entity", 90, "400/Bad Request", 10, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["POST /academico/asignar-clase", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["DELETE /academico/asignaciones/{id}", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST /academico/cursos", 30, 1, "400/Bad Request", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST /academico/cursos (asignaciones)", 50, 9, "400/Bad Request", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["PUT /academico/asignaciones/{id}", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
