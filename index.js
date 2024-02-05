import { resources } from './src/resources.js';
import { Player , Tile, Item } from './src/class.js';

const API_URL = 'http://localhost:4000/playerdata';

const game = document.querySelector('.game-container');
game.on = false;
game.off = true;

// canvas and context and screen sizes ---------------------------
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 704;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const screen = { frames: { row: 11, col: 13 }, width: CANVAS_WIDTH - 192, height: CANVAS_HEIGHT };

// const and let variables in-game -------------------------------
const equipLocations = {
  neck: { x: screen.width + 16, y: 16 },
  head: { x: screen.width + 80, y: 16 },
  back: { x: screen.width + 144, y: 16 },
  chest: { x: screen.width + 16, y: 80 },
  offhand: { x: screen.width + 144, y: 80 },
  mainhand: { x: screen.width + 16, y: 144 },
  legs: { x: screen.width + 80, y: 144 },
  feet: { x: screen.width + 144, y: 144 }    
};
const inventoryLocations = { 
  primary: { open: true, expanded: true, x: screen.width, y: 292 }, 
  secondary: { open: false, x: screen.width, y: 516 } 
};
const chat = { 
  open: false, 
  closed: true 
};

let currentMenu = 'inventory';

let items = [];
let equipped = [];
let inventory = [];

let boundaries = [];
let wateries = [];
let uppermost = [];

// load image assets ---------------------------------------------
const background = {
  image: new Image(),
  src: './backend/assets/background.jpg',
  loaded: false
};
const genus = {
  image: new Image(),
  src: './backend/assets/map_data/spritesheet-genus.png',
  size: 64,
  spritesheetFrames: 25,
  mapFrameDimensions: { row: 160, col: 140 },
  loaded: false
};
const menu = {
  image: new Image(),
  src: './backend/assets/menu.png',
  containers: {
    backpack: { sx: 0, sy: 256, width: 32, height: 32 },
    labeledbackpack: { sx: 32, sy: 256, width: 32, height: 32 },
    enchantedbackpack: { sx: 64, sy: 256, width: 32, height: 32 },
    labeledenchantedbackpack: { sx: 96, sy: 256, width: 32, height: 32 },
    depot: { sx: 128, sy: 256, width: 32, height: 32 },
    parcel: { sx: 160, sy: 256, width: 32, height: 32 }
  },
  menuSection: {
    background: { sx: 0, sy: 192, dx: screen.width, dy: 192, width: 192, height: 64 },
    mapbtn: { name: 'map', sx: 0, sy: 320, dx: screen.width + 16, dy: 208, width: 32, height: 32 },
    inventorybtn: { name: 'inventory', sx: 32, sy: 320, dx: screen.width + 80, dy: 208, width: 32, height: 32 },
    trackingbtn: { name: 'tracking', sx: 64, sy: 320, dx: screen.width + 142, dy: 208, width: 32, height: 32 },
    active: { sx: 96, sy: 320, width: 36, height: 36 }
  },
  stanceToggles: {
    attackInactive: { sx: 96, sy: 352, dx: screen.width, dy: 640, size: 32, scale: 2 },
    attackActive: { sx: 96, sy: 384, dx: screen.width, dy: 640, size: 32, scale: 2 },
    defendInactive: { sx: 128, sy: 352, dx: screen.width + 64, dy: 640, size: 32, scale: 2 },
    defendActive: { sx: 128, sy: 384, dx: screen.width + 64, dy: 640, size: 32, scale: 2 },
    passiveInactive: { sx: 160, sy: 352, dx: screen.width + 128, dy: 640, size: 32, scale: 2 },
    passiveActive: { sx: 160, sy: 384, dx: screen.width + 128, dy: 640, size: 32, scale: 2 },
  },
  arrowToggles: {
    inactiveDown : { sx: 64, sy: 288, size: 32 },
    inactiveUp: { sx: 96, sy: 288, size: 32 },
    activeDown: { sx: 0, sy: 288, size: 32 },
    activeUp: { sx: 32, sy: 288, size: 32 },
  },
  loaded: false
};

