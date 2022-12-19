<?session_start(['cookie_lifetime' => 2*86400]);
$version = '0.3';
$allDataTypes = initTypes();
echo json_encode($allDataTypes[$_POST['action']]);

function getFractionNum($searchFraction, $protoFractions) {
    foreach ($protoFractions as $key => $fraction) {
        if ($fraction['type'] == $searchFraction) return $key;
    }
    return false;
}

// обнуление данных экономики.
function incomeNull() {
    foreach ($allDataTypes['fraction'] as $key => $fraction) {
        if (!$key) continue;
        $allDataTypes['fraction'][$key]['income'] = 0;
        $allDataTypes['fraction'][$key]['upkeep'] = 0;
        $allDataTypes['fraction'][$key]['totalUpkeep'] = 0;
        $allDataTypes['fraction'][$key]['castels'] = 0;
    }
}

// получить юнит по типу
function getUnit($type, $allProtoUnits) {
    if (!$type) return false;
    foreach ($allProtoUnits as $key => $unit) {
        if ($unit['type'] == $type) return $unit;
    }
    return false;
}

// удаление героя
function deleteHero($hero, $fraction) {
    $allDataTypes['fraction'][getFractionNum($fraction)]['heroReserve'][] = array('avatar' => $hero.avatar, 'name' => $hero.name);
    $allDataTypes['fraction'][getFractionNum($fraction)]['heroNum']--;
}

// выбор случайного героя
function randomHero($fraction) {
    $total = count($allDataTypes['fraction'][getFractionNum($fraction)]['heroReserve']);
    if ($total == 0) return false;
    return rand(0, count($total));
}

// выбор героя из доступных
function getReserveInfo($fraction, $num) {
    return $allDataTypes['fraction'][getFractionNum($fraction)]['heroReserve'][$num]['name'];
}

