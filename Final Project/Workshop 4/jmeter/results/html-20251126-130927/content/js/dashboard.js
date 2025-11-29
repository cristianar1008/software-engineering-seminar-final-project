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

    var data = {"OkPercent": 86.63729809104258, "KoPercent": 13.362701908957415};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8663729809104258, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "GET /api/v1/health"], "isController": false}, {"data": [0.0, 500, 1500, "POST /academico/asignar-clase"], "isController": false}, {"data": [0.0, 500, 1500, "DELETE /academico/asignaciones/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "POST /vehiculos"], "isController": false}, {"data": [0.9666666666666667, 500, 1500, "POST /academico/cursos"], "isController": false}, {"data": [1.0, 500, 1500, "GET /academico/asignaciones (list)"], "isController": false}, {"data": [1.0, 500, 1500, "GET /academico/disponibilidad"], "isController": false}, {"data": [1.0, 500, 1500, "GET /vehiculos"], "isController": false}, {"data": [1.0, 500, 1500, "GET /"], "isController": false}, {"data": [1.0, 500, 1500, "POST /academico/cursos (asignaciones)"], "isController": false}, {"data": [0.0, 500, 1500, "PUT /academico/asignaciones/{id}"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 681, 91, 13.362701908957415, 17.26138032305434, 3, 264, 7.0, 27.0, 83.0, 165.0, 23.199563943585204, 767.1112686409859, 4.490610574793895], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /api/v1/health", 100, 0, 0.0, 7.039999999999998, 3, 82, 5.0, 8.900000000000006, 11.899999999999977, 81.90999999999995, 10.957703265395573, 1.7549446635985098, 1.669337606837607], "isController": false}, {"data": ["POST /academico/asignar-clase", 30, 30, 100.0, 12.733333333333336, 7, 19, 12.0, 18.800000000000004, 19.0, 19.0, 1.69664065151001, 0.4771801832371904, 0.5181050114523245], "isController": false}, {"data": ["DELETE /academico/asignaciones/{id}", 30, 30, 100.0, 8.533333333333335, 6, 29, 7.0, 12.800000000000004, 21.29999999999999, 29.0, 1.701258931609391, 0.5249978734263355, 0.3389226777815583], "isController": false}, {"data": ["POST /vehiculos", 50, 0, 0.0, 20.38, 14, 165, 17.0, 23.9, 25.449999999999996, 165.0, 1.7078252553198758, 0.5420343827919527, 0.517017411278478], "isController": false}, {"data": ["POST /academico/cursos", 30, 1, 3.3333333333333335, 23.666666666666664, 13, 181, 16.5, 31.800000000000026, 107.84999999999991, 181.0, 1.5601435332050548, 0.4065920939726455, 0.3952160473763586], "isController": false}, {"data": ["GET /academico/asignaciones (list)", 30, 0, 0.0, 8.700000000000003, 5, 27, 7.0, 16.400000000000013, 25.349999999999998, 27.0, 1.697985057731492, 0.47816629994906046, 0.30676487859406837], "isController": false}, {"data": ["GET /academico/disponibilidad", 200, 0, 0.0, 8.515, 5, 134, 7.0, 12.0, 17.0, 31.950000000000045, 10.383676859976118, 9.247810098774726, 1.89623786407767], "isController": false}, {"data": ["GET /vehiculos", 50, 0, 0.0, 96.93999999999998, 69, 264, 84.0, 153.79999999999995, 185.94999999999996, 264.0, 1.7152658662092624, 762.9030204759863, 0.2680102915951973], "isController": false}, {"data": ["GET /", 100, 0, 0.0, 7.1499999999999995, 3, 128, 5.0, 9.0, 15.849999999999966, 127.0199999999995, 10.807305738679347, 1.9313837404085161, 1.509223359991354], "isController": false}, {"data": ["POST /academico/cursos (asignaciones)", 31, 0, 0.0, 21.290322580645164, 13, 165, 15.0, 24.0, 80.9999999999998, 165.0, 1.6081340457540074, 0.4182951995901852, 0.4025907655496187], "isController": false}, {"data": ["PUT /academico/asignaciones/{id}", 30, 30, 100.0, 16.6, 11, 41, 13.0, 36.30000000000001, 39.9, 41.0, 1.697792869269949, 0.5239282682512733, 0.4090288094227504], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 1, 1.098901098901099, 0.14684287812041116], "isController": false}, {"data": ["422/Unprocessable Entity", 90, 98.9010989010989, 13.215859030837004], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 681, 91, "422/Unprocessable Entity", 90, "400/Bad Request", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["POST /academico/asignar-clase", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["DELETE /academico/asignaciones/{id}", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST /academico/cursos", 30, 1, "400/Bad Request", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["PUT /academico/asignaciones/{id}", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