// init player ---------------------------------------------------
const player = new Player({ 
  source: { 
    downward: { sx: 0, sy: 0 }, 
    upward: { sx: 0, sy: 64 }, 
    rightward: { sx: 64, sy: 0 }, 
    leftward: { sx: 64, sy: 64 } 
  }, 
  coordinates: { 
    dx: screen.width * 0.5 - 48, 
    dy: screen.height * 0.5 - 48
  }
});
player.loadImage().then(() => {
  player.loaded = true;
});
const initItemsInGame = () => {
  initItem(createRandomID(items.length + 1), 'head', 'hood', 0, 0, 256, 256);
  initItem(createRandomID(items.length + 1), 'chest', 'tunic', 64, 0, 256, 320);
  initItem(createRandomID(items.length + 1), 'legs', 'pants', 128, 0, 256, 384);
  initItem(createRandomID(items.length + 1), 'neck', 'fanged', 448, 128, 192, 256);
  initItem(createRandomID(items.length + 1), 'mainhand', 'sword', 320, 64, 192, 320);
  initItem(createRandomID(items.length + 1), 'offhand', 'kite', 576, 64, 320, 320);
  initItem(createRandomID(items.length + 1), 'feet', 'shoes', 192, 0, 256, 448);
  initItem(createRandomID(items.length + 1), 'back', 'backpack', 0, 448, 320, 256);
  initItem(createRandomID(items.length + 1), 'head', 'coif', 0, 128, 512, 256);
  initItem(createRandomID(items.length + 1), 'chest', 'chainmail', 64, 128, 512, 320);
  initItem(createRandomID(items.length + 1), 'legs', 'chainmaillegs', 128, 128, 512, 384);
  initItem(createRandomID(items.length + 1), 'neck', 'silver', 512, 128, 448, 256);
  initItem(createRandomID(items.length + 1), 'mainhand', 'spear', 512, 64, 448, 320);
  initItem(createRandomID(items.length + 1), 'offhand', 'heater', 576, 128, 576, 320);
  initItem(createRandomID(items.length + 1), 'feet', 'chausses', 192, 128, 512, 448);
  initItem(createRandomID(items.length + 1), 'back', 'enchantedbackpack', 64, 448, 576, 256);
};

// boundary validation functions ---------------------------------
const isInRangeOfPlayer = (pointX, pointY) => {    
  const withinReach = {
    x: screen.width / 2 - 96, 
    y: screen.height / 2 - 96, 
    width: 192, 
    height: 192
  };

  return (
    pointX >= withinReach.x &&
    pointX < withinReach.x + withinReach.width &&
    pointY >= withinReach.y &&
    pointY < withinReach.y + withinReach.height
  );
};
const isPointInsideRectangle = (pointX, pointY, rectangle) => {
  return (
    pointX >= rectangle.x &&
    pointX <= rectangle.x + rectangle.width &&
    pointY >= rectangle.y &&
    pointY <= rectangle.y + rectangle.height
  );
};
const itemIsInScreenBounds = (dx, dy) => {
  return (
    dx + 64 < screen.width &&
    dx >= 0 &&
    dy + 64 < screen.height &&
    dy >= 0
  );
};
const itemIsInEquipSection = (dx, dy) => {
  return isPointInsideRectangle(dx, dy, {
    x: screen.width,
    y: 0,
    width: 192,
    height: 192
  });
};
const itemIsInInventorySection = (dx, dy) => {
  if (inventoryLocations.primary.open){
    if (!inventoryLocations.primary.expanded) {
      return isPointInsideRectangle(dx, dy, {
        x: inventoryLocations.primary.x,
        y: inventoryLocations.primary.y,
        width: 192,
        height: 188
      });
    } else {
      return isPointInsideRectangle(dx, dy, {
        x: inventoryLocations.primary.x,
        y: inventoryLocations.primary.y,
        width: 192,
        height: 412
      });
    };
  };
};
const itemIsInSecondaryInventorySection = (item) => {
  if (inventory.secondary.open){
    return isPointInsideRectangle(item.coordinates.dx, item.coordinates.dy, {
      x: screen.width,
      y: 292,
      width: 192,
      height: 188
    });
  };
};

// init item function --------------------------------------------
const initItem = (id, type, name, sx, sy, dx, dy, scale = 1) => {
  const rpgItem = new Item(id, type, name, { source: { sx, sy }, coordinates: { dx, dy } }, scale);
  
  const category = resources.itemData[type];
  Object.assign(rpgItem, category[name]);
  
  const backpack = player.data.details.equipped.back;
  
  if (itemIsInEquipSection(dx, dy)) {
    rpgItem.scale = 0.5;
    equipped.push(rpgItem);
  };
  
  if (backpack.hasOwnProperty('contents')) {
    if (backpack.contents.find(item => item.id === rpgItem.id)){
      rpgItem.scale = 0.5;
      inventory.push(rpgItem);
    };
  }; 
  
  if (itemIsInScreenBounds(rpgItem.coordinates.dx, rpgItem.coordinates.dy)) {
    items.push(rpgItem);
  };
};
const createRandomID = (input) => {
  return Math.random() * input;
};
const isMouseOverItem = (mouseX, mouseY, item) => {
  return isPointInsideRectangle(mouseX, mouseY, {
    x: item.coordinates.dx,
    y: item.coordinates.dy,
    width: item.size * item.scale,
    height: item.size * item.scale
  });
};
const findItemUnderMouse = (mouseX, mouseY, array) => {
  for (let i = array.length - 1 ; i >= 0 ; i--) {
    const currentItem = array[i];
    if (isMouseOverItem(mouseX, mouseY, currentItem)) {
      return currentItem;
    };
  };
  return null;
};

