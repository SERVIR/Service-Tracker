let dtTable;
let googleUser;
let Key;
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
            { data: "title" },
            { data: "color" },
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
            $("#title").val(selectedData.title);
            $("#color").val(selectedData.color);
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
        title: $("#title").val(),
        color: $("#color").val(),
        startDate: $("#startDate").datepicker("getDate"),
        endDate: $("#endDate").datepicker("getDate")
    }

    if ($("#hd-id").val().length > 0) {
        service.id = $("#hd-id").val()
        updateMapService(service);
    } else {
        Key = db.collection("service/").doc();
        service.id = Key.id;
        addMapService(service);
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
    $("#title").val("");
    $("#color").val("");
    $("#startDate").val("");
    $("#endDate").val("");
}

getData = () => {
    const docRef = db.collection("service").orderBy("startDate");
    docRef.get().then(docData => {
        if (docData.size) {
            const arrObj = [];
            docData.forEach(data => {
                const obj = data.data();
                obj.startDate = getFormattedDate(obj.startDate.toDate());
                obj.endDate = getFormattedDate(obj.endDate.toDate());
                obj.id = data.id;
                arrObj.push(obj);

            });
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