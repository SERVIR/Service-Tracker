// Initialize Firebase
firebase.initializeApp(config);
const db = firebase.firestore();
if (typeof google !== "undefined") {
    google.charts.load('visualization', '1', { packages: ["corechart", "controls", "timeline", "charteditor"] });
}

let dashboard;
let dash;
let control;
let is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
let gEvent;
let chart;
let dataTable;
let OArray = [];
let returnCount = 0;

let themeObject = {
    wwrd: "Water & Water Related Disasters",
    lclu: "Land Cover & Land Use Change & Ecosystems",
    afs: "Agriculture & Food Security",
    wac: "Weather & Climate"
};

let hubObject = {
    aza: "Amazonia",
    esa: "Eastern & Southern Africa",
    wa: "West Africa",
    hkh: "Hindu Kush Himalaya",
    mkg: "Mekong"
};

startApp = () => {
    try {
        drawChart();
    } catch (e) {
        setTimeout(startApp, 100);
    }
};

drawChart = () => {

    dash = new google.visualization.Dashboard(document.getElementById('dashboard'));
    chart = new google.visualization.ChartWrapper({
        'chartType': 'Timeline',
        'containerId': 'chartdiv'
    });
    control = new google.visualization.ControlWrapper({
        controlType: 'ChartRangeFilter',
        containerId: 'control_div',
        options: {
            filterColumnIndex: 3,
            'ui': {
                'chartView': { 'columns': [3, 4] },
                height: 50
            }
        }
    });
    dash.bind([control], [chart]);
    dataTable = ResetDataTable();
    google.visualization.events.addListener(chart, "select", selectHandler);
    getData();
    gEvent = google.visualization.events.addListener(chart, 'ready', updateChartHeight);
};

updateChartHeight = () => {
    $("#chartdiv").height($($("#chartdiv svg")[0]).find("g")[0].getBBox().height + 50);
    google.visualization.events.removeListener(gEvent);
    displayTopToastMessage("Try out the new time range slider <br /> Drag the date labels");
    gEvent = google.visualization.events.addListener(chart, 'ready', hidePopups);
};

hidePopups = () => {
    $(".google-visualization-tooltip").hide();
};

selectHandler = () => {
    const selectedItem = chart.getChart().getSelection()[0];
    if (selectedItem) {
        try {
            console.log("The user selected " + dataTable.getValue(selectedItem.row, 1) + " in " + dataTable.getValue(selectedItem.row, 0));
        } catch (e) { }
    }
};

ResetDataTable = () => {
    dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: "string", id: "Role" });
    dataTable.addColumn({ type: "string", id: "Name" });
    dataTable.addColumn({ type: "string", id: "style", role: "style" });
    dataTable.addColumn({ type: "date", id: "Start" });
    dataTable.addColumn({ type: "date", id: "End" });
    return dataTable;
};

filterGroup = () => {
    const hubFilter = $("input[name='hubFilter']:checked");
    const themeFilter = $("input[name='themeFilter']:checked");
    if (hubFilter.length > 0 || themeFilter.length > 0) {
        let filter = [];
        for (let i = 0; i < hubFilter.length; i++) {
            filter.push({
                a: "hub", b: "==", c: hubObject[hubFilter[i].id]
            });
        }

        let themeFilterArray = [];
        for (let i = 0; i < themeFilter.length; i++) {
            themeFilterArray.push({
                a: "theme", b: "==", c: themeObject[themeFilter[i].id]
            });
        }
        getData(filter, themeFilterArray);
    } else {
        getData();
    }
};