// draw map functions -----------------------------------------------
const drawTile = (image, tile) => {
  const { sx, sy } = tile.source;
  const { dx, dy } = tile.coordinates;
  const size = tile.size;
  ctx.drawImage(image, sx, sy, size, size, dx, dy, size, size);
};
const detectCollision = (objects, newX, newY) => {
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    if (
      newX < obj.coordinates.dx + obj.size &&
      newX + player.size > obj.coordinates.dx &&
      newY < obj.coordinates.dy + obj.size &&
      newY + player.size > obj.coordinates.dy
    ) {
      return true;
    };
  };
  return false;
};
const collisionDetect = (newX, newY) => {
  return detectCollision(boundaries, newX, newY);
};
const waterDetect = (newX, newY) => {
  return detectCollision(wateries, newX, newY);
};
const drawOasis = (currentMap = resources.mapData.isLoaded && resources.mapData.genus01.layers) => {
  const upperTiles = [ 576, 577, 578, 579, 601, 602, 603, 604 ];
  const waterTiles = [ 1, 2, 3, 4, 5, 6, 7, 8 ];
  boundaries = [];
  wateries = [];
  uppermost = [];

  const startingTile = {
    x: player.data.details.location.x - Math.floor(screen.frames.col / 2),
    y: player.data.details.location.y - Math.floor(screen.frames.row / 2)
  };

  const visibleMap = currentMap.map(layer => {
    startingTile.num = genus.mapFrameDimensions.col * (startingTile.y - 1) + startingTile.x;
    let tiles = [];
    for (let i = 0 ; i < screen.frames.row ; i++) {
      tiles.push(...layer.data.slice(startingTile.num, startingTile.num + screen.frames.col));
      startingTile.num += genus.mapFrameDimensions.col;
    };
    return tiles;
  });

  visibleMap.forEach(layer => {
    layer.forEach((tileID, i) => {
      if (tileID > 0) {
        const sx = (tileID - 1) % genus.spritesheetFrames * genus.size;
        const sy = Math.floor((tileID - 1) / genus.spritesheetFrames) * genus.size;
        const dx = i % screen.frames.col * genus.size;
        const dy = Math.floor(i / screen.frames.col) * genus.size;

        if (upperTiles.includes(tileID)) {
          const upper = new Tile({ source: { sx, sy }, coordinates: { dx, dy } });
          upper.tileID = tileID;
          uppermost.push(upper);
        };

        if (waterTiles.includes(tileID)) {
          const water = new Tile({ source: { sx, sy }, coordinates: { dx, dy } });
          wateries.push(water);
        };

        if (tileID === 25) {
          const boundary = new Tile({ coordinates: { dx, dy } });
          boundaries.push(boundary);
        } else {
          drawTile(genus.image, { source: { sx, sy }, coordinates: { dx, dy }, size: 64 });
        };
      };
    });
  });
  
  items.forEach(item => {
    if (
      item.coordinates.dx >= 0 &&
      item.coordinates.dx + item.size <= screen.width &&
      item.coordinates.dy >= 0 &&
      item.coordinates.dy + item.size <= screen.height
    ) {
      item.draw(ctx);
    };
  });

  player.draw(ctx);
  uppermost.forEach(tile => {
    drawTile(
      genus.image, 
      { 
        source: { sx: tile.source.sx, sy: tile.source.sy }, 
        coordinates: { dx: tile.coordinates.dx, dy: tile.coordinates.dy }, 
        size: tile.size 
      }
    );
  });
};

