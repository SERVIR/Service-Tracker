// Initialize Firebase
firebase.initializeApp(config);
const db = firebase.firestore();
if (typeof google !== "undefined") {
    google.charts.load("current", { packages: ["timeline"] });
}
startApp = () => {
    try {
        drawChart();
    } catch (e) {
        setTimeout(startApp, 100);
    }
}
let chart;
let dataTable;
var fullselection;

var themeObject = {
    wwrd: "Water & Water Related Disasters",
    lclu: "Land Cover & Land Use Change & Ecosystems",
    afs: "Agriculture & Food Security",
    wac: "Weather & Climate"
};
var hubObject = {
    aza: "Amazonia",
    esa: "Eastern & Southern Africa",
    wa: "West Africa",
    hkh: "Hindu Kush Himalaya",
    mkg: "Mekong"
};
drawChart = () => {
    const container = document.getElementById("chartdiv");
     chart = new google.visualization.Timeline(container);
     dataTable = ResetDataTable();
    selectHandler = () => {
        const selectedItem = chart.getSelection()[0];
        fullselection = chart.getSelection();
        if (selectedItem) {
            try {
                console.log("The user selected " + dataTable.getValue(selectedItem.row, 1) + " in " + dataTable.getValue(selectedItem.row, 0));
            } catch (e) { }
        }
    }
    google.visualization.events.addListener(chart, "select", selectHandler);
    getData();
}

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
    var hubFilter = $("input[name='hubFilter']:checked");
    var themeFilter = $("input[name='themeFilter']:checked");
    if (hubFilter.length > 0 || themeFilter.length > 0) {
        var filter = [];
        for (var i = 0; i < hubFilter.length; i++) {
            filter.push( {
                a: "hub", b: "==", c: hubObject[hubFilter[i].id]
            }); 
        }

        let themeFilterArray = [];
        for (var i = 0; i < themeFilter.length; i++) {
            themeFilterArray.push({
                a: "theme", b: "==", c: themeObject[themeFilter[i].id]
            });
        }
        getData(filter, themeFilterArray);
    } else {
        getData();
    }
}

let OArray = [];
var returnCount = 0;
getData = (filterObj, themeFilter) => {
    chart.clearChart();
    let dataTable = ResetDataTable();
    OArray = [];
    let docRef;
    if (filterObj && filterObj.length > 0) {
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
        chart.draw(dataTable, {explorer: {
            actions: ['dragToZoom', 'rightClickToReset'],
            axis: 'horizontal',
            keepInBounds: true,
            maxZoomIn: 4.0
        }
        });
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
            }
            else {
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