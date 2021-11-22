let dtTable;
let googleUser;
let Key;
var colorTable = {
    wwrd: {
        concept: "#9fd9de",
        design: "#aad9dd",
        development: "#bee2e5",
        delivery: "#d5edef"
    },
    lclu: {
        concept: "#2e8652",
        design: "#398457",
        development: "#4a8c64",
        delivery: "#5d9974"
    },
    afs: {
        concept: "#7eb761",
        design: "#86b76e",
        development: "#94bf80",
        delivery: "#a5c995"
    },
    wac: {
        concept: "#94a3d4",
        design: "#9eabd6",
        development: "#afbadd",
        delivery: "#c9d1e8"
    }
}
themeObject = {
    "Water & Water Related Disasters": "wwrd",
    "Land Cover & Land Use Change & Ecosystems": "lclu",
    "Agriculture & Food Security": "afs",
    "Weather & Climate": "wac"
};
hubObject = {
    "Amazonia": "aza",
    "Eastern & Southern Africa": "esa",
    "West Africa": "wa",
    "Hindu Kush Himalaya": "hkh",
    "Mekong": "mkg"
};
const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({
    prompt: "select_account"
});
provider.addScope("https://www.googleapis.com/auth/userinfo.email");

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        $("#btnGoogleLogin").text("Logout");
        checkwrite();
    } else {
        $("#btnGoogleLogin").text("Login with Google");
    }
});
startLogin = () => {
    firebase.auth().signInWithPopup(provider).then(result => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const token = result.credential.accessToken;
        // The signed-in user info.
        googleUser = result.user;
    }).catch(error => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user"s account used.
        const email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        const credential = error.credential;
    });
}

logout = () => {
    firebase.auth().signOut().then(() => {
        $("#adminForm").hide();
        $("#userForm").show();
    }, error => {
        // An error happened.
        console.log("Logout error.");
    });
}

toggleAuthentication = () => {
    if (firebase.auth().currentUser !== null) {
        logout();
    } else {
        startLogin();
    }
}

checkwrite = () => {
    try {
        const docRef = db.collection("map-writer/").where("canwrite", "==", "map-writer");
        docRef.get().then(querySnapshot => {
            for (let value of querySnapshot.docs.values()) {
                writeIt(value.id);
            }
        }).catch(err => {
            console.log("login needed");
        });
    }
    catch (e) {
        console.log("no permissions");
    }
}

writeIt = which => {
    const theDoc = db.collection("map-writer/").doc(which);
    theDoc.update({
        "canwrite": "map-writer"
    }).then(() => {
        sizeMain();
        $("#adminForm").show();
        $("#userForm").hide();
        try {
            getData();
        } catch (e) { console.log(e.message); }
    }).catch(err => {
        alert("You are not authorized, please login with an authorized account.");
    });
}

$(window).resize(() => {
    sizeMain();
});

sizeMain = () => {
    const theheight = $(window).height() - ($("#nav-wrapper").height() + 30);
    $("#adminForm").css("height", theheight + "px");
    $("#overflowwrapper").css("height", (theheight - 110) + "px");
}

addMapService = service => {
    console.log("adding service");
    db.collection("service").doc(Key.id).set(service).then(() => {
        alert("service successfully added!");
        getData();
        $("#myModal").modal("toggle");
    });
    clearInput();
}
updateMapService = service => {
    db.collection("service").doc(service.id).update(service)
        .then(() => {
            getData();
            $("#myModal").modal("toggle");
        });
}