// handle menu ------------------------------------------------------
const drawToggleSection = (section) => {
  const menuSection = menu.menuSection;

  const drawMenuButton = (button) => {
    ctx.drawImage(menu.image, button.sx, button.sy, button.width, button.height, button.dx, button.dy, button.width, button.height);
  };

  const activeButton = (button) => {
    const { dx, dy } = button;
    ctx.drawImage(
      menu.image,
      menuSection.active.sx,
      menuSection.active.sy,
      menuSection.active.width,
      menuSection.active.height,
      dx - 2,
      dy - 1,
      menuSection.active.width,
      menuSection.active.height
    );
  };

  ctx.clearRect(screen.width, 192, 182, 64);
  ctx.drawImage(menu.image, menuSection.background.sx, menuSection.background.sy, menuSection.background.width, menuSection.background.height, menuSection.background.dx, menuSection.background.dy, menuSection.background.width, menuSection.background.height);

  switch (section) {
    case 'map':
      drawMenuButton(menuSection.inventorybtn);
      drawMenuButton(menuSection.trackingbtn);
      activeButton(menuSection.mapbtn);
      drawMenuButton(menuSection.mapbtn);
      break;
    case 'inventory':
      drawMenuButton(menuSection.mapbtn);
      drawMenuButton(menuSection.trackingbtn);
      activeButton(menuSection.inventorybtn);
      drawMenuButton(menuSection.inventorybtn);
      break;
    case 'tracking':
      drawMenuButton(menuSection.mapbtn);
      drawMenuButton(menuSection.inventorybtn);
      activeButton(menuSection.trackingbtn);
      drawMenuButton(menuSection.trackingbtn);
      break;
  };
};
const drawMenu = (section = 'inventory') => {
  ctx.clearRect(screen.width, 0, 192, 704);
  switch(section) {
    case 'map':
      // draw minimap
      drawToggleSection(section);
      // draw minimap contents
      // append text
      break;
    case 'inventory':
      drawEquipmentSection();
      drawToggleSection(section);
      // drawInventorySection();
      break;
    case 'tracking':
      // draw who is being tracked
      drawToggleSection(section);
      // draw list
      // draw stance
      break;
    default:
      break;
  };
};

// // handle equipping items -------------------------------------------
const handleEquipping = (item) => {
  if (currentMenu === 'inventory') {
    const playersEquippedItems = player.data.details.equipped;

    const resetPreviousItem = (type) => {
      if (playersEquippedItems[type] !== 'empty') {
        const prev = equipped.find(gear => gear.id === playersEquippedItems[type].id);
        prev.coordinates.dx = item.coordinates.dx;
        prev.coordinates.dy = item.coordinates.dy;
        prev.scale = 1;
        if (itemIsInScreenBounds(prev.coordinates.dx, prev.coordinates.dy)) {
          items.push(prev);
        // } else if (itemIsInInventorySection(prev.coordinates.dx, prev.coordinates.dy)) {
        //   inventory.push(prev);
        };
        equipped.splice(equipped.indexOf(prev), 1);
      };
    };

    const equipItem = (type) => {
      resetPreviousItem(type);
      playersEquippedItems[type] = item;
      item.coordinates.dx = equipLocations[type].x;
      item.coordinates.dy = equipLocations[type].y;
      item.scale = 0.5;
      item.isDragging = false;
      equipped.push(item);
      if (items.includes(item)) {
        items.splice(items.indexOf(item), 1);
      } else if (inventory.includes(item)) {
        inventory.splice(inventory.indexOf(item), 1);
      };
      // if (type === 'back') drawInventorySection();
    };

    switch(item.type) {
      case 'neck':
      case 'head':
      case 'back':
      case 'chest':
      case 'offhand':
      case 'mainhand':
      case 'legs':
      case 'feet':
        equipItem(item.type);
        break;
      default: break;
    };
  };
};
const resetEquipmentSlot = (item) => {
  const equipSlot = player.data.details.equipped;
  switch(item.type) {
    case 'neck':
    case 'head':
    case 'back':
    case 'chest':
    case 'offhand':
    case 'mainhand':
    case 'legs':
    case 'feet':
      equipSlot[item.type] = 'empty';
      break;
    default: break;
  };
};
const drawEquipmentSection = () => {
  ctx.clearRect(screen.width, 0, 192, 192);
  ctx.drawImage(menu.image, 0, 0, 192, 192, screen.width, 0, 192, 192);

  equipped.forEach(item => item.draw(ctx));
};

