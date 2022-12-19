let author = 'Erid Nord',
comand = "Соломина София (Sofia)";

let enviroment = new Datatype("Модуль природы", 'enviroment', 'tiles/summer.png'),
type_fraction = new Datatype("Модуль геральдики", 'fraction'),
type_build = new Datatype("Модуль строений", 'build'),
type_unit = new Datatype("Модуль юнитов", 'unit'),
type_item = new Datatype("Модуль предметов", 'item'),
scene;

// ожидание загрузки данных с сервера
prepareData().then(main);

// основная программа после загрузки всех данных
function main() {
    scene = createScene(110, 160);
    let dimension = scene.getDimension();
    let camera = createCamera({color: '#0000FF', globalWidth: system.width()});
    let map = createMap(
        {
            width: dimension.width, 
            height: dimension.height, 
            blockSelector: '.minimap', 
            screenWidth: system.width(),
            camera: camera
        }
    );
    appScreen = createScreen({size: system.width(), selector: '.screen', enviroment});
    editor = createEditor();
    
    worldState = scene.getWorld();
    console.log('Пример объявленных зданий', type_build.getList());
    map.show(worldState, camera);
    
    appScreen.setScale(camera.getState());
    appScreen.show(camera.getPicture(worldState));
    editor.createMenuList()
    
    setAllHandler(scene, camera, map, appScreen);
}

// ждём когда данные загрузятся с сервера
async function prepareData() {
    while (!enviroment.getList() 
        || !type_fraction.getList()
        || !type_build.getList()
        || !type_unit.getList()
        || !type_item.getList()
        || !enviroment.tileLoaded()
        ) await system.pause(25);
}

//------- устанавливаем обработчики событий -------
function setAllHandler(scene, camera, map, screen) {
    // Обработчик клавиатуры
    addEventListener("keydown", {handleEvent: system.control, map: map, camera: camera, screen: screen});
    
    // клик по карте
    map.minimap.addEventListener('click', function(event) {
        if (!camera.version) return false;
        let point = map.clickEvent(event);
        worldState = scene.getWorld();
        // переместить камеру и отображаемую часть текущего экрана
        camera.move(point, scene.getDimension());
        screen.show(camera.getPicture(worldState));
        map.show(worldState, camera);
    });
    
    // клик по экрану
    screen.layers.ghostPlane.addEventListener('click', function(event) {
        if (!screen.version) return false;
        let point = screen.clickEvent(event);
        
        // получить что редактировать и установить территорию или здание
        let addId = false;
        addId = scene.editTerritory(point, camera.getState())
                || addBuild(point.x, point.y);
        
        if (addId !== false) {
            worldState = scene.getWorld();
            screen.show(camera.getPicture(worldState));
            map.show(worldState, camera);
        } else {
            // здесь добавить проверку входа в здание
            enterBuild(point.x, point.y);
        }
    });
    
    // обработчик колеса мыши - изменение масштаба
    screen.layers.ghostPlane.addEventListener("wheel", function (event) {
        let coord = camera.getState();
        
        coord = {x: coord.x + Math.round(coord.width / 2) - 1, y: coord.y + Math.round(coord.height / 2) - 1};
        camera.onWheel(event);
        screen.setScale(camera.getState());
        camera.move(coord, scene.getDimension());
        screen.redraw(camera.getPicture(worldState));
        map.show(worldState, camera);
    });
    
    // скрытие раскрытие меню редактирования территорий и зданий
    document.querySelector('#navbarSupportedContent .editMap').addEventListener('click', function() {
        document.querySelector('.editterritory').selectedIndex = 0;
        document.querySelector('.editbuild').selectedIndex = 0;
        document.querySelector('.building_info').classList.add = 'hidden';
        document.querySelector('.edit_map_block').classList.toggle('hidden');
        document.querySelector('.minimap').style.display = '';
    })

    // Информация о приложении.
    document.querySelector('#navbarSupportedContent .aboutApplication').addEventListener('click', function() {
        let info;
        
        info = `
            Приложение: ${system.info()},
            Автор: ${author},
            Тестирование и UX: ${comand},
            ------------ Модули -------------
            ${scene.info()},
            ${screen.info()},
            ${camera.info()},
            ${map.info()},
            ${editor.info()},
            ${enviroment.info()},`;
            // ${buildFactory.info()},
            // ${buildInterface.info()},
        // `;
        alert(info);
    })
    
    // меню - сохранить
    document.querySelector('#navbarSupportedContent .save').addEventListener('click', function() {
        let htmlText = scene.save();
        // htmlText += buildFactory.save();
        
        system.save('map', htmlText);
    })
    
    system.load('#fileLoad', scene.loadMap);
    
    // меню - загрузить, перебрасываем событие на инпут загрузки файла
    // C:\documents\erid\work\2_erid\games\socio_map_com\maps
    document.querySelector('#navbarSupportedContent .load').addEventListener('click', function() {
        document.getElementById("fileLoad").click();
    })
    
    // после загрузки мира из файла - отобразить его.
    document.querySelector('.navbar #worldLoaded').addEventListener('click', function() {
        let worldState = scene.getWorld(),
        dimension = scene.getDimension();
        // нужно изменить параметры map
        console.log(worldState.length, worldState[0].length);
        map.setDimension(
            {
                width: dimension.width, 
                height: dimension.height, 
                blockSelector: '.minimap', 
                screenWidth: system.width(),
                camera: camera
            }
        );
        map.setScreenDimensions();
        
        screen.redraw(camera.getPicture(worldState));
        map.show(worldState, camera);
    })

    // Сотворить здание
    function addBuild(x, y) {
        return false;
        
        let coord, cameraState;
        
        if (buildId == '0') return false;
        cameraState = camera.getState();
        coord = {x: x + cameraState['x'], y: y + cameraState['y']};
        
        scene.addBuild(coord, buildId);
        
        return buildId;
    }

    // Войти в здание
    function enterBuild(x, y) {
        return false;
        
        let coord, cameraState, enterBuildId, build, buildMenu;
        cameraState = camera.getState();
        coord = {x: x + cameraState['x'], y: y + cameraState['y']};
        
        enterBuildId = scene.getBuildId(coord);
        buildMenu = document.getElementsByClassName('building_info')[0];
        
        if (enterBuildId === false) {
            buildMenu.innerHTML = '';
            if ($('.minimap').css('display') == 'none') {
                $('.minimap').show();
            }
            return false;
        }
        // получить здание по id из хранилища, обнулить редактирование, скрыть редактирование.
        // отобразить меню здания, вывести информацию о здании.
        build = buildFactory.get(enterBuildId);
        if (!build) return false;
        
        document.getElementById('enviroment_0').click();
        document.getElementById('building_0').click();
        $('.edit_map_block').hide();
        $('.minimap').hide();
        
        buildMenu.innerHTML = buildInterface.form(build);
        buildMenu.style.display = '';
    }
}