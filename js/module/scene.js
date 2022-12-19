function createScene(width, height) {
    let self;
    
    class Cell {
        constructor(type, x, y) {
            this.type = type;
            this.tileSet = JSON.parse(JSON.stringify(enviroment.getProperty(type, 'tileSet')));
            this.x = x;
            this.y = y;
            this.build = false;
        }
    }
    
    class Scene {
        constructor(width, height) {
            this.name = 'Модуль сцены';
            this.version = '2.1';
            
            this.setDimensions(width, height);
            this.world = this.createMatrix();
            self = this;
        }
        
        // информация о модуле
        info() {
            return this.name + '. v' + this.version + '(' + this.width + 'x' + this.height + ')';
        }
        
        // получить текущие значения ширины и высоты сцены
        getDimension() {
            return {width:this.width, height:this.height};
        }
        
        // установить размеры мира
        setDimensions(width, height) {
            this.width = width ? width: 64;
            this.height = height ? height: 64;
        }
        
        // создание матрицы сцены из сетки ячеек.
        createMatrix() {
            let matrix = [], row;
            for (let i=0; i < this.height; i++) {
                row = [];
                for (let j=0; j < this.width; j++) {
                    row[j] = new Cell('sea', j, i);
                }
                matrix[i] = row;
            }
            
            return matrix;
        }
        
        // Получить матрицу мира
        getWorld() {
            return this.world;
        }
        
        // получить снимок из сцены по координатам
        getPicture(x, y, width, height) {
            // запрос не должен выходить за край мира
            let rWidth = (x + width < this.width) ? width: this.width - x, 
            rHeight = (y + height < this.height) ? height: this.height - y,
            row, picture = [];
            
            for (let i=0; i < rHeight; i++) {
                row = [];
                for (let j=0; j < rWidth; j++) {
                    row[j] = this.world[y+i][x+j];
                }
                picture[i] = row;
            }
            return picture;
        }
        
        // проверка попадания координаты в диапазон
        in_diapason(coord, diapason) {
            if (coord < diapason[0]) return false;
            if (coord >= diapason[1]) return false;
            return true;
        }
        
        // ---------- Методы редактирования сцены ----------
        // получить одну клетку по координатам.
        getCell(coord) {
            return JSON.parse(JSON.stringify(this.world[coord.y][coord.x]));
        }
        
        changeTile(coord, tile) {
            this.world[coord.y][coord.x].tileSet = tile;
        }
        
        // получить все клетки вокруг заданной в виде массива
        getCellsAround(coord) {
            let list = [];
            for (let i = -1; i < 2; i++) {
                if (coord.y + i < 0 || coord.y + i >= height) continue;
                for (let j = -1; j < 2; j++) {
                    if (coord.x + j < 0 || coord.x + j >= width) continue;
                    list.push(this.world[coord.y + i][coord.x + j]);
                }
            }
            
            return list;
        }
        
        // определить на какую территорию и какую клетку меняем
        editTerritory(point, cameraState) {
            let element = document.querySelector('.editterritory'),
            env = element.options[element.selectedIndex].value,
            coord = {x: point.x + cameraState['x'], y: point.y + cameraState['y']};
            
            if (env == '0') return false;
            this.editBrush(coord, env);
            return env;
        }
        
        // Изменить клетки под кистью
        editBrush(coord, env) {
            let i, j, brushSize = 1, ncoord, 
            singleStart = true,
            element = document.querySelector('.editbrush');
            
            brushSize = element.options[element.selectedIndex].value - 0;
        
            for (i = coord.y; i < coord.y + brushSize; i++) {
                if (i > height - 1) continue;
                for (j = coord.x; j < coord.x + brushSize; j++) {
                    if (j > width - 1) continue;
                    ncoord = {x: j, y: i};
                    
                    this.edit(ncoord, env, singleStart);
                    singleStart = false;
                }
            }
            
            return true;
        }
        
        // отмена предыдущего действия, через декремент, иначе не стирается двойное изменение ланшафта, когда кисть > 1 и переход от моря например к лесу.
        cancel() {
            let transaction = editor.cancel();
            if (transaction) {
                for (let i=transaction.length-1; i>=0; i--) {
                    this.edit({x: transaction[i].x, y: transaction[i].y}, transaction[i].type, false, false);
                }
            }
        }
        
        // применить отменённое изменение
        reduce() {
            let transaction = editor.reduce();
            if (transaction) {
                let length = transaction.length;
                for (let i=0; i < length; i++) {
                    this.edit({x: transaction[i].x, y: transaction[i].y}, transaction[i].oldType, false, true);
                }
            }
        }
        
        // Изменить покрытие данной клетки.
        edit(coord, env, startTransaction = true, writeHistory = true) {
            let element = this.world[coord.y][coord.x],
            typeLand = enviroment.getOne(env),
            oldEnv = element.type;
            
            // if (typeLand.type == element.type) return false;
            
            editor.editHistory(coord, oldEnv, env, startTransaction, writeHistory);
            element.type = env;
            
            element.tileSet = editor.changePicture(self.getCell(coord), env, this.getDimension());
            
            // если тип поля не изменился то менять территории вокруг не нужно
            if (oldEnv != env) {
                editor.changeAround(coord, env, writeHistory);
            }
        }
        
        // Получить id здания размещённого на клетке
        getBuildId(coord) {
            if (!in_diapason(coord.y, [0, this.height])) return null;
            if (!in_diapason(coord.x, [0, this.width])) return null;
            return this.world[coord.y][coord.x].build;
        }
        
        // ----- методы загрузки и сохранения. -----
        // Формат даты
        dateFormat(date) {
            let year, month, day, hours, minuts, seconds;
            year = date.getFullYear();
            month = date.getMonth() + 1;
            if (month < 10) month = '0' + month;
            day = date.getDate();
            if (day < 10) day = '0' + day;
            hours = date.getHours();
            if (hours < 10) hours = '0' + hours;
            minuts = date.getMinutes();
            if (minuts < 10) minuts = '0' + minuts;
            seconds = date.getSeconds();
            if (seconds < 10) seconds = '0' + seconds;
            
            return year + '.' + month + '.' + day + ' ' + hours + ':' + minuts + ':' + seconds;
        }
        
        // Сохранить сцену
        save() {
            // ширина и высота world
            let 
                now = this.dateFormat(new Date()),
                code = '' + this.width + ' ' + this.height + ' ' + now + '\n',
                row = null;
            
            for (let i=0; i < this.world.length; i++) {
                row = this.world[i];
                code += this.prepareFileRow(row);
            }
            
            return code;
        }
        
        // Подготовить строку мира для сохранения
        prepareFileRow(row) {
            let dateSet = {row: [], last: -1, count: 1};
            
            for (let j=0; j < row.length; j++) {
                dateSet = this.prepareFileCell(this.packData(row[j]), dateSet, j == row.length - 1);
            }
            
            return dateSet.row.join('|') + '\n';
        }
        
        // оптимизация объёма сохранения
        prepareFileCell(curCell, dateSet, end) {
            let row = dateSet.row,
            last = dateSet.last,
            count = dateSet.count;
            
            if (curCell == last) {
                count++;
            } else {
                if (count > 1) {
                    last += 'x' + count;
                }
                if (last != -1) row.push(last);
                count = 1;
            }
            
            last = curCell;
            
            if (end) {
                if (count > 1) {
                    last += 'x' + count;
                }
                row.push(last);
                last = -1;
                count = 1;
            }
            
            return {row, last, count};
        }
        
        // Общая загрузка карты по переданной строке
        loadMap(content) {
            self.world = null;
            self.world = self.load(content.result);
            // self.loadBuilds();
            
            document.getElementById("worldLoaded").click();
        }
        
        // Загрузить сцену из файла
        load(content) {
            let matrix = [],
            data = content.split(/[\n\r]+/),
            line = [], height, width, row,
            bufLine = [],
            landsType = enviroment.getList(); // оптимизация сохранения
            
            editor.clearHistory();
            line = data[0].split(' ');
            width = line[0] - 0;
            height = line[1] - 0;
            this.setDimensions(width, height);
            
            for (let i=1; i <= height; i++) { // 0я строка - это метаданные карты.
                row = [];
                line = data[i].split('|');
                if (!line[0]) continue;
                
                bufLine = this.loadBlock(line);
                
                for (let j=0; j < width; j++) {
                    row[j] = this.unPackData(landsType, bufLine[j], j, i-1);
                }
                matrix[i-1] = row; // первая строка файла содержит размерность мира.
            }
            
            data.splice(0, height + 1);
            // loadingBuilds = buildFactory.load(data);
            
            row = null;
            data = null;
            return matrix;
        }
        
        // разбираем блоки (клетка х количество) внутри строки
        loadBlock(line) {
            let result = [],
            t = 0,
            count = 1,
            ter = [0, 0];
            
            for (let j=0; j < line.length; j++) {
                ter = line[j].split('x');
                count = ter[1] ? ter[1]: 1;
                ter = ter[0];
                
                for (let k=0; k < count; k++) {
                    result[t] = ter;
                    t++;
                }
            }
            
            return result;
        }
        
        // Запоковать данные.
        packData(field) {
            let typeLand = enviroment.getOne(field.type);
            let idSet = field.tileSet[0] + field.tileSet[1] * 32;//; [[0, 0], [0, 1], [0, 2], [0, 3]];
            return typeLand.id * 1024 + idSet;
        }
        
        // распаковка данных
        unPackData(landsType, line, x, y) {
            if (!line) line = 1578; // после сбоя в сохранении в строке оказалось 109/110 тайлов
            let typeId = Math.floor(line/1024);
            
            // if (landsType[typeId].type != 'sea') 
                // console.log(line, typeId, enviroment, landsType, landsType[typeId].type);
            
            let newcell = new Cell(landsType[typeId].type, x, y);
            
            newcell.tileSet = [line % 32, Math.floor(line/32) % 32];
            
            return newcell;
        }
    }
    
    // Erid Nord
    return new Scene(width, height);
};