// handle loading assets/transition to login
const handleLoading = () => {
  const numOfAssetsToLoad = 3;
  const loadScreen = document.querySelector('.loading-container');
  const loadProgress = document.querySelector('.loading-progress');
  const form = document.querySelector('.form-container');

  const loadedAssets = [background, genus, menu].filter(asset => asset.loaded);
  const percentage = (loadedAssets.length / numOfAssetsToLoad) * 100;

  loadProgress.textContent = `${percentage.toFixed(2)}%`;
  
  if (loadedAssets.length === numOfAssetsToLoad) {
    // complete loading by removing the display
    loadScreen.style.display = 'none';
    // set background to the loaded background image
    document.body.style.background = `url(${background.image.src}) center/cover no-repeat`;
    // show the login form
    form.classList.remove('hidden');
    // set the focus on the input field
    document.querySelector('#playername').focus();
  };
};
const handleDOMContentLoaded = () => {
  background.image.onload = () => {
    background.loaded = true;
    handleLoading();
  };

  genus.image.onload = () => {
    genus.loaded = true;
    handleLoading();
  };

  menu.image.onload = () => {
    menu.loaded = true;
    handleLoading();
  };
  
  background.image.src = background.src;
  genus.image.src = genus.src;
  menu.image.src = menu.src;
};

// handle login/transition to game
const handleLogin = async e => {
  e.preventDefault();
  
  const form = document.querySelector('.form-container');
  const playerName = document.querySelector('#playername').value;
  player.data = resources.createPlayer(playerName);

  await new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (typeof resources !== 'undefined') {
        clearInterval(checkInterval);
        resolve();
      };
    }, 100);
  });

  initItemsInGame();

  // a half second between form submission and game because the instant transition feels weird
  setTimeout(() => {
    if (genus.loaded && player.loaded) {
      document.querySelector('body').style.background = '#464646';
      canvas.style.background = 'transparent';

      form.style.display = 'none';
      form.blur();
      
      game.classList.remove('hidden');
      game.style.display = 'flex';
      game.on = true;
      game.off = false;

      appendPlayerStatData();
      initPlayerEquipmentAndInventory();
      drawOasis();
      drawMenu();
      // could add a character animation poofing into existence
    };
  }, 500);
};

// display player data
const appendPlayerStatData = () => {
  const createPlayerStatElement = (label, value) => {
    const statElement = document.createElement('li');

    const labelElement = document.createElement('span');
    labelElement.textContent = label;

    const valueElement = document.createElement('span');
    valueElement.textContent = value;

    statElement.appendChild(labelElement);
    statElement.appendChild(valueElement);

    return statElement;
  };

  const playerStatsContainer = document.querySelector('.playerdata-container');
  playerStatsContainer.innerHTML = '';

  const playerDataLevels = document.createElement('ul');
  playerDataLevels.classList.add('box');
  
  const playerDataSkills = document.createElement('ul');
  playerDataSkills.classList.add('box');

  playerStatsContainer.textContent = player.data.name;
  playerDataLevels.appendChild(createPlayerStatElement('level', player.data.details.lvls.lvl));
  playerDataLevels.appendChild(createPlayerStatElement('magic level', player.data.details.lvls.mglvl));
  playerDataSkills.appendChild(createPlayerStatElement('fist skill', player.data.details.skills.fist));
  playerDataSkills.appendChild(createPlayerStatElement('sword skill', player.data.details.skills.sword));
  playerDataSkills.appendChild(createPlayerStatElement('axe skill', player.data.details.skills.axe));
  playerDataSkills.appendChild(createPlayerStatElement('blunt skill', player.data.details.skills.blunt));
  playerDataSkills.appendChild(createPlayerStatElement('distance skill', player.data.details.skills.distance));
  playerDataSkills.appendChild(createPlayerStatElement('defense skill', player.data.details.skills.defense));
  playerDataSkills.appendChild(createPlayerStatElement('fishing skill', player.data.details.skills.fishing));

  playerStatsContainer.appendChild(playerDataLevels);
  playerStatsContainer.appendChild(playerDataSkills);
};
const initPlayerEquipmentAndInventory = () => {
  const equippedItems = player.data.details.equipped;
  
  for (const piece in equippedItems) {
    if (equippedItems[piece] !== 'empty') {
      const item = equippedItems[piece];
      initItem(item.id, item.type, item.name, item.source.sx, item.source.sy, item.coordinates.dx, item.coordinates.dy, item.scale);
    };
  };
  
  const backpack = equippedItems.back;

  if (backpack !== "empty") {
    backpack.contents.forEach(item => {
      initItem(item.id, item.type, item.name, item.source.sx, item.source.sy, item.coordinates.dx, item.coordinates.dy, item.scale);
    });
  };
};

