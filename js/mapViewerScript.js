/**
 * Import charts 
 */
function importChart(src) {
    let fr = new FileReader();

    fr.onload = function () {
        let jsonChart = JSON.parse(fr.result);
        let legendTitle = jsonChart['legend_title'];
        let legends = jsonChart['legends'];
        drawLegend(map, legends, legendTitle)
        mapCharts = jsonChart;
    };
    fr.onerror = function (e) {
        console.error("reading failed");
    };
    fr.readAsText(src.files[0]);
}

const selectChartElement = document.getElementById("select_chart");
selectChartElement?.addEventListener("click", onInputFileClick, false)
function putChart() {
    importChart(selectChartElement);
}

// Show/hide close popup cross button
const checkboxHideClosePopupElement = document.getElementById("checkbox-hide-close-popup");
checkboxHideClosePopupElement?.addEventListener("change", (event) => {
    const closeCrosses = document.querySelectorAll('button.gm-ui-hover-effect');
    if (event.currentTarget.checked) {
        closeCrosses.forEach(closeCross => {
            closeCross.style.setProperty("display", "none", "important");
        });
    } else {
        closeCrosses.forEach(closeCross => {
            closeCross.style.setProperty("display", "block", "important");
        });
    }
});

// Show/hide map zoom buttons
const checkboxHideMapZoomElement = document.getElementById("checkbox-hide-map-zoom");
checkboxHideMapZoomElement?.addEventListener("change", (event) => {
    if (event.currentTarget.checked) {
        map.setOptions({
            zoomControl: false
        })
    } else {
        map.setOptions({
            zoomControl: true
        })
    }
});

// Print map btn
const printMapBtnElement = document.getElementById("print-map-btn");
printMapBtnElement?.addEventListener("click", async (event) => {
    map.setOptions({
        fullscreenControl: false,
        zoomControl: false
    })

    // printAnyMaps ::
    const $body = $('body');
    const $mapContainer = $('#map');
    const $mapContainerParent = $mapContainer.parent();
    const $printContainer = $('<div style="position:relative;">');

    $printContainer
        .height($mapContainer.height())
        .append($mapContainer)
        .prependTo($body);

    const $content = $body
        .children()
        .not($printContainer)
        .not('script')
        .detach();

    /**
     * Needed for those who use Bootstrap 3.x, because some of
     * its `@media print` styles ain't play nicely when printing.
     */
    const $patchedStyle = $('<style media="print">')
        .text(`
          img { max-width: none !important; }
          a[href]:after { content: ""; }
        `)
        .appendTo('head');

    window.print();

    $body.prepend($content);
    $mapContainerParent.prepend($mapContainer);

    $printContainer.remove();
    $patchedStyle.remove();

    map.setOptions({
        fullscreenControl: true,
        zoomControl: true
    })
});

function addLegendRow(legendName = "", legendColor = "#000000") {
    var tbody = document.querySelector("#legend-table tbody");
    var row = tbody.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = `<button class="btn btn-sm btn-danger rounded-2 shadow-none" onclick="deleteTableRow(this)">-</button>`;
    cell2.innerHTML = `<input class="form-control form-control-sm shadow-none" type="text" placeholder="Legend name" value="${legendName}">`;
    cell3.innerHTML = `<input class="form-control form-control-sm shadow-none" type="color" value="${legendColor}">`;
}

function deleteTableRow(deleteBtn) {
    var rowIndex = deleteBtn.parentNode.parentNode.sectionRowIndex;
    var tbody = deleteBtn.parentNode.parentNode.parentNode;
    tbody.deleteRow(rowIndex);
}

function addChartCountryRow() {
    var tbody = document.querySelector("#chart-table tbody");
    var row = tbody.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    cell1.innerHTML = `<button class="btn btn-sm btn-danger rounded-2 shadow-none" onclick="deleteTableRow(this)">-</button>`;
    cell2.innerHTML = `<input class="form-control form-control-sm shadow-none" type="text"
									placeholder="Country name, e.g. Misr">

								<table class="table">
									<tbody>
									</tbody>
									<tfoot>
										<tr>
											<td colspan="3">
												<button class="btn btn-sm btn-success rounded-2 shadow-none"
													id="add-legend-btn" onclick="addChartCountryDetailsRow(this)">+</button>
											</td>
										</tr>
									</tfoot>
								</table>`;
}

function addChartCountryDetailsRow(addBtn) {
    var table = addBtn.parentNode.parentNode.parentNode.parentNode;
    var tbody = table.tBodies[0];
    var row = tbody.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = `<button class="btn btn-sm btn-danger rounded-2 shadow-none" onclick="deleteTableRow(this)">-</button>`;
    cell2.innerHTML = `<input class="form-control form-control-sm shadow-none" type="text" placeholder="Column name e.g. Hanbali">`;
    cell3.innerHTML = `<input class="form-control form-control-sm shadow-none" type="number" min="0" placeholder="Value e.g. 100">`;
    // console.log(tbody)
}

let chartTemplate = {
    legend_title: "",
    legends: [],
    unit: "",
    chart_caption: "",
    chart_max_value: 0,
    charts: []
}

