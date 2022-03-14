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
    <script type="text/javascript" src="https://apis.google.com/js/client.js"></script>
    <script src="https://apis.google.com/js/platform.js?onload=init" async defer></script>
    <script src="js/jquery-3.4.0.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script src="https://cdn.datatables.net/1.10.16/js/jquery.dataTables.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="https://www.gstatic.com/firebasejs/5.9.3/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/5.9.3/firebase-firestore.js"></script>
    <script src="https://www.gstatic.com/firebasejs/5.9.3/firebase-auth.js"></script>
    <script src="js/firebaseconfig.js"></script>
    <script src="js/serviceTracker.js"></script>
    <script src="js/serviceTrackerAdminPage.js"></script>
    
</head>
<body>
    <form id="form1" runat="server">
        <div style="width: 100%; height: 100%; margin: 0;">
            <div class="sticky">
                <div id="nav-wrapper">
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
                                    <img src="images/logo.png" alt="SERVIR Global" />
                                </a>
                            </div>
                            <div id="navbar3" class="collapse navbar-collapse">
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
                                        <th>Service Name</th>
                                        <th>Region</th>
                                        <th>Service Area</th>
                                        <th>Status</th>
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
                                        <h4 class="modal-title" id="dataLayersTableModalLabel">New Service</h4>
                                    </div>
                                    <div class="modal-body">
                                        <form>
                                            <input type="hidden" id="hd-id" />
                                            <div class="form-group">
                                                <label for="groupname">Service Name:</label><br />
                                                <input type="text" name="groupname" id="groupname" value="" placeholder="Service Name" class="text ui-widget-content ui-corner-all testforminput fullwidth adminInput" /><br />
                                            </div>             <div class="form-group">
                                                <label for="hubRegion">Region:</label><br />
                                                <select id="hubRegion" name="hubRegion">
                                                    <option value="aza">Amazonia</option>
                                                    <option value="esa">Eastern & Southern Africa</option>
                                                    <option value="wa">West Africa</option>
                                                    <option value="hkh">Hindu Kush Himalaya</option>
                                                    <option value="mkg">Mekong</option>
                                                </select>
                                                <br />
                                            </div>
                                            <div class="form-group">
                                                <label for="serviceArea">Service Area:</label><br />
                                                <select id="serviceArea" name="serviceArea">
                                                    <option value="wwrd">Water & Water Related Disasters</option>
                                                    <option value="lclu">Land Cover & Land Use Change & Ecosystems</option>
                                                    <option value="afs">Agriculture & Food Security</option>
                                                    <option value="wac">Weather & Climate</option>
                                                </select>
                                                <br />
                                            </div>
                                            <div class="form-group">
                                                <label for="status">Service Status:</label><br />
                                                <select id="status" name="status">
                                                    <option value="concept">Service Concept</option>
                                                    <option value="design">Service Design</option>
                                                    <option value="development">Service Development</option>
                                                    <option value="delivery">Service Delivery</option>
                                                    <option value="today">Today</option>
                                                </select><br />
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
                                    <div id="snackbar"></div>
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
         <!-- //smooth scrolling -->
        
        <span id="ismobile" class="ismobile"></span>
    </form>
</body>
</html>