// mousedown, mousemove, mouseup event listener functions
const handleMouseDown = e => {
  if (game.on) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    const selectedItem = findItemUnderMouse(mouseX, mouseY, items);      
    const equippedItem = findItemUnderMouse(mouseX, mouseY, equipped);
    const menubtns = [
      menu.menuSection.mapbtn, 
      menu.menuSection.inventorybtn, 
      menu.menuSection.trackingbtn
    ];

    // if (e.shiftKey && isInRangeOfPlayer(selectedItem.coordinates.dx, selectedItem.coordinates.dy)) {
    //   isShiftKeyPressed = true;
    //   selectedItem.shifted = true;
    // };
    
    if (selectedItem && isInRangeOfPlayer(selectedItem.coordinates.dx, selectedItem.coordinates.dy)) {
      selectedItem.isDragging = true;
      canvas.style.cursor = 'grabbing';
    };

    if (equippedItem && currentMenu === 'inventory') {
      equippedItem.isDragging = true;
      canvas.style.cursor = 'grabbing';
    };

    menubtns.forEach(btn => {
      if (mouseX > btn.dx && mouseX < btn.dx + btn.width && mouseY > btn.dy && mouseY < btn.dy + btn.height) {
        currentMenu = btn.name;
        drawMenu(currentMenu);
      };
    });
  };
};

const handleMouseMove = e => {
  if (game.on) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    const selectedItem = findItemUnderMouse(mouseX, mouseY, items);
    const equippedItem = findItemUnderMouse(mouseX, mouseY, equipped);
    const menubtns = [
      menu.menuSection.mapbtn, 
      menu.menuSection.inventorybtn, 
      menu.menuSection.trackingbtn
    ];

    if (canvas.style.cursor !== 'grabbing') {
      canvas.style.cursor = 'crosshair';
    };
    
    if (selectedItem && canvas.style.cursor !== 'grabbing' || equippedItem && canvas.style.cursor !== 'grabbing' && currentMenu === 'inventory') {
      canvas.style.cursor = 'grab';
    };

    if (selectedItem && selectedItem.isDragging) {
      items.splice(items.indexOf(selectedItem), 1);
      items.push(selectedItem);      
    };

    menubtns.forEach(btn => {
      if (mouseX > btn.dx && mouseX < btn.dx + btn.width && mouseY > btn.dy && mouseY < btn.dy + btn.height) {
        canvas.style.cursor = 'pointer';
      };
    });
  };
};

const handleMouseUp = e => {
  // const handleShiftMouseUp = (container, item) => {
  //   item.coordinates.dx = screen.width + (inventory.length % 5) * 36;
  //   item.coordinates.dy = Math.floor(inventory.length / 5) * 36;
  //   delete item.shifted;
  //   canvas.style.cursor = 'crosshair';

  //   handleInventory(container, item);
  //   items.splice(items.indexOf(item), 1);

  //   drawOasis();
  //   drawEquipmentSection();
  //   drawInventorySection();
  // };

  const handleDragging = (item) => {
    const posX = e.clientX - canvas.getBoundingClientRect().left;
    const posY = e.clientY - canvas.getBoundingClientRect().top;
    const dx = Math.floor(posX / 64) * 64;
    const dy = Math.floor(posY / 64) * 64;

    if (!itemIsInScreenBounds(dx, dy) && !itemIsInEquipSection(dx, dy)) {
      item.isDragging = false;
      canvas.style.cursor = 'crosshair';
    }; 
    
    if (itemIsInScreenBounds(dx, dy) && !collisionDetect(dx, dy) && !waterDetect(dx, dy)) {
      item.scale = 1;
      item.coordinates = { dx, dy };
      item.isDragging = false;  
      if (equipped.includes(item)) {
        items.push(item);
        resetEquipmentSlot(item);
        equipped.splice(equipped.indexOf(item), 1);
      };
      canvas.style.cursor = 'grab';
    };

    if (waterDetect(dx, dy)) {
      if (items.includes(item)) items.splice(items.indexOf(item), 1);
      if (equipped.includes(item)) {
        resetEquipmentSlot(item);
        equipped.splice(equipped.indexOf(item), 1);
      };
      canvas.style.cursor = 'crosshair';
    } else if (collisionDetect(dx, dy)) {
      item.isDragging = false;
      canvas.style.cursor = 'crosshair';
    };

    if (itemIsInEquipSection(dx, dy) && currentMenu === 'inventory') {
      handleEquipping(item);
      canvas.style.cursor = 'grab';
    };

    drawOasis();
    drawEquipmentSection();
    // drawInventorySection();
  };

  if (game.on) {
    // const backpack = player.data.details.equipped.back;
    items.concat(equipped).forEach(item => {
      // if (item.shifted && backpack !== "empty") {
      //   handleShiftMouseUp(backpack, item);    
      // } else 
      if (item.isDragging) {
        handleDragging(item);
      };
      // isShiftKeyPressed = false;
    });
  };
};

