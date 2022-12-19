function createCamera(options = {}) {
    let self;
    
    class Camera {
        constructor(options) {
            this.name = 'Модуль Камеры';
            this.version = '1.1';
            this.color = options['color'] ? options['color']: 'blue';
            this.setDimensions(options);
            this.scale = 3;
            this.setScale();
            this.controlKey = {left: false, right: false, up: false, down: false};
            self = this;
        }
        
        // информация о модуле
        info() {
            return this.name + '. v' + this.version;
        }
        
        // Изменение масштаба при прокрутке колеса
        onWheel(e) {
            e = e || window.event;
            // wheelDelta не даёт возможность узнать количество пикселей
            let delta = e.deltaY || e.detail || e.wheelDelta;
            this.scale += delta > 0 ? 1: -1;
            this.scale = this.scale <= 0 ? 1: this.scale;
            this.scale = this.scale >= 7 ? 6: this.scale;
            self.setScale();
            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
            
            return this.scale;
        }
        
        // Размер ширины камеры в зависимости от размера экрана
        setDimensions(options) {
            this.sizeModificator = 3.5;
            if (options.globalWidth > 768) {
                this.sizeModificator = 2;
            }
            if (options.globalWidth > 992) {
                this.sizeModificator = 0;
            }
            if (options.globalWidth > 1200) {
                this.sizeModificator = -2;
            }
            if (options.globalWidth >= 1700) {
                this.sizeModificator = -3;
            }
            
            this.cameraX = options['x'] ? options['x']: 5;
            this.cameraY = options['y'] ? options['y']: 5;
        }
        
        // установить значения ширины и высоты экрана в количестве ячеек от масштаба
        setScale() {
            let ScaleCellCount = 10,
            scaleModificator = 1.0;
            switch (this.scale) {
                case 1:
                    ScaleCellCount = 7;
                    scaleModificator = 1.0;
                    break;
                case 2:
                    ScaleCellCount = 9;
                    scaleModificator = 1.2;
                    break;
                case 3:
                    ScaleCellCount = 12;
                    scaleModificator = 1.6;
                    break;
                case 4:
                    ScaleCellCount = 15;
                    scaleModificator = 1.9;
                    break;
                case 5:
                    ScaleCellCount = 20;
                    scaleModificator = 2.4;
                    break;
                case 6:
                    ScaleCellCount = 25;
                    scaleModificator = 3.0;
                    break;
                default:
            }
            this.cellWidthCount = ScaleCellCount - Math.round(this.sizeModificator * scaleModificator);
            this.cellHeightCount = ScaleCellCount;// - Math.round(this.sizeModificator * scaleModificator);
            
            console.log(this.cellWidthCount, this.cellHeightCount, this.getState());
        }
        
        // получить параметры камеры x, y, width, height
        getState() {
            return {
                x: this.cameraX,
                y: this.cameraY,
                width: this.cellWidthCount,
                height: this.cellHeightCount,
                color: this.color
            }
        }
        
        // Получить блок из переданной матрицы по параметрам камеры.
        getPicture(world) {
            let row, block = [];
            
            for (let i=0; i < this.cellHeightCount; i++) {
                row = [];
                for (let j=0; j < this.cellWidthCount; j++) {
                    row[j] = Object.create(
                        Object.getPrototypeOf(world[i+this.cameraY][j+this.cameraX]), 
                        Object.getOwnPropertyDescriptors(world[i+this.cameraY][j+this.cameraX])
                    );
                }
                block[i] = row;
            }
            
            return block;
        }
        
        // передвинуть камеру с учётом границ мира с центром по переданным координатам.
        move(coord, bounder) {
            let xbounder = bounder.width - this.cellWidthCount,
            ybounder = bounder.height - this.cellHeightCount,
            x = coord.x - Math.floor(this.cellWidthCount / 2),
            y = coord.y - Math.floor(this.cellHeightCount / 2);
            
            this.cameraX = (x < 0) ? 0: x;
            this.cameraX = (this.cameraX > xbounder) ? xbounder: this.cameraX;
            this.cameraY = (y < 0) ? 0: y;
            this.cameraY = (this.cameraY > ybounder) ? ybounder: this.cameraY;
        }
    }
    
    // Erid Nord
    return new Camera(options);
};