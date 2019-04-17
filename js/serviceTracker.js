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

drawChart = () => {
    const container = document.getElementById("chartdiv");
    const chart = new google.visualization.Timeline(container);
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: "string", id: "Role" });
    dataTable.addColumn({ type: "string", id: "Name" });
    dataTable.addColumn({ type: "string", id: "style", role: "style" });
    dataTable.addColumn({ type: "date", id: "Start" });
    dataTable.addColumn({ type: "date", id: "End" });
    selectHandler = () => {
        const selectedItem = chart.getSelection()[0];
        if (selectedItem) {
            console.log("The user selected " + dataTable.getValue(selectedItem.row, 1) + " in " + dataTable.getValue(selectedItem.row, 0));
        }
    }
    google.visualization.events.addListener(chart, "select", selectHandler);
    getData(dataTable, chart);
}

getData = (dt, ch) => {
    let OArray = [];
    const docRef = db.collection("service").orderBy("startDate");
    docRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            OArray.push(json2array(doc.data()));
        });
    })
        .then(() => {
            console.log(OArray.length);
            var height = OArray.length * 31 + 30;
            $("#chartdiv").height(height);
            dt.addRows(OArray);
            ch.draw(dt);
        });
}
json2array = json => {
    let result = [];
    const keys = ["groupName", "title", "color", "startDate", "endDate"];
    keys.forEach(key => {
        if (key == "startDate" || key == "endDate") {
            result.push(json[key].toDate());
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