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

    var data = {"OkPercent": 81.42857142857143, "KoPercent": 18.571428571428573};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8142857142857143, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "GET /api/v1/health"], "isController": false}, {"data": [0.0, 500, 1500, "POST /academico/asignar-clase"], "isController": false}, {"data": [0.0, 500, 1500, "DELETE /academico/asignaciones/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "POST /vehiculos"], "isController": false}, {"data": [1.0, 500, 1500, "POST /academico/cursos"], "isController": false}, {"data": [0.0, 500, 1500, "GET /academico/asignaciones (list)"], "isController": false}, {"data": [1.0, 500, 1500, "GET /academico/disponibilidad"], "isController": false}, {"data": [1.0, 500, 1500, "GET /vehiculos"], "isController": false}, {"data": [1.0, 500, 1500, "GET /"], "isController": false}, {"data": [0.8, 500, 1500, "POST /academico/cursos (asignaciones)"], "isController": false}, {"data": [0.0, 500, 1500, "PUT /academico/asignaciones/{id}"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 700, 130, 18.571428571428573, 21.462857142857146, 4, 272, 9.0, 49.0, 104.89999999999986, 205.0, 23.862280552241348, 701.199871900034, 4.643557184250895], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /api/v1/health", 100, 0, 0.0, 6.83, 4, 52, 5.0, 9.900000000000006, 13.899999999999977, 51.81999999999991, 11.096316023080337, 1.7771443630714603, 1.690454394141145], "isController": false}, {"data": ["POST /academico/asignar-clase", 30, 30, 100.0, 36.400000000000006, 16, 170, 21.0, 150.30000000000024, 167.8, 170.0, 1.711644890740001, 0.4814001255206253, 0.5043000620471273], "isController": false}, {"data": ["DELETE /academico/asignaciones/{id}", 30, 30, 100.0, 8.433333333333334, 6, 15, 8.0, 11.0, 13.349999999999998, 15.0, 1.7309023771059313, 0.5341456554350335, 0.3448282079390722], "isController": false}, {"data": ["POST /vehiculos", 50, 0, 0.0, 23.64, 14, 240, 19.0, 23.799999999999997, 27.799999999999983, 240.0, 1.7106298539122105, 0.5429245141811215, 0.5178664596804543], "isController": false}, {"data": ["POST /academico/cursos", 30, 0, 0.0, 28.866666666666667, 15, 221, 19.0, 47.400000000000034, 137.3999999999999, 221.0, 1.563640154279162, 0.4113717359011779, 0.3961018125195455], "isController": false}, {"data": ["GET /academico/asignaciones (list)", 30, 30, 100.0, 8.066666666666665, 4, 49, 5.0, 12.0, 37.44999999999999, 49.0, 1.7291066282420748, 0.5335914985590777, 0.31069884726224783], "isController": false}, {"data": ["GET /academico/disponibilidad", 200, 0, 0.0, 10.069999999999991, 5, 205, 8.0, 12.0, 14.899999999999977, 59.850000000000136, 10.403120936280885, 9.261774626137841, 1.8997886866059817], "isController": false}, {"data": ["GET /vehiculos", 50, 0, 0.0, 115.36, 81, 272, 106.0, 140.8, 237.39999999999995, 272.0, 1.7202229408931395, 697.9115821535471, 0.2687848345145531], "isController": false}, {"data": ["GET /", 100, 0, 0.0, 10.100000000000001, 4, 205, 6.0, 16.0, 27.799999999999955, 203.69999999999933, 10.848340203948796, 1.9387170481666305, 1.5149537589498807], "isController": false}, {"data": ["POST /academico/cursos (asignaciones)", 50, 10, 20.0, 26.00000000000001, 14, 242, 18.0, 47.39999999999998, 56.599999999999966, 242.0, 2.5983474510211506, 0.6383205906043756, 0.6502973483864263], "isController": false}, {"data": ["PUT /academico/asignaciones/{id}", 30, 30, 100.0, 20.46666666666667, 11, 67, 15.5, 42.90000000000002, 59.29999999999999, 67.0, 1.7290069736614604, 0.5335607457783413, 0.4165488480491038], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 10, 7.6923076923076925, 1.4285714285714286], "isController": false}, {"data": ["422/Unprocessable Entity", 120, 92.3076923076923, 17.142857142857142], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 700, 130, "422/Unprocessable Entity", 120, "400/Bad Request", 10, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["POST /academico/asignar-clase", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["DELETE /academico/asignaciones/{id}", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /academico/asignaciones (list)", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST /academico/cursos (asignaciones)", 50, 10, "400/Bad Request", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["PUT /academico/asignaciones/{id}", 30, 30, "422/Unprocessable Entity", 30, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