const legendTitleElement = document.getElementById("legend-title-input");
const unitElement = document.getElementById("chart-unit-input");
const chartCaptionElement = document.getElementById("chart-caption-input");
const chartMaxValueElement = document.getElementById("chart-max-value-input");

function generateChart() {

    let mapChartsTemplate = chartTemplate;
    mapChartsTemplate.legend_title = legendTitleElement.value;
    mapChartsTemplate.unit = unitElement.value;
    mapChartsTemplate.chart_caption = chartCaptionElement.value;
    mapChartsTemplate.chart_max_value = chartMaxValueElement.value;

    const legendsTableBodyElement = document.querySelector("#legend-table tbody");
    let legendsTableBodyRows = legendsTableBodyElement.rows;

    for (let legendIndex = 0; legendIndex < legendsTableBodyRows.length; legendIndex++) {
        const legend = legendsTableBodyRows[legendIndex];
        let legendName = legend.cells[1].firstChild.value;
        let legendColor = legend.cells[2].firstChild.value;
        mapChartsTemplate.legends.push({
            name: legendName,
            color: legendColor
        });
    }

    const chartsTableBodyElement = document.querySelector("#chart-table tbody");
    let chartsTableBodyRows = chartsTableBodyElement.rows;

    for (let chartIndex = 0; chartIndex < chartsTableBodyRows.length; chartIndex++) {
        const chart = chartsTableBodyRows[chartIndex];
        let countryName = chart.cells[1].firstChild.value;
        const chartPropertiesTableBodyElement = chart.cells[1].querySelector("table tbody");
        let chartPropertiesTableBodyRows = chartPropertiesTableBodyElement.rows;

        let countryProperties = [];

        for (let propertyIndex = 0; propertyIndex < chartPropertiesTableBodyRows.length; propertyIndex++) {
            const properties = chartPropertiesTableBodyRows[propertyIndex];
            let colName = properties.cells[1].firstChild.value;
            let colValue = properties.cells[2].firstChild.value;
            countryProperties.push({
                name: colName,
                value: colValue
            });
        }

        mapChartsTemplate.charts.push({
            country_name: countryName,
            properties: countryProperties
        });
    }

    exportGeneratedChart(mapChartsTemplate);
}

function exportGeneratedChart(mapChartsTemplate) {

    if (mapChartsTemplate) {
        let jsonValue = mapChartsTemplate;
        let fileName = getFileName("charts", "json");

        let fileToSave = new Blob([JSON.stringify(jsonValue, null, 2)], {
            type: "application/json",
            name: fileName,
        });

        saveAs(fileToSave, fileName);
    }
}

/**
 * Import charts for editing
 */
function importChartForEdit(src) {
    let fr = new FileReader();

    fr.onload = function () {
        let jsonChart = JSON.parse(fr.result);
        legendTitleElement.value = jsonChart.legend_title;
        unitElement.value = jsonChart.unit;
        chartCaptionElement.value = jsonChart.chart_caption;
        chartMaxValueElement.value = jsonChart.chart_max_value;

        let legends = jsonChart.legends;
        let legendTableBodyElement = document.querySelector("#legend-table tbody");
        legendTableBodyElement.innerHTML = "";

        for (let legendIndex = 0; legendIndex < legends.length; legendIndex++) {
            const legend = legends[legendIndex];
            addLegendRow(legend.name, legend.color);
        }

        let chartTbodyElement = document.querySelector("#chart-table tbody");
        chartTbodyElement.innerHTML = "";
        
        let charts = jsonChart.charts;
        for (let chartIndex = 0; chartIndex < charts.length; chartIndex++) {
            const chart = charts[chartIndex];
            let row = chartTbodyElement.insertRow(-1);
            let cell1 = row.insertCell(0);
            let cell2 = row.insertCell(1);
            let chartColumns = chart.properties;

            cell1.innerHTML = `<button class="btn btn-sm btn-danger rounded-2 shadow-none" onclick="deleteTableRow(this)">-</button>`;
            cell2.innerHTML = `<input class="form-control form-control-sm shadow-none" type="text"
									placeholder="Country name, e.g. Misr" value="${chart.country_name}">

								<table class="table">
									<tbody>
                                        ${Object.values(chartColumns).map((item, i) =>`
                                        <tr>
                                            <td><button class="btn btn-sm btn-danger rounded-2 shadow-none" onclick="deleteTableRow(this)">-</button></td>
                                            <td><input class="form-control form-control-sm shadow-none" type="text" placeholder="Column name e.g. Hanbali" value="${item.name}"></td>
                                            <td><input class="form-control form-control-sm shadow-none" type="number" min="0" placeholder="Value e.g. 100" value="${item.value}"></td>
                                        </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="3">
                                                <button class="btn btn-sm btn-success rounded-2 shadow-none"
                                                    id="add-legend-btn" onclick="addChartCountryDetailsRow(this)">+</button>
                                            </td>
                                        </tr>
                                    </tfoot>
								</table >`;
        }
    };

    fr.onerror = function (e) {
        console.error("reading failed");
    };

    fr.readAsText(src.files[0]);
}

const selectChartEditElement = document.getElementById("select_chart_edit");
selectChartEditElement?.addEventListener("click", onInputFileClick, false)

function putChartEdit() {
    importChartForEdit(selectChartEditElement);
}