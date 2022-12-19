class Datatype {
    constructor(name, type, imageUrl) {
        this.name = name;
        this.version = "0.8";
        this.content = false;
        this.loaded = false;
        if (imageUrl) {
            this.image = new Image(); // основное изображение, если есть
            this.image.src = 'tiles/summer.png';
        }
        this.init('/tiles/mapedit_com/page/type.php', type, imageUrl);
        this.allEnviromentNameCash = false;
        let self = this;
    }
    
    info() {
        return this.name + ' v' + this.version;
    }
    getAll() {
        return this.content;
    }
    getOne(type) {
        return this.content[type];
    }
    
    tileLoaded() {
        return this.loaded;
    }
    
    getTile() {
        return this.image;
    }
    
    // вернуть кэшируемый список объектов
    getList() {
        if (this.allEnviromentNameCash) return this.allEnviromentNameCash;
        let list = [];
        for(let key in this.content) {
            list.push({
                type: key,
                name: this.content[key].name
            });
        }
        this.allEnviromentNameCash = list.length ? list: false;
        return this.allEnviromentNameCash;
    }
    
    getProperty(type, property) {
        return this.content[type][property];
    }
    
    // инициализация существующих объектов
    init(url, action, imageUrl) {
        let self = this;
        
        if (!system) {
            console.error('Не подключен системный модуль.');
            return false;
        }
        
        if (this.image) {
            this.image.onload = function() {
                self.loaded = true;
            }
            this.image.onerror = function() {
                self.loaded = true;
                console.log('image error', imageUrl);
            }
        }
        
        system.request(url, action).then(
            result => {
                self.content = JSON.parse(result);
            },
            error => console.log(error)
        );
        
        return true;
    }
    // Erid Nord
}