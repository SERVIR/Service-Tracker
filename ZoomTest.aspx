<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ZoomTest.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="keywords" content="SERVIR Service Tracker" />
    <title>SERVIR Service Tracker</title>
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
    <link href="css/bootstrap.css" rel="stylesheet" />
    <link href="css/servicetracker.css" rel="stylesheet" />
     <link href="http://code.jquery.com/mobile/1.4.5/jquery.mobile.structure-1.4.5.min.css" rel="stylesheet" />
    <style>
        html, body, #form1 {
            height: 100%;
            width: 100%;
        }

        #dataLayersTable_wrapper {
            width: 98%;
            margin-right: auto;
            margin-left: auto;
        }

        #dataLayersTable {
            width: 100% !important;
        }
    </style>

    <script src="js/jquery-3.4.0.min.js"></script>
    <script src="http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="https://www.gstatic.com/firebasejs/5.9.3/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/5.9.3/firebase-firestore.js"></script>
    <script src="https://www.gstatic.com/firebasejs/5.9.3/firebase-auth.js"></script>
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    <script src="js/firebaseconfig.js"></script>
    <script src="js/serviceTrackerZoom.js"></script>
    <script type="text/javascript">
        $(() => {
            startApp();
        });
    </script>
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
                                </ul>
                            </div>
                            <!--/.nav-collapse -->
                        </div>
                        <!--/.container-fluid -->
                    </nav>
                </div>
                <div id="userForm">
                    <p style="padding: 5px 10px; margin-right: 15px;">
                        <span style="font-weight: 600;">Filter By Region:</span>
                        <input type="checkbox" id="aza" name="hubFilter" onclick="filterGroup();" class="form-check-input" style="margin-right: 5px; margin-left: 10px;" />Amazonia
                        <input type="checkbox" id="esa" name="hubFilter" onclick="filterGroup();" class="form-check-input" style="margin-right: 5px; margin-left: 10px;" />Eastern & Southern Africa
                        <input type="checkbox" id="wa" name="hubFilter" onclick="filterGroup();" class="form-check-input" style="margin-right: 5px; margin-left: 10px;" />West Africa
                        <input type="checkbox" id="hkh" name="hubFilter" onclick="filterGroup();" class="form-check-input" style="margin-right: 5px; margin-left: 10px;" />Hindu Kush Himalaya
                        <input type="checkbox" id="mkg" name="hubFilter" onclick="filterGroup();" class="form-check-input" style="margin-right: 5px; margin-left: 10px;" />Mekong
                    </p>
                    <p style="padding: 5px 10px; margin-right: 15px;">
                        <span style="font-weight: 600;">Filter By Theme:</span>
                        <input type="checkbox" id="wwrd" name="themeFilter" onclick="filterGroup();" class="form-check-input" style="margin-right: 5px; margin-left: 10px;" />Water & Water Related Disasters
                        <input type="checkbox" id="lclu" name="themeFilter" onclick="filterGroup();" class="form-check-input" style="margin-right: 5px; margin-left: 10px;" />Land Cover & Land Use Change & Ecosystems
                        <input type="checkbox" id="afs" name="themeFilter" onclick="filterGroup();" class="form-check-input" style="margin-right: 5px; margin-left: 10px;" />Agriculture & Food Security
                        <input type="checkbox" id="wac" name="themeFilter" onclick="filterGroup();" class="form-check-input" style="margin-right: 5px; margin-left: 10px;" />Weather & Climate
                    </p>

                    <div id="dashboard_div">
                        <div id="filter_div"></div>
                        
                        <div id="control_div" style="height:50px;"></div>
                        <div id="chartdiv"></div>
                        <div id="table_div"></div>
                    </div>
                </div>
            </div>
        </div>
        <span id="ismobile" class="ismobile"></span>
    </form>
</body>
</html>
