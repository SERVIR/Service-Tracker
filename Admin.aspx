<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Admin.aspx.cs" Inherits="Ddmin" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>SERVIR Service Tracker - Admin</title>
    <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
    <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
    <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
    <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
    <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
    <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
    <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
    <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="msapplication-TileColor" content="#ffffff" />
    <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
    <meta name="theme-color" content="#ffffff" />

    <link rel="stylesheet" type="text/css" href="//cdn.datatables.net/1.10.16/css/jquery.dataTables.css" />
    <link href="css/bootstrap.css" rel="stylesheet" />
    <link href="css/servicetracker.css" rel="stylesheet" />

    <style>
        #dataLayersTable_wrapper {
            width: 98%;
            margin-right: auto;
            margin-left: auto;
        }

        #dataLayersTable {
            width: 100% !important;
        }

        .form-group {
            clear: both;
        }
    </style>
    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" />

    <script src="js/jquery-3.4.0.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script src="https://cdn.datatables.net/1.10.16/js/jquery.dataTables.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="https://www.gstatic.com/firebasejs/5.9.3/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/5.9.3/firebase-firestore.js"></script>
    <script src="https://www.gstatic.com/firebasejs/5.9.3/firebase-auth.js"></script>
    <script src="js/firebaseconfig.js"></script>
    <script src="js/serviceTracker.js"></script>

    <script type="text/javascript">

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
    </script>


</head>
<body>
    <form id="form1" runat="server">
        <div style="width: 100%; height: 100%; margin: 0;">
            <div class="sticky">
                <div class="example3 " id="nav-wrapper">
                    <nav class="navbar navbar-inverse navbar-static-top">
                        <div class="container">
                            <div class="navbar-header">
                                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar3">
                                    <span class="sr-only">Toggle navigation</span>
                                    <span class="icon-bar"></span>
                                    <span class="icon-bar"></span>
                                    <span class="icon-bar"></span>
                                </button>
                                <a class="navbar-brand" href="https://servirglobal.net">
                                    <img src="images/logo.png" alt="SERVIR Global">
                                </a>
                            </div>
                            <div id="navbar3" class="navbar-collapse collapse no-transition">
                                <ul class="nav navbar-nav navbar-right">
                                    <li><a href="/">Service Tracker</a></li>

                                    <li><a href="#" id="btnGoogleLogin" onclick="toggleAuthentication()">Login with Google</a></li>
                                </ul>
                            </div>
                            <!--/.nav-collapse -->
                        </div>
                        <!--/.container-fluid -->
                    </nav>
                </div>
                <div id="userForm">
                    <div style="padding: 1.5rem; margin-right: auto; margin-left: auto; border-width: .2rem; width: 80%;">
                        <h1 class="page-header text-center">Welcome to the Service Tracker</h1>
                        <p>If you would like to login please click the login button from the menu bar. Otherwise you may go directly to the <a href="/" alt="Service Tracker" title="Service Tracker">Service Tracker</a></p>
                    </div>
                </div>


                <div id="adminForm" class="map tab-content" style="display: none;">

                    <div id="editlayers" style="padding: 1.5rem; margin-right: auto; margin-left: auto; border-width: .2rem;">
                        <h1 class="page-header text-center">Edit Service info</h1>
                        <div id="overflowwrapper" style="overflow: auto;">



                            <button id="btnAdd" type="button" class="btn btn-primary">
                                Add

                            </button>

                            <table id="dataLayersTable" class="table table-striped table-bordered" cellspacing="0">

                                <thead>

                                    <tr>
                                        <th>Group Name</th>
                                        <th>Title</th>
                                        <th>Color</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>


                                    </tr>

                                </thead>

                            </table>

                        </div>



                        <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="dataLayersTableModalLabel">

                            <div class="modal-dialog" role="document">

                                <div class="modal-content">

                                    <div class="modal-header">

                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">

                                            <span aria-hidden="true">&times;</span>

                                        </button>

                                        <h4 class="modal-title" id="dataLayersTableModalLabel">New Layer</h4>

                                    </div>

                                    <div class="modal-body">

                                        <form>

                                            <input type="hidden" id="hd-id">

                                            <div class="form-group">
                                                <label for="groupname">Group Name:</label><br />
                                                <input type="text" name="groupname" id="groupname" value="" placeholder="Group Name" class="text ui-widget-content ui-corner-all testforminput fullwidth adminInput" /><br />
                                            </div>
                                            <div class="form-group">
                                                <label for="title">Title:</label><br />
                                                <input type="text" name="title" id="title" value="" placeholder="Title" class="text ui-widget-content ui-corner-all testforminput fullwidth adminInput" /><br />
                                            </div>
                                            <div class="form-group">
                                                <label for="color">Color:</label><br />
                                                <input type="text" name="color" id="color" value="" placeholder="color" class="text ui-widget-content ui-corner-all testforminput fullwidth adminInput" /><br />
                                            </div>
                                            <div class="form-group">
                                                <label for="startDate">Start Date:</label><br />
                                                <input type="text" name="startDate" id="startDate" value="" placeholder="Start Date" class="text ui-widget-content ui-corner-all testforminput fullwidth adminInput" /><br />
                                            </div>
                                            <div class="form-group">
                                                <label for="endDate">End Date:</label><br />
                                                <input type="text" name="endDate" id="endDate" value="" placeholder="End Date" class="text ui-widget-content ui-corner-all testforminput fullwidth adminInput" /><br />
                                            </div>

                                        </form>

                                    </div>

                                    <div class="modal-footer">

                                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>

                                        <button id="btnSave" type="button" class="btn btn-primary">Save</button>

                                        <button id="btnDelete" type="button" class="btn btn-error">Delete</button>

                                    </div>

                                </div>

                            </div>

                        </div>



                        <div class="alert alert-warning alert-dismissible fade show" role="alert">

                            <strong>Holy guacamole!</strong> You should check in on some of those fields below.

                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">

                            <span aria-hidden="true">&times;</span>

                        </button>

                        </div>
                        <br style="clear: both; height: 200px;" />
                    </div>
                </div>
            </div>
        </div>
        <span id="ismobile" class="ismobile"></span>
    </form>
</body>
</html>