$(() => {
    dtTable = $("#dataLayersTable").DataTable({
        columns: [
            { data: "groupName" },
            { data: "hub" },
            { data: "theme" },
            { data: "status" },
            { data: "startDate" },
            { data: "endDate" }
        ]
    });

    dtTable.on("click", "tr", function () {
        if ($(this).hasClass("selected")) {
            $(this).removeClass("selected");
        } else {
            dtTable.$("tr.selected").removeClass("selected");
            $(this).addClass("selected");
        }
        if (dtTable.row(this).data()) {
            const selectedData = dtTable.row(this).data();
            clearInput();
            $("#hd-id").val(selectedData.id);
            $("#groupname").val(selectedData.groupName);
            $("#hubRegion").val(hubObject[selectedData.hub]);
            $("#serviceArea").val(themeObject[selectedData.theme]);
            $("#status").val(selectedData.status.replace("Service", "").toLowerCase().trim());
            $("#startDate").val(selectedData.startDate);
            $("#endDate").val(selectedData.endDate);
            $("#myModal").modal("show");
            $("#btnDelete").show();
        }
    });

    $("#btnAdd").on("click", () => {
        clearInput();
        $("#myModal").modal("show");
        $("#btnDelete").hide();
    });

    $("#btnSave").on("click", () => {
        saveData();
    });
    $("#btnDelete").on("click", () => {
        deleteData();
    });
    $("#endDate").datepicker();
    $("#startDate").datepicker();
});
saveData = () => {
    const service = {
        id: "",
        groupName: $("#groupname").val(),
        hub: $("#hubRegion option:selected").text(),
        status: $("#status option:selected").text(),
        color: $("#serviceArea").val() && $("#status").val() ? colorTable[$("#serviceArea").val()][$("#status").val()] : "#f24915",
        startDate: $("#startDate").datepicker("getDate"),
        endDate: $("#endDate").datepicker("getDate"),
        theme: $("#serviceArea option:selected").text(),
        title: $("#status option:selected").text()
    }
    if (isValidData(service)) {
        if ($("#hd-id").val().length > 0) {
            console.log("update");
            service.id = $("#hd-id").val()
            updateMapService(service);
        } else {
            console.log("new");
            Key = db.collection("service/").doc();
            service.id = Key.id;
            addMapService(service);
        }
    }
}

displayToastMessage = (message, error) => {
    var x = document.getElementById("snackbar");
    x.innerHTML = message;
    // Add the "show" class to DIV
    if (error) {
        x.className = "show error";
    } else {
        x.className.replace("error", "");
        x.className = "show";
    }

    // After 5 seconds, remove the show class from DIV
    setTimeout(() => { x.className = x.className.replace("show", ""); }, 5000);
}

isValidData = service => {
    let errorMessage = "";
    /*check data, if error popup error message return false else return true */
    errorMessage = (service.groupName.length == 0
        ? "Please enter Service name <br />"
        : '') + (service.hub.length == 0
            ? "Please select a Region <br />"
            : '') + (service.theme.length == 0
                ? "Please select a Service Area <br />"
                : '') + (service.status.length == 0
                    ? "Please select a Status <br />"
                    : '') + (service.startDate == null
                        ? "Please select a Start Date <br />"
                        : '') + (service.endDate == null
                            ? "Please select an End Date <br />"
                            : '');

    if (errorMessage.trim().length == 0) {
        return true;
    } else {
        displayToastMessage(errorMessage);
        return false;
    }
}

deleteData = () => {
    const id = $("#hd-id").val();
    deleteDB(id);
}

deleteDB = id => {
    db.collection("service").doc(id).delete()
        .then(() => {
            getData();
            $("#myModal").modal("toggle");
        });
}

clearInput = () => {
    $("#hd-id").val("");
    $("#groupname").val("");
    $("#hubRegion").val("");
    $("#serviceArea").val("");
    $("#status").val("");
    $("#startDate").val("");
    $("#endDate").val("");
}
var debug;
getData = () => {
    const docRef = db.collection("service").orderBy("startDate");
    docRef.get().then(docData => {
        if (docData.size) {
            const arrObj = [];
            docData.forEach(data => {
                const obj = data.data();
                try {
                    obj.startDate = getFormattedDate(obj.startDate.toDate());
                    obj.endDate = getFormattedDate(obj.endDate.toDate());
                    obj.id = data.id;
                    if (obj.title != "Today") {
                        arrObj.push(obj);
                    }
                } catch (e) {
                    console.log(obj);
                }

            });
            debug = arrObj;
            dtTable.clear();
            dtTable.rows.add(arrObj);
            dtTable.draw();
            dtTable.order([0, "desc"]).draw();

        } else {
            console.log(docData);
            dtTable.clear();
            dtTable.draw();
        }

    }, error => {
        console.log("error=", error);
    });

}
getFormattedDate = theDate => {
    return (theDate.getMonth() + 1) +
        "/" + theDate.getDate() +
        "/" + theDate.getFullYear();
}