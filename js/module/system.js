;let system = (function() {
    let self;
    
    class Menu {
        constructor(name, elements) {
            this.name = name;
            this.elements = elements;
        }
        
        // отображение меню.
        show(selector) {
            let htmlText = '';
            this.elements.forEach(function(entry) {
                let tag = entry.href ? '<a class="nav-link '+ entry.addClass +'" href="'+ entry.href +'" title="'+ entry.title +'"><span class="fa fa-2x fa-'+ entry.icon +'"></span></a>':
                '<span class="nav-link '+ entry.addClass +'" title="'+ entry.title +'"><span class="fa fa-2x fa-'+ entry.icon +'"></span></span>';
                htmlText += '<li class="nav-item">'+ tag +'</li>';
            });
            document.querySelector(selector).innerHTML = '<ul class="navbar-nav ml-auto">'+ htmlText +'</ul>';
        }
    }
    
    class System {
        constructor() {
            this.name = 'Системный модуль';
            this.version = '0.6';
            this.appName = 'Socium: Map Editor';
            this.appVersion = '0.51';
            this.menuList = {};
            this.loading = false;
            this.reader = new FileReader();
            self = this;
            self.showInfo();
            
            this.mainMenu = new Menu('main', Array(
                {href: '', title: 'Помощь', icon: 'question', addClass: 'aboutApplication'},
                {href: '', title: 'Редактирование карты', icon: 'edit', addClass: 'editMap'},
                {href: '', title: 'Настройки', icon: 'cogs', addClass: ''},
                {href: '', title: 'Сохранить', icon: 'save', addClass: 'save'},
                {href: '', title: 'Загрузить', icon: 'folder-open', addClass: 'load'},
                {href: 'http://games.q-pax.ru/tiles/', title: 'Выйти', icon: 'window-close', addClass: ''},
            ));
            self.mainMenu.show('#navbarSupportedContent');
        }
        
        // ----- методы объекта. -----
        // информация о модуле
        info() {
            return self.name + ' v' + self.version;
        }
        
        // вывод тайтла о приложении
        showTitle() {
            document.querySelector('title').innerHTML = self.info();
        }
        
        // вывод информации о приложении
        showInfo() {
            this.showTitle();
            document.querySelector('.navbar-brand').innerHTML = self.appName;
            document.querySelector('.version').innerHTML = 'Version ' + self.appVersion;
        }
        
        width() {
            return document.documentElement.clientWidth;
        }
        
        // создавать паузу выполнения
        async pause(miliseconds) {
            let promise = new Promise((resolve, reject) => {
                setTimeout(() => resolve("готово!"), miliseconds)
            });
            
            let result = await promise; // будет ждать, пока промис не выполнится (*)
            return result;
        }
        
        // Получить код нажатой клавиши
        getChar (event) {
            if (event.which == 0) return false; // все кроме IE
            if (event.which < 37 || event.which > 90) return false; // спец. символ, 
            return event.which; // нужны только стрелки
        }
        
        // управление с клавиатуры.
        control(event) {
            let keyCode = self.getChar(event);
            
            // отмена действия редактирования.
            if (keyCode == 90 && event.ctrlKey) {
                scene.cancel();
                this.screen.redraw(this.camera.getPicture(worldState));
            }
            
            // отмена действия редактирования.
            if (keyCode == 89 && event.ctrlKey) {
                scene.reduce();
                this.screen.redraw(this.camera.getPicture(worldState));
            }
            
            this.map.show(worldState, this.camera); // this - это контекст вызова а не модуль system
        }
        
        // вешаем обработчик загрузки файлов
        load(selector, handler) {
            document.querySelector(selector).addEventListener('change', function(e) {
                self.loadFile(e.target).then(handler);
            });
        }
        
        // загрузка файла
        async loadFile(input) {
            console.log(input.files);
            let file = input.files[0];
            
            console.log("Loaded file: " + file.name, ", Size: " + file.size + " bytes");
            self.loading = true;
            this.reader.readAsText(file);
            this.reader.onload = function() {
                self.loading = false;
            };
            this.reader.onerror = function() {
                self.loading = false;
            };
            
            input.value = '';
            while (self.loading) await system.pause(8);
            return this.reader;
        }
        
        // сохранение файла
        save(name, code) {
            let link = document.createElement('a'),
            blob = new Blob([code], {type: 'text/plain'});
            
            link.download = name;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
            link = null;
            return false;
        }
        
        // Запросить у сервера данные или передать их и дождаться ответа
        async request(url, action, data = {}) {
            data['action'] = action;
            let response,
            sp = new URLSearchParams(data);
            
            response = await fetch(
                url, 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    },
                    body: sp.toString()
                }
            );
            
            return await response.text();
        }
        
        // проверить наличие элемента в массиве
        inArray(needle, haystack) {
            return (haystack.indexOf(needle) != -1);
        }
        
        // создавать произвольные меню, 
        // уметь возвращать информацию о текущем приложении
    }
    
    // Erid Nord
    return new System();
})();