// handle player movement/update item locations 
const updateWorldLocations = (valX, valY) => {
  player.data.details.location.x += valX;
  player.data.details.location.y += valY;

  // Update object locations in the world
  items.forEach(item => {
    item.coordinates.dx -= valX * item.size * item.scale;
    item.coordinates.dy -= valY * item.size * item.scale;
  });
};
const handleKeyDown = e => {
  if (game.off || chat.open || player.cooldown) {
    return;
  };

  const KEY_W = 'w';
  const KEY_S = 's';
  const KEY_A = 'a';
  const KEY_D = 'd';

  let dx = player.coordinates.dx + player.offset;
  let dy = player.coordinates.dy + player.offset;
  let valX = 0;
  let valY = 0;

  switch (e.key) {
    case KEY_W:
      console.log('w');
      player.direction = player.source.upward;
      dy -= player.size;
      valY--;
      break;

    case KEY_S:
      console.log('s');
      player.direction = player.source.downward;
      dy += player.size;
      valY++;
      break;

    case KEY_A:
      console.log('a');
      player.direction = player.source.leftward;
      dx -= player.size;
      valX--;
      break;

    case KEY_D:
      console.log('d');
      player.direction = player.source.rightward;
      dx += player.size;
      valX++;
      break;

    default:
      return;
  };

  if (!collisionDetect(dx, dy)) {
    updateWorldLocations(valX, valY);
  };
  
  player.cooldown = true;
  setTimeout(() => {
    player.cooldown = false;
  }, player.speed);
  
  drawOasis();
};

// update player data
const updateLocalPlayerData = () => {
  const playerToUpdateIndex = resources.playerData.playerlist.findIndex(user => user.id === player.data.id);
  if (playerToUpdateIndex !== -1) {
    resources.playerData.playerlist[playerToUpdateIndex] = player.data;
  };
};
const postPlayerData = async (data) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to save player data. Server error.');
    };

  } catch(error) {
    console.error('Error saving player data:', error.message);
  };
};
const updateAndPostPlayerData = async () => {
  updateLocalPlayerData();
  await postPlayerData(resources.playerData);
};

// const handleMouseUp = e => {
//   const handleShiftMouseUp = (container, item) => {
//     item.coordinates.dx = screen.width + (inventory.length % 5) * 36;
//     item.coordinates.dy = Math.floor(inventory.length / 5) * 36;
//     delete item.shifted;
//     canvas.style.cursor = 'crosshair';

//     handleInventory(container, item);
//     items.splice(items.indexOf(item), 1);

//     drawOasis();
//     drawEquipmentSection();
//     drawInventorySection();
//   };

//   const handleDragging = (item) => {
//     const posX = e.clientX - canvas.getBoundingClientRect().left;
//     const posY = e.clientY - canvas.getBoundingClientRect().top;
//     const dx = Math.floor(posX / 64) * 64;
//     const dy = Math.floor(posY / 64) * 64;

//     if (!itemIsInScreenBounds(dx, dy) && !itemIsInEquipSection(dx, dy)) {
//       item.isDragging = false;
//       canvas.style.cursor = 'crosshair';
//     }; 
    
//     if (itemIsInScreenBounds(dx, dy) && !collisionDetect(dx, dy) && !waterDetect(dx, dy)) {
//       item.scale = 1;
//       item.coordinates = { dx, dy };
//       item.isDragging = false;  
//       canvas.style.cursor = 'grab';
//       if (equipped.includes(item)) {
//         items.push(item);
//         resetEquipmentSlot(item);
//         equipped.splice(equipped.indexOf(item), 1);
//       };
//     };

//     if (waterDetect(dx, dy)) {
//       if (items.includes(item)) items.splice(items.indexOf(item), 1);
//       if (equipped.includes(item)) {
//         resetEquipmentSlot(item);
//         equipped.splice(equipped.indexOf(item), 1);
//       };
//       canvas.style.cursor = 'crosshair';
//     } else if (collisionDetect(dx, dy)) {
//       item.isDragging = false;
//       canvas.style.cursor = 'crosshair';
//     };

//     if (itemIsInEquipSection(dx, dy) && currentMenu === 'inventory') {
//       handleEquipping(item);
//       canvas.style.cursor = 'grab';
//     };

//     drawOasis();
//     drawEquipmentSection();
//     drawInventorySection();
//   };

