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

    var data = {"OkPercent": 86.0, "KoPercent": 14.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.86, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "GET /api/v1/health"], "isController": false}, {"data": [0.0, 500, 1500, "POST /academico/asignar-clase"], "isController": false}, {"data": [0.0, 500, 1500, "DELETE /academico/asignaciones/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "POST /vehiculos"], "isController": false}, {"data": [0.9666666666666667, 500, 1500, "POST /academico/cursos"], "isController": false}, {"data": [1.0, 500, 1500, "GET /academico/asignaciones (list)"], "isController": false}, {"data": [1.0, 500, 1500, "GET /academico/disponibilidad"], "isController": false}, {"data": [1.0, 500, 1500, "GET /vehiculos"], "isController": false}, {"data": [1.0, 500, 1500, "GET /"], "isController": false}, {"data": [0.86, 500, 1500, "POST /academico/cursos (asignaciones)"], "isController": false}, {"data": [0.0, 500, 1500, "PUT /academico/asignaciones/{id}"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 700, 98, 14.0, 24.942857142857147, 4, 465, 11.0, 52.69999999999993, 104.94999999999993, 222.99, 23.799809601523187, 749.1198254007718, 4.643353478172175], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /api/v1/health", 100, 0, 0.0, 8.47, 4, 79, 5.5, 15.600000000000023, 29.699999999999932, 78.66999999999983, 10.974539069359086, 1.7576410228270412, 1.6719024363476733], "isController": false}, {"data": ["POST /academico/asignar-clase", 30, 30, 100.0, 18.400000000000002, 12, 43, 16.0, 27.700000000000006, 35.29999999999999, 43.0, 1.7639795378373613, 0.49611924501675775, 0.5386683608220144], "isController": false}, {"data": ["DELETE /academico/asignaciones/{id}", 30, 30, 100.0, 10.76666666666667, 6, 48, 8.5, 15.0, 33.14999999999998, 48.0, 1.7745179226310186, 0.547605140186916, 0.3535172423991483], "isController": false}, {"data": ["POST /vehiculos", 50, 0, 0.0, 25.280000000000005, 14, 223, 19.5, 32.9, 41.24999999999998, 223.0, 1.7059606264287421, 0.541442581630216, 0.5164529240165137], "isController": false}, {"data": ["POST /academico/cursos", 30, 1, 3.3333333333333335, 38.23333333333335, 16, 417, 20.0, 57.10000000000004, 231.09999999999977, 417.0, 1.5591705212826776, 0.406338515409802, 0.3949695636921158], "isController": false}, {"data": ["GET /academico/asignaciones (list)", 30, 0, 0.0, 14.466666666666665, 5, 65, 8.0, 58.10000000000008, 64.45, 65.0, 1.7657445556209534, 0.44919575853443205, 0.3190065847557387], "isController": false}, {"data": ["GET /academico/disponibilidad", 200, 0, 0.0, 12.225000000000007, 5, 162, 8.0, 21.900000000000006, 28.94999999999999, 83.97000000000003, 10.370754472387866, 9.23569362522686, 1.8938780140005185], "isController": false}, {"data": ["GET /vehiculos", 50, 0, 0.0, 136.24, 79, 465, 109.0, 219.29999999999995, 339.99999999999966, 465.0, 1.716148961729878, 746.53652983954, 0.26814827527029345], "isController": false}, {"data": ["GET /", 100, 0, 0.0, 12.479999999999997, 4, 140, 6.0, 25.0, 46.799999999999955, 139.55999999999977, 10.807305738679347, 1.9313837404085161, 1.509223359991354], "isController": false}, {"data": ["POST /academico/cursos (asignaciones)", 50, 7, 14.0, 29.599999999999994, 14, 249, 20.0, 40.9, 61.09999999999992, 249.0, 2.589868434683518, 0.6475176920387444, 0.6481752758209882], "isController": false}, {"data": ["PUT /academico/asignaciones/{id}", 30, 30, 100.0, 30.266666666666662, 17, 87, 23.5, 53.20000000000002, 72.69999999999999, 87.0, 1.7664723547076486, 0.5451223282105635, 0.42557493154919623], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 8, 8.16326530612245, 1.1428571428571428], "isController": false}, {"data": ["422/Unprocessable Entity", 90, 91.83673469387755, 12.857142857142858], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 700, 98, "422/Unprocessable Entity", 90, "400/Bad Request", 8, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["POST /academico/asignar-clase", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["DELETE /academico/asignaciones/{id}", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["POST /academico/cursos", 30, 1, "400/Bad Request", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST /academico/cursos (asignaciones)", 50, 7, "400/Bad Request", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["PUT /academico/asignaciones/{id}", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
