function createMap(options = {}) {
    let self;
    
    class Map {
        constructor(options) {
            this.name = 'Модуль миникарты';
            this.version = '0.8';
            this.setDimension(options);
            // надо создать 2 холста чтобы не перерисовывать всю карту при движении камеры
            this.minimap = this.createCanvas(this.findBlock(options.blockSelector));
            this.enviroment = this.minimap.getContext('2d');
            this.setScreenDimensions();
            self = this;
        }
        
        // информация о модуле
        info() {
            return this.name + '. v' + this.version;
        }
        
        // получить текущие значения ширины и высоты карты
        getDimension() {
            return {width: this.width, height: this.height};
        }
        
        // установить значения ширины и высоты экрана и ячеек
        // (пока не учитывается размер сцены)
        setDimension(options) {
            this.width = options.width;
            this.height = options.height;
            let scrWidth = options.screenWidth;
            this.cellSize = scrWidth >= 1700 ? 3: 2;
            if (scrWidth < 800) {
                this.cellSize = 1;
            }
        }
        
        // найти блок в котором создаётся карта.
        findBlock(blockSelector) {
            let block = document.querySelector(blockSelector);
            if (!block) block = document.body;
            return block;
        }
        
        // Создать холст
        createCanvas(block) {
            let canvas = document.createElement('canvas');
            canvas.className = "minimap_canvas";
            block.append(canvas);
            return canvas;
        }
        
        // изменить холст.
        setScreenDimensions() {
            this.minimap.width = this.width * this.cellSize;
            this.minimap.height = this.height * this.cellSize;
        }
        
        // отобразить объект в ячейке.
        showCell(x, y, cell) {
            let typeLand, build;
            typeLand = enviroment.getOne(cell.type);
            if (!typeLand.type) return false;
            
            this.enviroment.fillStyle = typeLand.mapColor;
            
            // if (cell.build) {
                // this.enviroment.fillStyle = this.showBuild(cell.build);
            // }
            this.enviroment.fillRect(x*this.cellSize, y*this.cellSize, this.cellSize, this.cellSize);
        }
        
        // отобразить здание в ячейке.
        showBuild(buildLink) {
            build = buildFactory.get(buildLink);
            if (build.fraction) {
                this.enviroment.fillStyle = buildFactory.fractionsFlag()[build.fraction]['mapColor'];
            }
        }
        
        // отобразить камеру на карте.
        showCamera(camera) {
            this.enviroment.strokeStyle  = camera.color;
            this.enviroment.strokeRect(camera.x*this.cellSize, camera.y*this.cellSize, camera.width*this.cellSize, camera.height*this.cellSize);
        }
        
        // отобразить матрицу объектов
        show(matrix, camera = {}) {
            let row;
            for (let i=0; i < matrix.length; i++) {
                row = matrix[i];
                for (let j=0; j < row.length; j++) {
                    this.showCell(j, i, row[j]);
                }
            }
            
            this.showCamera(camera.getState());
        }
        
        // Обработчик события клика по карте.
        clickEvent(event) {
            let x = Math.floor(event.offsetX / this.cellSize),
            y = Math.floor(event.offsetY / this.cellSize);
            return {x, y};
        }
    }
    
    // Erid Nord
    return new Map(options);
};