function createEditor(options = {}) {
    let self;
    
    class Editor {
        constructor(options) {
            this.name = 'Модуль Редактора';
            this.version = '0.6';
            this.history = [];
            this.redHistory = [];
            this.maxLength = 40;
            this.allChangeSet = {
                'sea': enviroment.getProperty('sea', 'changeSet'),
                'plain': enviroment.getProperty('plain', 'changeSet'),
                'forest': enviroment.getProperty('forest', 'changeSet'),
                'hill': enviroment.getProperty('hill', 'changeSet'),
                'swamp': enviroment.getProperty('swamp', 'changeSet'),
                'mountain': enviroment.getProperty('mountain', 'changeSet'),
                'coast': enviroment.getProperty('coast', 'changeSet'),
                'road': enviroment.getProperty('road', 'changeSet'),
            }
            self = this;
        }
        
        // информация о модуле
        info() {
            return this.name + '. v' + this.version;
        }
        
        createMenuList() {
            let items;
            items = {
                    0:{
                        type: 1,
                        name: '1x1'
                    },
                    1:{
                        type: 2,
                        name: '2x2'
                    },
                    2:{
                        type: 3,
                        name: '3x3'
                    },
                    3:{
                        type: 7,
                        name: '7x7'
                    },
                    4:{
                        type: 15,
                        name: '15x15'
                    },
            };
            this.createEditMenu('brush', 'Brush', items, 'Размер кисти', 'brush', false, 4);
            items = enviroment.getAll();
            this.createEditMenu('enviroment', 'Territory', items, 'Редактирование территорий', 'territory');
            items = type_build.getAll();
            this.createEditMenu('building', 'Build', items, 'Редактирование Зданий', 'build');
        }
        
        // создать меню редактирования территорий.
        createEditMenu(type, itemClass, items, title, name, showNone = true, elementNumInRows = 3) {
            let block = document.querySelector('.edit_map_block'),
            result = '';
            
            result = `<h4 class="card-title">${title}</h4><select class="tabs edit${name}" name="${name}">`;
            result += showNone ? `<option value="0" id="${type}_0" class="edit${itemClass}">Ничего</option>`: '';
            
            for (let prop in items) {
                result += `<option value="${items[prop].type}" id="${type}_${items[prop].type}" class="edit${itemClass}">${items[prop].name}</option>`;
            }
            result +=  `</select>`;
            
            block.innerHTML = block.innerHTML + result;
        }
        
        // Пишем историю изменений в редакторе
        editHistory(coord, type, oldType, startTransaction, writeHistory = true) {
            if (!writeHistory) return false; // не пишем в историю действия отмены
            if (startTransaction) {
                this.addTransaction();
            }
            this.addEvent({x: coord.x, y: coord.y, type, oldType});
        }
        
        // добавить совершённую транзакцию действий в историю
        addTransaction() {
            this.history.push([]);
            if (this.history.length > this.maxLength) {
                this.history.shift();
            }
            this.redHistory = [];
        }
        
        // добавить в цепочку транзакции действие
        addEvent(event) {
            this.history[this.history.length - 1].push(event);
        }
        
        // получить транзакцию действий и удалить её из истории
        cancel() {
            let action = this.history.pop();
            if (action) {
                this.redHistory.push(action);
                
                if (this.redHistory.length > this.maxLength) {
                    this.redHistory.shift();
                }
            }
            return action;
        }
        
        reduce() {
            let action = this.redHistory.pop();
            if (action) {
                this.history.push(action);
            }
            return action;
        }
        
        // очистить историю транзакций.
        clearHistory() {
            this.history = [];
        }
        
        // ---------- Графические преобразования ----------
        // изменить вокруг клетки для состыковки тайлов.
        changeAround(coord, enviroment, writeHistory = true) {
            let cellList = scene.getCellsAround(coord);
            for (let i=0; i<cellList.length; i++) {
                this.changeCell(cellList[i], enviroment, writeHistory);
            }
        }
        
        // изменить клетку в зависимости от окружающего ландшафта
        changeCell(coord, enviroment, writeHistory) {
            let curEnviroment = coord.type;
            let element = scene.getCell(coord);
            
            if ((enviroment == 'sea')
                && element.type != 'sea' 
                && element.type != 'coast') {
                scene.edit({x: coord.x, y: coord.y}, 'coast', false, writeHistory);
            } else if (
                (enviroment != 'sea' && enviroment != 'coast')
                && (element.type == 'sea')) {
                scene.edit({x: coord.x, y: coord.y}, 'coast', false, writeHistory);
            } else {
                scene.changeTile(coord, this.changePicture(element, element.type, scene.getDimension()));
            }
            
            return false;
            
            if ((enviroment == 'forest' || enviroment == 'swamp' || enviroment == 'road')
                && element.type != 'plain' 
                && element.type != 'forest' 
                && element.type != 'swamp'
                && element.type != 'road') {
                scene.edit({x: coord.x, y: coord.y}, 'plain', false, writeHistory);
            } else if (
                (enviroment == 'sea' 
                    || enviroment == 'mountain'
                    || enviroment == 'hill'
                    || enviroment == 'coast'
                )
                && (element.type == 'forest' 
                    || element.type == 'swamp'
                    || element.type == 'road')) {
                scene.edit({x: coord.x, y: coord.y}, 'plain', false, writeHistory);
            } else {
                element.tileSet = this.changePicture(element, curEnviroment, scene.getDimension());
            }
        }
        
        changePicture(element, env, dimension) {
            let idiogramm = this.cellIdiogramm({x: element.x, y: element.y}, env, dimension),
            // typeLand = enviroment.getOne(element.type),
            //chTileSet = this.allChangeSet[element.type];
            chTileSet = this.allChangeSet[env],
            tileSet = element.tileSet;
            
            // одиночный тайл
            if (this.likeTemplate(idiogramm, '1-1--1-1')) {
                tileSet = chTileSet[0][0];
            } else if(this.likeTemplate(idiogramm, '-0-00-0-')) {
                tileSet = chTileSet[0][0];
            }
            
            // блок, группа, координата x|y - tileset указывает на changeset типа
            // уголки
            if (this.likeTemplate(idiogramm, '1-0--0-0')) {
                tileSet = chTileSet[1][0];
            } else if (this.likeTemplate(idiogramm, '0-1--0-0')) {
                tileSet = chTileSet[1][1];
            } else if (this.likeTemplate(idiogramm, '0-0--1-0')) {
                tileSet = chTileSet[1][2];
            } else if (this.likeTemplate(idiogramm, '0-0--0-1')) {
                tileSet = chTileSet[1][3];
            }
            
            // T-образ
            // if (idiogramm[1] == '1') {
                // tileSet = chTileSet[2][0];
            // } else if (idiogramm[3] == '1') {
                // tileSet = chTileSet[2][1];
            // } else if (idiogramm[4] == '1') {
                // tileSet = chTileSet[2][2];
            // } else if (idiogramm[6] == '1') {
                // tileSet = chTileSet[2][3];
            // }
            
            // T-образ
            if (this.likeTemplate(idiogramm, '-1-00-0-')) {
                tileSet = chTileSet[2][0];
            } else if (this.likeTemplate(idiogramm, '-0-10-0-')) {
                tileSet = chTileSet[2][1];
            } else if (this.likeTemplate(idiogramm, '-0-01-0-')) {
                tileSet = chTileSet[2][2];
            } else if (this.likeTemplate(idiogramm, '-0-00-1-')) {
                tileSet = chTileSet[2][3];
            }
            
            // 3/4
            if (idiogramm[1] == '1' && idiogramm[3] == '1') {
                tileSet = chTileSet[3][0];
            } else if (idiogramm[1] == '1' && idiogramm[4] == '1') {
                tileSet = chTileSet[3][1];
            } else if (idiogramm[3] == '1' && idiogramm[6] == '1') {
                tileSet = chTileSet[3][2];
            } else if (idiogramm[4] == '1' && idiogramm[6] == '1') {
                tileSet = chTileSet[3][3];
            }
            
            // 3/4 со смещением
            if (this.likeTemplate(idiogramm, '10001000')) {
                tileSet = chTileSet[3][1];
            } else if (this.likeTemplate(idiogramm, '10000010')) {
                tileSet = chTileSet[3][2];
            } else if (this.likeTemplate(idiogramm, '00110000')) {
                tileSet = chTileSet[3][0];
            } else if (this.likeTemplate(idiogramm, '00100010')) {
                tileSet = chTileSet[3][3];
            } else if (this.likeTemplate(idiogramm, '01000100')) {
                tileSet = chTileSet[3][0];
            } else if (this.likeTemplate(idiogramm, '00001100')) {
                tileSet = chTileSet[3][3];
            } else if (this.likeTemplate(idiogramm, '01000001')) {
                tileSet = chTileSet[3][1];
            } else if (this.likeTemplate(idiogramm, '00010001')) {
                tileSet = chTileSet[3][2];
            }
            
            // диагонали
            if (element.type == 'plain') {
                if (this.likeTemplate(idiogramm, '-010010-')) {
                    tileSet = chTileSet[4][1];
                } else if (this.likeTemplate(idiogramm, '10-00-01')) {
                    tileSet = chTileSet[4][0];
                }
            } else {
                if (this.likeTemplate(idiogramm, '10-00001')) {
                    tileSet = chTileSet[4][0];
                } else if (this.likeTemplate(idiogramm, '10000-01')) {
                    tileSet = chTileSet[4][0];
                } else if (this.likeTemplate(idiogramm, '-0100100')) {
                    tileSet = chTileSet[4][1];
                } else if (this.likeTemplate(idiogramm, '0010010-')) {
                    tileSet = chTileSet[4][1];
                }
            }
            
            // для любого типа, если все клетки рядом того же типа устанавливается клетка чистого типа
            if (idiogramm[1] == '1' && idiogramm[6] == '1') {
                tileSet = chTileSet[0][0];
            } else if (idiogramm[3] == '1' && idiogramm[4] == '1') {
                tileSet = chTileSet[0][0];
            }
            
            // линейные объекты
            // выступы и прямые
            if (element.type == 'road' || element.type == 'forest' || element.type == 'plain' || element.type == 'mountain' || element.type == 'swamp' || element.type == 'hill') {
                if (this.likeTemplate(idiogramm, '-1-11-0-')) {
                    tileSet = chTileSet[5][0];
                } else if (this.likeTemplate(idiogramm, '-1-10-1-')) {
                    tileSet = chTileSet[5][1];
                } else if (this.likeTemplate(idiogramm, '-1-01-1-')) {
                    tileSet = chTileSet[5][2];
                } else if (this.likeTemplate(idiogramm, '-0-11-1-')) {
                    tileSet = chTileSet[5][3];
                } else if (this.likeTemplate(idiogramm, '-0-11-0-')) {
                    tileSet = chTileSet[5][4];
                } else if (this.likeTemplate(idiogramm, '-1-00-1-')) {
                    tileSet = chTileSet[5][5];
                }
            }
            
            if (element.type == 'plain' || element.type == 'swamp' || element.type == 'hill') {
                // уголки рядом с прямыми
                if (this.likeTemplate(idiogramm, '01101111')) {
                    tileSet = chTileSet[3][3];
                } else if (this.likeTemplate(idiogramm, '00111111')) {
                    tileSet = chTileSet[3][3];
                } else if (this.likeTemplate(idiogramm, '11110110')) {
                    tileSet = chTileSet[3][0];
                } else if (this.likeTemplate(idiogramm, '11111100')) {
                    tileSet = chTileSet[3][0];
                }
                if (this.likeTemplate(idiogramm, '11010111')) {
                    tileSet = chTileSet[3][2];
                } else if (this.likeTemplate(idiogramm, '10011111')) {
                    tileSet = chTileSet[3][2];
                } else if (this.likeTemplate(idiogramm, '11101011')) {
                    tileSet = chTileSet[3][1];
                } else if (this.likeTemplate(idiogramm, '11111001')) {
                    tileSet = chTileSet[3][1];
                }
                
                // уголки рядом с диагоналями
                if (idiogramm == '00011111') {
                    tileSet =  JSON.stringify(element.tileSet) ==  JSON.stringify(chTileSet[3][2]) ? chTileSet[3][3]: chTileSet[3][2];
                } else if (idiogramm == '11010110') {
                    tileSet = JSON.stringify(element.tileSet) == JSON.stringify(chTileSet[3][2]) ? chTileSet[3][0]: chTileSet[3][2];
                } else if (idiogramm == '11111000') {
                    tileSet = JSON.stringify(element.tileSet) == JSON.stringify(chTileSet[3][1]) ? chTileSet[3][0]: chTileSet[3][1];
                } else if (idiogramm == '01101011') {
                    tileSet =  JSON.stringify(element.tileSet) ==  JSON.stringify(chTileSet[3][1]) ? chTileSet[3][3]: chTileSet[3][1];
                }
            }
            
            // поворотный угол
            if (this.likeTemplate(idiogramm, '-1-10-0-')) {
                tileSet = chTileSet[3][0];
            } else if (this.likeTemplate(idiogramm, '-1-01-0-')) {
                tileSet = chTileSet[3][1];
            } else if (this.likeTemplate(idiogramm, '-0-10-1-')) {
                tileSet = chTileSet[3][2];
            } else if (this.likeTemplate(idiogramm, '-0-01-1-')) {
                tileSet = chTileSet[3][3];
            }
            
            // одиночный тайл
            if (idiogramm == '11111111') {
                tileSet = chTileSet[0][1];
            }
            
            // одиночный тайл
            if (idiogramm == '00000000') {
                tileSet = chTileSet[0][0];
            }
            
            //tileSet = typeLand.tileSet;
            
            return tileSet;
        }
        
        likeTemplate(value, template) {
            for (let i=0; i<8; i++) {
                if (template[i] == '-') continue;
                if (value[i] != template[i]) return false;
            }
            return true;
        }
        
        // построить идиограмму клетки. (Соседние равнины и лес считаются одинаковыми)
        cellIdiogramm(coord, enviroment, dimension) {
            let result = '', element = false;
            
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    if (!i && !j) continue;
                    // проверка за выход границ мира
                    if (coord.y + i < 0 
                        || coord.y + i >= dimension.height
                        || coord.x + j < 0
                        || coord.x + j >= dimension.width) {
                        result += '0';
                        continue;
                    }
                    
                    element = scene.getCell({x: coord.x + j, y: coord.y + i});
                    if (
                        ((['forest', 'swamp', 'road'].indexOf(element.type) + 1) && enviroment == 'plain')
                        || (element.type == 'sea' && enviroment == 'coast')
                    ) {
                        result += '0';
                        continue;
                    }
                    if (element.type != enviroment) {
                        result += '1';
                        continue;
                    }
                    result += '0';
                }
            }
            return result;
        }
    }
    
    // Erid Nord
    return new Editor(options);
};