function initTypes() {
    return array(
        'version' => '0.2',
        'enviroment' => array(
            'sea' => array(
                'id' => 0,
                'type' => "sea",
                'name' => "Море",
                'color' => "#0049c4",
                'mapColor' =>  "#0049c4",
                'src' => 'summer.png',
                'moveType' => "water",
                'move' => 2,
                'moveDiagonal' => 3,
                'tileSet' => [10, 17],
                'changeSet' => [
                    [[10, 17], [10, 17]],
                    [[4, 17], [3, 17], [18, 16], [10, 16]], // углы
                    [[0, 17], [15, 16], [5, 16], [0, 16]], // прямые
                    [[11, 16], [4, 16], [17, 15], [15, 15]], // 3/4
                    [[10, 16], [13, 16]],
                ],
            ),
            'coast' => array(
                'id' => 1,
                'type' => "coast",
                'name' => "Побережье",
                'color' => "#5272FF",
                'mapColor' => "#5272FF",
                'src' => 'summer.png',
                'moveType' => "water",
                'move' => 4,
                'moveDiagonal' => 6,
                'tileSet' => [5, 17],
                'changeSet' => [
                    [[5, 17], [11, 17]], // заполненное: деструктурируемое и инкрементируемое
                    [[7, 12], [4, 12], [18, 11], [11, 11]], // углы
                    [[2, 12], [17, 11], [8, 11], [3, 11]], // прямые
                    [[12, 11], [4, 11], [0, 11], [16, 10]], // 3/4
                    [[9, 11], [14, 11]], // по диагонали
                ],
            ),
            'road' => array(
                'id' => 2,
                'type' => "road",
                'name' => "Дорога",
                'color' => "#9b7653",
                'mapColor' => "#9b7653",
                'src' => 'summer.png',
                'moveType' => "land",
                'move' => 2,
                'moveDiagonal' => 3,
                'tileSet' => [14, 1],
                'changeSet' => [
                    [[14, 1], [16, 0]], // литое и одиночное
                    [[14, 1], [14, 1], [14, 1], [14, 1]],
                    [[10, 1], [5, 1], [12, 1], [13, 1]], // T-образ
                    [[0, 1], [7, 1], [4, 1], [11, 1]], // углы
                    [[14, 1], [14, 1]],
                    [[2, 1], [8, 1], [8, 1], [2, 1], [2, 1], [8, 1]], // выступы и прямые
                ],
            ),
            'plain' => array(
                'id' => 3,
                'type' => "plain",
                'name' => "Равнина",
                'color' => "#9bff93",
                'mapColor' => "#9bff93",
                'src' => 'summer.png',
                'moveType' => "land",
                'move' => 2,
                'moveDiagonal' => 3,
                'tileSet' => [11, 17],
                'changeSet' => [
                    [[14, 18], [11, 17]], // заполненное: деструктурируемое и инкрементируемое
                    [[4, 14], [7, 14], [11, 14], [0, 15]], // 3/4
                    [[9, 14], [15, 14], [5, 15], [9, 15]], // прямые
                    [[18, 14], [7, 15], [11, 15], [14, 15]], // уголки
                    [[3, 15], [17, 14]], // по диагонали
                    [[9, 14], [15, 14], [5, 15], [9, 15], [13, 17], [13, 17]], // выступы и прямые
                ],
            ),
            'forest' => array(
                'id' => 4,
                'type' => "forest",
                'name' => "Лес",
                'color' => "#00cb11",
                'mapColor' => "#00cb11",
                'src' => 'summer.png',
                'moveType' => "land",
                'move' => 8,
                'moveDiagonal' => 11,
                'tileSet' => [13, 6],
                'changeSet' => [
                    [[13, 6], [13, 6]],
                    [[10, 5], [4, 7], [17, 5], [16, 5]], // 3/4
                    [[11, 5], [1, 6], [14, 5], [10, 6]], // T-образ
                    [[3, 7], [12, 5], [16, 6], [15, 6]], // уголки
                    [[13, 6], [13, 6]],
                    [[7, 6], [3, 7], [18, 6], [9, 6], [8, 6], [1, 7]], // выступы и прямые
                ],
            ),
            'swamp' => array(
                'id' => 5,
                'type' => "swamp",
                'name' => "Болото",
                'color' => "#a0c090",
                'mapColor' => "#a0c090",
                'src' => 'summer.png',
                'moveType' => "water",
                'move' => 10,
                'moveDiagonal' => 14,
                'tileSet' => [5, 19],
                'changeSet' => [
                    [[5, 19], [5, 19]], // заполненное: деструктурируемое и инкрементируемое
                    [[2, 14], [1, 14], [14, 13], [6, 13]], // 3/4
                    [[16, 13], [13, 13], [2, 13], [14, 12]], // прямые T-образ
                    [[8, 13], [17, 12], [12, 12], [10, 12]], // уголки
                    [[3, 13], [9, 13]], // по диагонали
                    [[8, 13], [8, 13], [17, 12], [12, 12], [13, 13], [16, 13]], // выступы и прямые
                ],
            ),
            'hill' => array(
                'id' => 6,
                'type' => "hill",
                'name' => "Холм",
                'color' => "#7EC850",
                'mapColor' => "#7EC850",
                'src' => 'summer.png',
                'moveType' => "land",
                'move' => 12,
                'moveDiagonal' => 16,
                'tileSet' => [1, 10],
                'changeSet' => [
                    [[10, 18], [10, 18]],
                    [[15, 10], [14, 10], [5, 10], [1, 10]],
                    [[11, 10], [7, 10], [18, 9], [13, 9]], // прямые T-образ
                    [[4, 10], [15, 9], [11, 9], [9, 9]], // уголки
                    [[2, 10], [6, 10]],
                    [[4, 10], [4, 10], [15, 9], [11, 9], [7, 10], [11, 10]],
                ],
            ),
            'mountain' => array(
                'id' => 7,
                'type' => "mountain",
                'name' => "Гора",
                'color' => "#808487",
                'mapColor' => "#808487",
                'src' => 'summer.png',
                'moveType' => "fly",
                'move' => 6,
                'moveDiagonal' => 9,
                'tileSet' => [13, 8],
                'changeSet' => [
                    [[13, 8], [13, 8]],
                    [[12, 7], [15, 7], [0, 8], [18, 7]], // 3/4
                    [[13, 7], [16, 8], [16, 7], [12, 8]],
                    [[17, 8], [0, 9], [15, 8], [2, 9]], // уголки
                    [[2, 8], [1, 8]],
                    [[9, 8], [9, 7], [17, 7], [11, 8], [10, 8], [12, 8]], // выступы и прямые
                ],
            ),
        ),
        'build' => array(
            'warehouse' => array(
                'name' => 'склад',
                'type' => 'warehouse',
                'size' => array(3, 3),
                'fundamentSize' => array(3, 2),
                'imageSrc' => 'warehouse.png',
                'image_size' => array(300, 286),
            ),
            'castle' => array(
                'name' => 'Замок',
                'type' => 'castle',
                'title' => '',
                'defense' => 1,
                'size' => array(2, 3),
                'fundamentSize' => array(2, 2),
                'imageSrc' => 'castle.png',
                'fraction' => 'neutral',
                'image_size' => array(200, 200),
                'produceLine' => array(),
                'produce' => false,
                'produceTime' => 0,
                'income' => 12,
                'imageInfo' => '',
                'description' => '',
            ),
            'ruins' => array(
                'name' => 'Руины',
                'type' => 'ruins',
                'title' => '',
                'size' => array(1, 1),
                'fundamentSize' => array(1, 1),
                'imageSrc' => 'ruins.png',
                'image_size' => array(32, 30),
                'fraction' => 'neutral',
                'explored' => false,
                'treasury' => false,
            ),
            'altar' => array(
                'name' => 'Алтарь',
                'type' => 'altar',
                'title' => '',
                'size' => array(1, 1.5),
                'fundamentSize' => array(1, 1),
                'imageSrc' => 'altar4s.png',
                'image_size' => array(90, 133),
            ),
            'house' => array(
                'name' => 'Дом',
                'type' => 'house',
                'size' => array(3, 3),
                'fundamentSize' => array(3, 2),
                'imageSrc' => 'peasanthouse.png',
                'level' => 1,
                'image_size' => array(300, 268),
            ),
            'tower' => array(
                'name' => 'Башня', // защита, меньше стоимость содержания.
                'type' => 'tower',
                'title' => '',
                'defense' => 1,
                'size' => array(1, 1),
                'fundamentSize' => array(1, 1),
                'imageSrc' => 'tower.png',
                'fraction' => 'neutral',
                'image_size' => array(100, 100),
            ),
            'grain_farm' => array(
                'name' => 'Ферма пшеницы',
                'type' => 'grain_farm',
                'size' => array(1, 1),
                'fundamentSize' => array(1, 1),
                'imageSrc' => 'warehouse.png',
                'level' => 1,
                'image_size' => array(300, 286),
            ),
            'iron_mine' => array(
                'name' => 'Железная шахта',
                'type' => 'iron_mine',
                'size' => array(1, 1),
                'fundamentSize' => array(1, 1),
                'imageSrc' => 'warehouse.png',
                'level' => 1,
                'image_size' => array(300, 286),
            ),
            'blacksmitch' => array(
                'name' => 'Кузница',
                'type' => 'blacksmitch',
                'size' => array(1, 1),
                'fundamentSize' => array(1, 1),
                'imageSrc' => 'warehouse.png',
                'level' => 1,
                'image_size' => array(300, 286),
            ),
        ),
        
        'fraction' => array(
            array('name' => 'Свободные', 'type' => 'neutral', 'mapColor' => '#D0D0D0', 
                'textColor' => '#000', 'treasury' => 0,
                'heroReserve' => array(
                    array('avatar' => 0, 'name' => ''),
                    array('avatar' => 1, 'name' => ''), 
                    array('avatar' => 2, 'name' => ''), 
                    array('avatar' => 3, 'name' => ''), 
                ),
                'penaltyAndBonus' => array(),
            ),
            array('name' => 'Орден милосердия', 'type' => 'white', 'mapColor' => '#FFFFFF', 
                'textColor' => '#000', 'treasury' => 1200,
                'heroReserve' => array(
                    array('avatar' => 0, 'name' => 'Ричард'),
                    array('avatar' => 1, 'name' => 'Брисеида'), 
                    array('avatar' => 2, 'name' => 'Бранвен'), 
                    array('avatar' => 3, 'name' => 'Эдвин'),
                ),
                'penaltyAndBonus' => array('road' => 1, 'forest' => -1),
            ),
            array('name' => 'Штормовой предел', 'type' => 'yellow', 'mapColor' => '#FFFF22', 
                'textColor' => '#000', 'treasury' => 40,
                'heroReserve' => array(
                    array('avatar' => 0, 'name' => 'Ярпен'),
                    array('avatar' => 1, 'name' => 'Имоен'), 
                    array('avatar' => 2, 'name' => 'Динахэир'), 
                    array('avatar' => 3, 'name' => 'Минск'), 
                ),
                'penaltyAndBonus' => array('hill' => 1, 'swamp' => -1),
            ),
            array('name' => 'Горные кланы', 'type' => 'orange', 'mapColor' => '#EEAA11', 
                'textColor' => '#000', 'treasury' => 40,
                'heroReserve' => array(
                    array('avatar' => 0, 'name' => 'Дивольд'),
                    array('avatar' => 1, 'name' => 'Йеслик'), 
                    array('avatar' => 2, 'name' => 'Тиакс'), 
                    array('avatar' => 3, 'name' => 'Кагэйн'), 
                ),
                'penaltyAndBonus' => array('hill' => 2, 'forest' => -1, 'swamp' => -1),
            ),
            array('name' => 'Орда хаоса', 'type' => 'red', 'mapColor' => '#FF1111', 
                'textColor' => '#fff', 'treasury' => 40,
                'heroReserve' => array(
                    array('avatar' => 0, 'name' => 'Халид'),
                    array('avatar' => 1, 'name' => 'Шар-тил'), 
                    array('avatar' => 2, 'name' => 'Фалдорн'), 
                    array('avatar' => 3, 'name' => 'Элдот'), 
                ),
                'penaltyAndBonus' => array('swamp' => 1, 'forest' => -1),
            ),
            array('name' => 'Альянс луны', 'type' => 'green', 'mapColor' => '#22FF00', 
                'textColor' => '#000', 'treasury' => 40,
                'heroReserve' => array(
                    array('avatar' => 0, 'name' => 'Файбер'),
                    array('avatar' => 1, 'name' => 'Джахейра'), 
                    array('avatar' => 2, 'name' => 'Модрэйн'), 
                    array('avatar' => 3, 'name' => 'Киван'), 
                ),
                'penaltyAndBonus' => array('forest' => 1, 'hill' => -1, 'swamp' => -1),
            ),
            array('name' => 'Имперский корпус', 'type' => 'blue', 'mapColor' => '#0000FF', 
                'textColor' => '#fff', 'treasury' => 40,
                'heroReserve' => array(
                    array('avatar' => 0, 'name' => 'Аджантис'),
                    array('avatar' => 1, 'name' => 'Ксан'), 
                    array('avatar' => 2, 'name' => 'Викония'), 
                    array('avatar' => 3, 'name' => 'Квайли'), 
                ),
                'penaltyAndBonus' => array('sea' => 1, 'coast' => 1, 'bridge' => 1, 'hill' => -1),
            ),
            array('name' => 'Вольные княжества', 'type' => 'sky', 'mapColor' => '#22FFFF', 
                'textColor' => '#000', 'treasury' => 40,
                'heroReserve' => array(
                    array('avatar' => 0, 'name' => 'Коран'),
                    array('avatar' => 1, 'name' => 'Сафана'), 
                    array('avatar' => 2, 'name' => 'Алора'), 
                    array('avatar' => 3, 'name' => 'Фердан'), 
                ),
                'penaltyAndBonus' => array('plain' => 1, 'swamp' => -1, 'hill' => -1),
            ),
            array('name' => 'Орден тишины', 'type' => 'black', 'mapColor' => '#000000', 
                'textColor' => '#fff', 'treasury' => 40,
                'heroReserve' => array(
                    array('avatar' => 0, 'name' => 'Монтарон'),
                    array('avatar' => 1, 'name' => 'Скани'), 
                    array('avatar' => 2, 'name' => 'Кзар'), 
                    array('avatar' => 3, 'name' => 'Генри'), 
                ),
                'penaltyAndBonus' => array('swamp' => 1, 'forest' => -1),
            ),
        ),
        
        'unit' => array(
            array('name' => 'Тяжёлая пехота', 'type' => 'h_inf', 'produce' => 2, 'src' => 1,
                'cost' => 4, 'str' => 5, 'move' => 16, 'moveBonus' => array('type' => false), 
                'penaltyAndBonus' => array('forest' => -1, 'hill' => -1, 'swamp' => -1)
            ),
            array('name' => 'Лёгкая пехота', 'type' => 'inf', 'produce' => 1, 'src' => 2,
                'cost' => 4, 'str' => 3, 'move' => 20, 'moveBonus' => array('type' => false), 
                'penaltyAndBonus' => array('forest' => -1, 'hill' => -1, 'swamp' => -1)
            ),
            array('name' => 'Дварф', 'type' => 'dwarf', 'produce' => 2, 'src' => 3,
                'cost' => 4, 'str' => 5, 'move' => 18, 
                'moveBonus' => array('type' => 'hill', 'move' => 6, 'moveDiagonal' => 9, 'moveType' => 'land'),
                'penaltyAndBonus' => array('forest' => -1, 'hill' => 1)
            ),
            array('name' => 'Лучник', 'type' => 'archer', 'produce' => 1, 'src' => 6,
                'cost' => 4, 'str' => 4, 'move' => 24, 
                'moveBonus' => array('type' => 'forest', 'move' => 4, 'moveDiagonal' => 6, 'moveType' => 'land'),
                'penaltyAndBonus' => array('forest' => 1, 'hill' => -1, 'swamp' => -1)
            ),
            array('name' => 'Охотник', 'type' => 'wolf', 'produce' => 3, 'src' => 7,
                'cost' => 8, 'str' => 5, 'move' => 28,
                'moveBonus' => array('type' => 'swamp', 'move' => 6, 'moveDiagonal' => 9, 'moveType' => 'land'),
                'penaltyAndBonus' => array('forest' => -1, 'hill' => -1, 'swamp' => 1)
            ),
            array('name' => 'Великан', 'type' => 'giant', 'produce' => 3, 'src' => 0,
                'cost' => 6, 'str' => 6, 'move' => 24,
                'moveBonus' => array('type' => 'hill', 'move' => 8, 'moveDiagonal' => 12, 'moveType' => 'land'),
                'penaltyAndBonus' => array('forest' => 0)
            ),
            array('name' => 'Всадник', 'type' => 'horseman', 'produce' => 4, 'src' => 4,
                'cost' => 8, 'str' => 5, 'move' => 36, 'moveBonus' => array('type' => false), 
                'penaltyAndBonus' => array('forest' => -1, 'hill' => -1, 'swamp' => -1, 'plain' => 1)
            ),
            array('name' => 'Рыцарь', 'type' => 'knight', 'produce' => 4, 'src' => 4,
                'cost' => 8, 'str' => 6, 'move' => 32, 'moveBonus' => array('type' => false), 
                'penaltyAndBonus' => array('forest' => -1, 'hill' => -1, 'swamp' => -1)
            ),
            array('name' => 'Пегас', 'type' => 'pegas', 'produce' => 6, 'src' => 8,
                'cost' => 16, 'str' => 4, 'move' => 36,
                'moveBonus' => array('type' => 'fly', 'move' => 4, 'moveDiagonal' => 6, 'moveType' => 'land'),
                'penaltyAndBonus' => array('forest' => 1)
            ),
            array('name' => 'Грифон', 'type' => 'grifon', 'produce' => 6, 'src' => 9,
                'cost' => 16, 'str' => 6, 'move' => 32,
                'moveBonus' => array('type' => 'fly', 'move' => 4, 'moveDiagonal' => 6, 'moveType' => 'land'),
                'penaltyAndBonus' => array('hill' => 1)
            ),
            array('name' => 'Призрак', 'type' => 'ghost', 'produce' => false, 'src' => 11,
                'cost' => 0, 'str' => 7, 'move' => 24,
                'moveBonus' => array('type' => 'swamp', 'move' => 6, 'moveDiagonal' => 9, 'moveType' => 'land'),
                'penaltyAndBonus' => array('forest' => -1, 'swamp' => 1)
            ),
            array('name' => 'Демон', 'type' => 'daemon', 'produce' => false, 'src' => 13,
                'cost' => 0, 'str' => 7, 'move' => 32,
                'moveBonus' => array('type' => 'forest', 'move' => 4, 'moveDiagonal' => 6, 'moveType' => 'land'),
                'penaltyAndBonus' => array('forest' => -1)
            ),
            array('name' => 'Чародей', 'type' => 'wizard', 'produce' => false, 'src' => 10,
                'cost' => 0, 'str' => 6, 'move' => 95, 'moveBonus' => array('type' => false), 
                'penaltyAndBonus' => array('forest' => 0)
            ),
            array('name' => 'Бес', 'type' => 'devil', 'produce' => false, 'src' => 14,
                'cost' => 0, 'str' => 8, 'move' => 28, 'moveBonus' => array('type' => false), 
                'penaltyAndBonus' => array('forest' => -1)
            ),
            array('name' => 'Дракон', 'type' => 'dragon', 'produce' => false, 'src' => 12,
                'cost' => 0, 'str' => 8, 'move' => 40,
                'moveBonus' => array('type' => 'fly', 'move' => 4, 'moveDiagonal' => 6, 'moveType' => 'land'),
                'penaltyAndBonus' => array('forest' => 0)
            ),
            array('name' => 'Лорд', 'type' => 'lord', 'produce' => false, 'src' => 15,
                'cost' => 0, 'str' => 5, 'move' => 28,
                'moveBonus' => array('type' => 'flex'), 
                'penaltyAndBonus' => array('forest' => 0),
                'avatar' => '', 'bag' => array()
            ),
            array('name' => 'Корабль', 'type' => 'ship', 'produce' => 9, 'src' => 5,
                'cost' => 16, 'str' => 5, 'move' => 36,
                'moveBonus' => array('type' => 'sea', 'move' => 2, 'moveDiagonal' => 3, 'moveType' => 'sea'),
                'penaltyAndBonus' => array('forest' => 0)
            ),
        ),
        'item' => array(
            array(
                'name' => 'Карта', 'type' => 'map', 'power' => 0, 'groupMove' => 6, 'part' => '', 
                'sx' => 31, 'sy' => 51,
                'description' => 'Древняя карта местами потёрлась, но всё ещё пригодна для планирования маршрутов.',
                'tactic' => array('city' => 0, 'siege' => 0, 'plain' => 0, 'forest' => 0, 'hill' => 0)
            ),
            array(
                'name' => 'Топор', 'type' => 'axe', 'power' => 0, 'groupMove' => 0, 'part' => '', 
                'sx' => 190, 'sy' => 43,
                'description' => 'На рукояти топора нанесены руны старшего наречия, невозможно их прочитать, но наверняка это сильная магия.',
                'tactic' => array('city' => 0, 'siege' => 0, 'plain' => 0, 'forest' => 1, 'hill' => 0)
            ),
            array(
                'name' => 'Молот', 'type' => 'hammer', 'power' => 0, 'groupMove' => 0, 'part' => '', 
                'sx' => 268, 'sy' => 40,
                'description' => 'Реликтовый молот короля Гриденбольда, объединившего разрозненные кланы дварфов и очистившего пещеры от кобольдов.',
                'tactic' => array('city' => 0, 'siege' => 1, 'plain' => 0, 'forest' => 0, 'hill' => 0)
            ),
            array(
                'name' => 'Щит', 'type' => 'shield', 'power' => 0, 'groupMove' => 0, 'part' => '', 
                'sx' => 430, 'sy' => 46,
                'description' => 'На щите выгравирован гербовый василиск - знак дома Фирвульфа ведущего свой род от графа Риодера Фирвульфа в тёмный час спасшего столицу старой империи от осады.',
                'tactic' => array('city' => 0, 'siege' => 0, 'plain' => 1, 'forest' => 0, 'hill' => 0)
            ),
            array(
                'name' => 'Секира', 'type' => 'poleaxe', 'power' => 0, 'groupMove' => 0, 'part' => '', 
                'sx' => 347, 'sy' => 121,
                'description' => 'Эта секира принадлежала легендарному завоевателю пришедшему с севера.',
                'tactic' => array('city' => 0, 'siege' => 0, 'plain' => 0, 'forest' => 0, 'hill' => 1)
            ),
            array(
                'name' => 'Броня', 'type' => 'armor', 'power' => 2, 'groupMove' => 0, 'part' => '', 
                'sx' => 430, 'sy' => 124,
                'description' => 'Этот полный доспех делает своего владельца неуязвимым. Впрочем, в последнем бою он его не спас. Зато теперь он твой.',
                'tactic' => array('city' => 0, 'siege' => 0, 'plain' => 0, 'forest' => 0, 'hill' => 0)
            ),
            array(
                'name' => 'Лук', 'type' => 'bow', 'power' => 0, 'groupMove' => 0, 'part' => '', 
                'sx' => 27, 'sy' => 186,
                'description' => 'Благородный эльф Эскернель был известен своим умением поразить цель на расстоянии четырёх сотен метров! Отчасти эта была заслуга его невероятного боевого лука. Отчасти слухов, которые приукрасили правду.',
                'tactic' => array('city' => 1, 'siege' => 0, 'plain' => 0, 'forest' => 0, 'hill' => 0)
            ),
            array(
                'name' => 'Меч', 'type' => 'sword', 'power' => 1, 'groupMove' => 0, 'part' => '', 
                'sx' => 280, 'sy' => 194,
                'description' => 'Невероятно лёгкий и сбалансированный меч.',
                'tactic' => array('city' => 0, 'siege' => 0, 'plain' => 0, 'forest' => 0, 'hill' => 0)
            ),
        ),
    );
}