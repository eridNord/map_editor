function createScreen(options) {
    let self;
    
    class Screen {
        constructor(options) {
            this.name = 'Модуль Экрана';
            this.version = '2.3';
            
            this.image = options.enviroment.getTile()
            this.layers = {worldPlane: false, objectPlane: false, ghostPlane: false};
            this.setDimensions(this.calculateDimension(options.size));
            this.createCanvas(this.findBlock(options.selector));
            this.setScreenDimensions();
            self = this;
        }
        
        // информация о модуле
        info() {
            return this.name + '. v' + this.version;
        }
        
        // определить допустимую ширину и высоту экрана по устройству пользователя.
        calculateDimension(screenWidth) {
            let scrWidth = 420;  // document.documentElement.clientWidth;
            let scrHeight = 384; // document.documentElement.clientHeight;
            if (screenWidth > 768) {
                scrWidth = 640;
                scrHeight = 520;
            }
            if (screenWidth > 992) {
                scrWidth = 720;
                scrHeight = 640;
            }
            if (screenWidth > 1200) {
                scrWidth = 800;
                scrHeight = 680;
            }
            if (screenWidth >= 1700) {
                scrWidth = 1000;
                scrHeight = 800;
            }
            
            return {width: scrWidth, height: scrHeight};
        }
        
        // получить текущие значения ширины и высоты экрана
        getDimension() {
            return {width: this.width, height: this.height};
        }
        
        // установить значения ширины и высоты экрана
        setDimensions(dimension) {
            this.cellSize = 64;
            this.width = dimension.width,
            this.height = dimension.height;
            this.cellWidthCount = Math.floor(this.width / this.cellSize);
            this.cellHeightCount = Math.floor(this.height / this.cellSize);
        }
        
        // найти блок в котором создаются холсты.
        findBlock(blockSelector) {
            let block = document.querySelector(blockSelector);
            if (!block) {
                block = document.body;
            }
            return block;
        }
        
        // Создать холсты
        createCanvas(block) {
            this.layers.worldPlane = document.createElement('canvas');
            this.layers.worldPlane.className = "worldplane"; // + id;
            this.layers.objectPlane = document.createElement('canvas');
            this.layers.objectPlane.className = "objectplane"; // + id;
            
            this.layers.ghostPlane = document.createElement('canvas');
            this.layers.ghostPlane.className = "ghostPlane"; // + id;
            this.layers.ghostPlane.style.opacity = 0.3;
            
            block.append(this.layers.worldPlane);
            block.append(this.layers.objectPlane);
            block.append(this.layers.ghostPlane);
            
            // envPlane = this.layers.worldPlane.getContext('2d');
            // constructions = this.layers.objectPlane.getContext('2d');
            // ghosts = this.layers.ghostPlane.getContext('2d');
            this.layers.ghostPlane.style.cursor = 'pointer';
        }
        
        // изменить холсты.
        setScreenDimensions() {
            this.layers.worldPlane.width = this.width;
            this.layers.worldPlane.height = this.height;
            this.layers.objectPlane.width = this.width;
            this.layers.objectPlane.height = this.height;
            this.layers.ghostPlane.width = this.width;
            this.layers.ghostPlane.height = this.height;
            
            this.layers.worldPlane.style.position = 'absolute';
            this.layers.worldPlane.style.left = '12px';
            this.layers.worldPlane.style.top = '0px';
            
            // this.layers.objectPlane.style.left = -this.width + 'px';
            // this.layers.objectPlane.style.marginTop = -this.height + 'px';
            this.layers.objectPlane.style.position = 'absolute';
            this.layers.objectPlane.style.left = '12px';
            this.layers.objectPlane.style.top = '0px';
            
            // this.layers.ghostPlane.style.left = -this.width + 'px';
            // this.layers.ghostPlane.style.marginTop = -this.height + 'px';
            this.layers.ghostPlane.style.position = 'absolute';
            this.layers.ghostPlane.style.left = '12px';
            this.layers.ghostPlane.style.top = '0px';
        }
        
        // очистить указанный слой
        clearLayer(plan) {
            let layer = plan.getContext('2d');
            layer.clearRect(0, 0, this.width, this.height);
        }
        
        // перевести в координаты ячейки
        coordToCell(value) {
            return Math.floor(value / this.cellSize);
        }
        
        // получить координаты клика по экрану.
        clickEvent(event) {
            let x = this.coordToCell(event.offsetX),
            y = this.coordToCell(event.offsetY);
            return {x, y};
        }
        
        // отрисовывает спрайт
        showSprite(x, y, sx, sy) {
            let sourceCellSize = 33, dx = 0, dy = 0,
            envPlane = this.layers.worldPlane.getContext('2d');
            
            envPlane.drawImage(
                this.image,
                sx * sourceCellSize,
                sy * sourceCellSize, 
                sourceCellSize - 1,
                sourceCellSize - 1, 
                x * this.cellSize,
                y * this.cellSize, 
                Math.ceil(this.cellSize),
                Math.ceil(this.cellSize)
            );
        }
        
        // отобразить тайл в ячейке.
        showCell(x, y, cell) {
            let groupCoord;
            if (!cell.type) return false;
            
            // составлять тайл из 1го спрайта
            groupCoord = [cell.tileSet[0], cell.tileSet[1]];
            this.showSprite(x, y, groupCoord[0], groupCoord[1]);
        }
        
        // отобразить матрицу объектов
        show(matrix) {
            let row;
            this.clearLayer(this.layers.objectPlane);
            let i, j;
            for (i=0; i < matrix.length; i++) {
                row = matrix[i];
                for (j=0; j < row.length; j++) {
                    this.showCell(j, i, row[j]);
                }
            }
            // console.log(matrix.length); // тест подстройки экрана под камеру
        }
        
        // установить значения ширины и высоты экрана в количестве ячеек - масштаб экрана.
        setScale(size) {
            this.cellSize = Math.min(Math.floor(this.width / size.width), Math.floor(this.height / size.height));
            this.cellWidthCount = size.width;
            this.cellHeightCount = size.height;
            
            this.setScreenDimensions();
        }
        
        // Перерисовать экран
        redraw(picture) {
            let worldState = scene.getWorld();
            self.show(picture);
            // camera.timerId = null;
        }
    }
    
    // Erid Nord
    return new Screen(options);
};