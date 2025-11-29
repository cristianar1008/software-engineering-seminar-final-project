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

    var data = {"OkPercent": 75.71428571428571, "KoPercent": 24.285714285714285};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7571428571428571, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "GET /api/v1/health"], "isController": false}, {"data": [0.0, 500, 1500, "POST /academico/asignar-clase"], "isController": false}, {"data": [0.0, 500, 1500, "DELETE /academico/asignaciones/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "POST /vehiculos"], "isController": false}, {"data": [1.0, 500, 1500, "POST /academico/cursos"], "isController": false}, {"data": [0.0, 500, 1500, "GET /academico/asignaciones (list)"], "isController": false}, {"data": [1.0, 500, 1500, "GET /academico/disponibilidad"], "isController": false}, {"data": [1.0, 500, 1500, "GET /vehiculos"], "isController": false}, {"data": [1.0, 500, 1500, "GET /"], "isController": false}, {"data": [0.0, 500, 1500, "POST /academico/cursos (asignaciones)"], "isController": false}, {"data": [0.0, 500, 1500, "PUT /academico/asignaciones/{id}"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 700, 170, 24.285714285714285, 17.16142857142858, 3, 412, 7.0, 30.899999999999977, 70.94999999999993, 186.8900000000001, 23.836278816358497, 667.320135856148, 4.675375687421255], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /api/v1/health", 100, 0, 0.0, 5.98, 3, 43, 5.0, 7.900000000000006, 10.899999999999977, 43.0, 11.08770373655616, 1.7757650515578223, 1.6891423661159775], "isController": false}, {"data": ["POST /academico/asignar-clase", 30, 30, 100.0, 24.366666666666667, 11, 158, 15.0, 55.10000000000008, 132.69999999999996, 158.0, 1.6627868307283007, 0.4676587961423345, 0.5131256235450615], "isController": false}, {"data": ["DELETE /academico/asignaciones/{id}", 30, 30, 100.0, 8.766666666666666, 6, 22, 7.0, 13.0, 21.45, 22.0, 1.678885220213778, 0.5180934859253455, 0.3344654149644636], "isController": false}, {"data": ["POST /vehiculos", 50, 0, 0.0, 30.220000000000002, 14, 412, 17.0, 25.799999999999997, 124.0499999999991, 412.0, 1.707008978867229, 0.5417753106756341, 0.5167702963367587], "isController": false}, {"data": ["POST /academico/cursos", 30, 0, 0.0, 26.63333333333333, 14, 224, 17.0, 44.800000000000026, 128.29999999999987, 224.0, 1.5590084706126903, 0.40863073585199816, 0.3949285129657538], "isController": false}, {"data": ["GET /academico/asignaciones (list)", 30, 30, 100.0, 5.000000000000002, 3, 12, 4.0, 10.50000000000001, 11.45, 12.0, 1.678040049222508, 0.5194713824253272, 0.3031615323302383], "isController": false}, {"data": ["GET /academico/disponibilidad", 200, 0, 0.0, 8.895000000000001, 4, 187, 6.0, 12.0, 18.94999999999999, 50.88000000000011, 10.37344398340249, 9.235252285399378, 1.8943691649377592], "isController": false}, {"data": ["GET /vehiculos", 50, 0, 0.0, 78.76, 59, 217, 72.0, 99.5, 152.8999999999998, 217.0, 1.7166203179180828, 662.9222215427267, 0.26822192467470046], "isController": false}, {"data": ["GET /", 100, 0, 0.0, 8.030000000000001, 3, 187, 5.0, 11.0, 17.749999999999943, 185.47999999999922, 10.85894233901618, 1.9406117656640245, 1.516434330546205], "isController": false}, {"data": ["POST /academico/cursos (asignaciones)", 50, 50, 100.0, 17.94, 10, 187, 13.0, 18.0, 43.39999999999995, 187.0, 2.5918822248717017, 0.8470190114561195, 0.6815840288217303], "isController": false}, {"data": ["PUT /academico/asignaciones/{id}", 30, 30, 100.0, 18.13333333333334, 14, 27, 17.0, 26.50000000000001, 27.0, 27.0, 1.677008217340265, 0.5175142545698475, 0.4040214132986752], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 170, 100.0, 24.285714285714285], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 700, 170, "422/Unprocessable Entity", 170, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["POST /academico/asignar-clase", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["DELETE /academico/asignaciones/{id}", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /academico/asignaciones (list)", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST /academico/cursos (asignaciones)", 50, 50, "422/Unprocessable Entity", 50, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["PUT /academico/asignaciones/{id}", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
