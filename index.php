<!DOCTYPE html>
<html lang="ru">
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Map Editor (canvas, bootstrap)</title>
    
    <link rel="stylesheet" href="css/bootstrap.css">
    <link rel="stylesheet" href="css/fontawesome.css">
    <link rel="stylesheet" href="css/main.css">
    
    <!-- модули -->
    <script defer src="js/module/system.js"></script>
    <script defer src="js/module/type.js"></script>
    <script defer src="js/module/scene.js"></script>
    <script defer src="js/module/camera.js"></script>
    <script defer src="js/module/map.js"></script>
    <script defer src="js/module/screen.js"></script>
    <script defer src="js/module/editor.js"></script>
    <script defer src="js/main.js"></script>
</head>

<body>
    <div class="container">
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary"> 
            <a class="navbar-brand" href="#">logo</a>
            <div class="version"></div>

            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"> 
                <span class="navbar-toggler-icon"> </span> 
            </button> 

            <div class="collapse navbar-collapse" id="navbarSupportedContent"> 
            </div>
            
            <input id="fileLoad" type="file" size="50" style="display: none;" >
            <input id="worldLoaded" type="input" size="50" style="display: none;" >
        </nav>
        
        <div class="row">
            <div class="screen col-9" style="position: relative;"></div>
            <div class="col-3">
                <div class="minimap"></div>
                <div class="edit_map_block"></div>
                <div class="building_info" style="display: none;"></div>
            </div>
        </div>
    </div>
</body>
</html>