getData = (filterObj, themeFilter) => {
    let dataTable = ResetDataTable();
    OArray = [];
    let docRef;
    if (filterObj && filterObj.length > 0) {
        for (let i = 0; i < filterObj.length; i++) {
            docRef = db.collection("service").where(filterObj[i].a, filterObj[i].b, filterObj[i].c).orderBy("startDate");
            docRef.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    OArray.push(json2array(doc.data()));
                });
            })
                .then(() => {
                    if (returnCount >= filterObj.length - 1) {
                        returnCount = 0;
                        if (OArray.length === 0) {
                            alert("Sorry we have no records for that yet");
                        } else {
                            if (themeFilter.length > 0) {
                                let filtered = [];
                                themeFilter.forEach(s => {
                                    let temp = [];
                                    temp = OArray.filter(service => service[5] == s.c);
                                    filtered = filtered.concat(temp);
                                });
                                OArray = filtered;
                            }
                            removeExtraAttribute();
                            completeChartDraw();
                        }
                    } else {
                        returnCount++;
                    }
                })
                .catch(() => alert("Sorry we have no records for that yet"));
        }
    } else if (themeFilter) {
        for (let i = 0; i < themeFilter.length; i++) {
            docRef = db.collection("service").where(themeFilter[i].a, themeFilter[i].b, themeFilter[i].c);
            docRef.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    OArray.push(json2array(doc.data()));
                });
            })
                .then(() => {
                    if (returnCount >= themeFilter.length - 1) {
                        returnCount = 0;
                        if (OArray.length === 0) {
                            alert("Sorry we have no records for that yet");
                        } else {

                            removeExtraAttribute();
                            completeChartDraw();
                        }
                    } else {
                        returnCount++;
                    }
                })
                .catch(() => alert("Sorry we have no records for that yet"));
        }
    } else {
        docRef = db.collection("service").orderBy("startDate");
        docRef.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                OArray.push(json2array(doc.data()));
            });
        })
            .then(() => {
                removeExtraAttribute();
                completeChartDraw();
            })
            .catch(() => alert("Sorry we have no records for that yet"));
    }
};

removeExtraAttribute = () => {
    let tempArray = [];
    OArray.forEach(aObject => {
        if (aObject.length == 6) {
            aObject.splice(-1, 1);
        }
        tempArray.push(aObject);
    });
    tempArray.sort((a, b) => {
        return new Date(a[3]) - new Date(b[3]);
    });
    OArray = tempArray;
};

completeChartDraw = () => {
    if (OArray.length > 0) {
        const height = OArray.length * 30 + 80;
        $("#chartdiv").height(height);
        dataTable.addRows(OArray);
        dash.draw(dataTable);
        switchControl();
    } else {
        alert("Sorry we have no records for that yet");
    }
};

switchControl = () => {
    $('#control_div').hide();
    $('#filter_mobile').show();
    try {
        $("#filter_mobile").dateRangeSlider({
            bounds: {
                min: new Date(2010, 0, 1),
                max: new Date(2020, 9, 1)
            },
            defaultValues: {
                min: new Date(2010, 0, 1),
                max: new Date(2020, 9, 1)
            },
            step: {
                months: 1
            },
            arrows: true,
            wheelMode: null
        }).bind('valuesChanged', (e, data) => {
            try {
                control.setState({ range: { start: data.values.min, end: data.values.max } });
                control.draw();
            } catch (e) { e.message; }
        });
    } catch (e) {
        console.log(e.message);
    }
};

json2array = json => {
    let result = [];
    const keys = ["groupName", "title", "color", "startDate", "endDate", "theme"];
    keys.forEach(key => {
        if (key == "startDate" || key == "endDate") {
            if (json["title"].toLowerCase() === "today") {
                result.push(new Date());
            } else {
                result.push(json[key].toDate());
            }
        } else {
            result.push(json[key]);
        }
    });
    return result;
};

displayTopToastMessage = (message, error) => {
    var x = document.getElementById("snackbar");
    x.innerHTML = message;
    // Add the "show" class to DIV
    if (error) {
        x.className = "top show error";
    } else {
        x.className.replace("error", "");
        x.className = "top show";
    }
    // After 5 seconds, remove the show class from DIV
    setTimeout(() => { x.className = x.className.replace("show", ""); }, 4900);
}

