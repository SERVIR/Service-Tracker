// Initialize Firebase

/*
possible chart zoom:
https://developers.google.com/chart/interactive/docs/gallery/controls
https://jsfiddle.net/hicaro/vk8oaryy/8/
*/
firebase.initializeApp(config);
const db = firebase.firestore();
if (typeof google !== "undefined") {
    google.charts.load('visualization', '1', { packages: ["corechart", "controls", "timeline", "charteditor"] });
}

var dashboard;
var dash;
var control;

startApp = () => {
    try {
        //console.log("commented out");
        drawChart();
    } catch (e) {

        setTimeout(startApp, 100);
    }
}
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

    updateChartHeight = () => {
        //if ($("svg").length === 3) {
        //    $("#chartdiv").height($("#chartdiv svg")[0].getBBox().height + 30);
        //} else if ($("svg").length === 4) {
        //   // $("svg")[3].parentNode
        //}
    }

    //window.addEventListener('mouseup', function (e) {
    //    console.log("should do it");
    //    $("#chartdiv").height($("#chartdiv svg")[0].getBBox().height + 30);
    //}, false);

    selectHandler = () => {
        console.log("selectHandler");
        const selectedItem = chart.getChart().getSelection()[0];
        debugSelect = chart.getChart().getSelection();
        if (selectedItem) {
            try {
                console.log("The user selected " + dataTable.getValue(selectedItem.row, 1) + " in " + dataTable.getValue(selectedItem.row, 0));
            } catch (e) { }
        }
    }
    google.visualization.events.addListener(chart, "select", selectHandler);
    getData();
    google.visualization.events.addListener(chart, 'ready', updateChartHeight);
}

var debugSelect;

ResetDataTable = () => {
    dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: "string", id: "Role" });
    dataTable.addColumn({ type: "string", id: "Name" });
    dataTable.addColumn({ type: "string", id: "style", role: "style" });
    dataTable.addColumn({ type: "date", id: "Start" });
    dataTable.addColumn({ type: "date", id: "End" });
    return dataTable;
}

function filterGroup() {
    const hubFilter = $("input[name='hubFilter']:checked");
    const themeFilter = $("input[name='themeFilter']:checked");
    if (hubFilter.length > 0 || themeFilter.length > 0) {
        let filter = [];
        for (let i = 0; i < hubFilter.length; i++) {
            filter.push( {
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
}

getData = (filterObj, themeFilter) => {
    console.log("getData");
    //chart.clearChart();
    console.log("1");
    let dataTable = ResetDataTable();
    console.log("2");
    OArray = [];
    let docRef;
    if (filterObj && filterObj.length > 0) {
        console.log("filtering");
        for (var i = 0; i < filterObj.length; i++) {
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
                                var filtered = [];
                                themeFilter.forEach(function (s) {
                                    let temp = [];
                                    temp = OArray.filter(service => service[5] == s.c);
                                    filtered = filtered.concat(temp);
                                });
                                OArray = filtered;
                            }
                            console.log(OArray);
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
        console.log("just theme");
        console.log(themeFilter);
        for (var i = 0; i < themeFilter.length; i++) {
            docRef = db.collection("service").where(themeFilter[i].a, themeFilter[i].b, themeFilter[i].c);
            docRef.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    console.log(doc.data());
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
                .catch(() => alert("Sorry we have no records for that yet") );
        }
    } else {
        console.log("just service");
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
}
removeExtraAttribute = () => {
    var tempArray = [];
    OArray.forEach(function (aObject) {
        if (aObject.length == 6) {
            aObject.splice(-1, 1);
        }
        tempArray.push(aObject);
    });
    tempArray.sort(function (a, b) {
        return new Date(a[3]) - new Date(b[3]);
    });
    OArray = tempArray;
}
completeChartDraw = () => {
    if (OArray.length > 0) {
        var height = OArray.length * 30 + 80;

        console.log("height: " + height);
        $("#chartdiv").height(height);
        dataTable.addRows(OArray);
        dash.draw(dataTable);
    } else {
        alert("Sorry we have no records for that yet");
    }
}
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
}
createService = (groupName, title, color, startDate, endDate) => {
    db.collection("service").add({
        groupName: groupName,
        title: title,
        color: color,
        startDate: startDate,
        endDate: endDate
    })
        .then(docRef => {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(error => {
            console.error("Error adding document: ", error);
        });
}