//   if (form.closed) {
//     backpack = player.data.details.equipped.back;
//     items.concat(equipped).forEach(item => {
//       if (item.shifted && backpack !== "empty") {
//         handleShiftMouseUp(backpack, item);    
//       } else 
//       if (item.isDragging) {
//         handleDragging(item);
//       };
//       isShiftKeyPressed = false;
//     });
//   };
// };
// event listeners --------------------------------------------------
addEventListener("DOMContentLoaded", e => {
  handleDOMContentLoaded();
  
  document.querySelector('#login-form').addEventListener('submit', handleLogin, { once: true });
  
  addEventListener('mousedown', handleMouseDown);
  addEventListener('mousemove', handleMouseMove);
  addEventListener('mouseup', handleMouseUp);

  addEventListener('keydown', handleKeyDown);
  // addEventListener('keyup', handleKeyUp);

  addEventListener('beforeunload', async (e) => {
    await updateAndPostPlayerData();
  });
});

// let backpack = null;

// let currentMenu = 'inventory';
// let isShiftKeyPressed = false;
// let chatbox = false;

// const handleInventory = (container, item) => {
//   if (container.contents) {
//     container.contents.push(item);
//     inventory.push(item);
//     // is the item in the world... or is it in a different container?
//   };
// };

// const drawinventoryLocationsSpacesAndItems = (storage, expanded, startY, itemIndex) => {
//   const gapBetweenStorageSpaces = 6;
//   const rowLength = 5
//   const unusedSpacesToFillOutRow = rowLength - (storage.spaces % rowLength);
//   const numberOfSpacesToDraw = expanded ? storage.spaces + unusedSpacesToFillOutRow : 20; 

//   for (let i = 0; i < numberOfSpacesToDraw; i++) {
//     const x = i % rowLength * 36;
//     const y = Math.floor(i / rowLength) * 36;

//     if (i < storage.spaces) ctx.fillStyle = '#E1E1E1';
//     if (i >= storage.spaces) ctx.fillStyle = '#404040';

//     const spaceX = screen.width + gapBetweenStorageSpaces + x;
//     const spaceY = startY + gapBetweenStorageSpaces + y;
//     ctx.fillRect(spaceX, spaceY, 34, 34);
    
//     if (inventory[i + itemIndex]) {
//       const item = inventory[i + itemIndex];
//       item.coordinates.dx = spaceX;
//       item.coordinates.dy = spaceY + 1;
//       item.scale = 0.5;
//       item.draw(ctx);
//     };
//   };
// };

// let inventoryExpanded = false;
// let stashExpanded = false;
// let inventoryStack = [];
// let containerStack = [];

// const drawInventorySection = () => {  
//   ctx.clearRect(screen.width, 256, 192, 448);
//   ctx.fillStyle = '#2e2e2e';
//   ctx.fillRect(screen.width, 256, 192, 448);

//   backpack = player.data.details.equipped.back;
//   if (backpack && backpack !== "empty") {
//     ctx.drawImage(menu.image, containerPositions[backpack.name].sx, containerPositions[backpack.name].sy, containerPositions[backpack.name].width, containerPositions[backpack.name].height, screen.width + 4, 260, containerPositions[backpack.name].width, containerPositions[backpack.name].height);

//     if (!inventoryLocations.secondary.open) {
//       drawinventoryLocationsSpacesAndItems(backpack, true, 292, 0);
//     // } else {  
//     //   if (backpack.contents.length < 21) {
//     //     drawinventoryLocationsSpacesAndItems(backpack, false, 292, 0);
      
//     //   } else if (!stashExpanded && backpack.contents.length > 20) {
//     //     ctx.drawImage(menu.image, arrowPositions.activeDown.sx, arrowPositions.activeDown.sy, arrowPositions.activeDown.size, arrowPositions.activeDown.size, screen.width + 156, 260, arrowPositions.activeDown.size, arrowPositions.activeDown.size);
//     //     drawinventoryLocationsSpacesAndItems(backpack, false, 0);
      
//     //   } else if (stashExpanded && backpack.contents.length > 20) {
//     //     ctx.drawImage(menu.image, arrowPositions.activeUp.sx, arrowPositions.activeUp.sy, arrowPositions.activeUp.size, arrowPositions.activeUp.size, screen.width + 156, 260, arrowPositions.activeUp.size, arrowPositions.activeUp.size);
//     //     drawinventoryLocationsSpacesAndItems(backpack, false, 292, 21);
//     //   };
//     };
//   }
// };

// const handleKeyUp = e => {
//   if (e.key === 'Shift') {
//     isShiftKeyPressed = false;
//   };
// };