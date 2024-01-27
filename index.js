import { resources } from './src/resources.js';
import { Player , Tile, Item } from './src/class.js';

// Canvas and Screen Element Sizes ---------------------------------------
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 704;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const screen = {
  frames: { row: 11, col: 13 },
  width: CANVAS_WIDTH - 192, 
  height: CANVAS_HEIGHT
};

// const and let variables -----------------------------------------------
const API_URL = 'http://localhost:4000/playerdata';

const form = document.querySelector('.form-container');
const game = document.querySelector('.game-container');

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
const menuButtonPositions = {
  mapbtn: { sx: 0, sy: 320, dx: screen.width + 16, dy: 208, size: 32 },
  inventorybtn: { sx: 32, sy: 320, dx: screen.width + 80, dy: 208, size: 32 },
  listbtn: { sx: 64, sy: 320, dx: screen.width + 142, dy: 208, size: 32 },
  active: { sx: 96, sy: 320 }
};
const stancesButtonPositions = {
  attackInactive: { sx: 96, sy: 352, dx: screen.width, dy: 640, size: 32, scale: 2 },
  attackActive: { sx: 96, sy: 384, dx: screen.width, dy: 640, size: 32, scale: 2 },
  defendInactive: { sx: 128, sy: 352, dx: screen.width + 64, dy: 640, size: 32, scale: 2 },
  defendActive: { sx: 128, sy: 384, dx: screen.width + 64, dy: 640, size: 32, scale: 2 },
  passiveInactive: { sx: 160, sy: 352, dx: screen.width + 128, dy: 640, size: 32, scale: 2 },
  passiveActive: { sx: 160, sy: 384, dx: screen.width + 128, dy: 640, size: 32, scale: 2 },
};
const mapSectionScrollButtonPositions = {
  inactiveDown : { sx: 0, sy: 320, dx: screen.width + 160, dy: 288, size: 32 },
  inactiveUp: { sx: 32, sy: 320, dx: screen.width + 160, dy: 256, size: 32 },
  activeDown: { sx: 0, sy: 352, dx: screen.width + 160, dy: 288, size: 32 },
  activeUp: { sx: 32, sy: 352, dx: screen.width + 160, dy: 256, size: 32 },
};
const containerPositions = {
  backpack: { x: 0, y: 32 * 8, size: 32 },
  labeledbackpack: { x: 0, y: 32 * 9, size: 32 },
  enchantedbackpack: { x: 32, y: 32 * 8, size: 32 },
  labeledenchantedbackpack: { x: 32, y: 32 * 9, size: 32 },
  depot: { x: 64, y: 32 * 8, size: 32 },
};
const rangeOfPlayer = {
  x: screen.width / 2 - 96, 
  y: screen.height / 2 - 96, 
  width: 192, 
  height: 192
}; 

// load assets ------------------------------------------------
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
  containers: containerPositions,
  toggles: { menuSection: menuButtonPositions, stanceSection: stancesButtonPositions, mapContentsSection: mapSectionScrollButtonPositions },
  loaded: false
};
// ---------------------
let menuToggle = 'inventory';
let chatbox = false;

let boundaries = [];
let wateries = [];
let uppermost = [];

let equipped = [];
let inventory = [];
let items = [];

// init player | npcs --------------------------------------------
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

// utility functions -----------------------------------------------------
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

const appendPlayerStatData = () => {
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

const initEquipmentItems = () => {
  const equippedItems = player.data.details.equipped;
  for (const piece in equippedItems) {
    if (equippedItems[piece] !== 'empty') {
      const item = equippedItems[piece];
      initItem(item.id, item.type, item.name, item.source.sx, item.source.sy, item.coordinates.dx, item.coordinates.dy, item.scale);
    };
  };
};

const handlePlayerStatsEquipmentAndInventory = () => {
  appendPlayerStatData();
  initEquipmentItems();
};

// --------------------------------
const initItem = (id, type, name, sx, sy, dx, dy, scale = 1) => {
  const rpgItem = new Item(id, type, name, { source: { sx, sy }, coordinates: { dx, dy } }, scale);
  
  const category = resources.itemData[type];
  if (category && category[name]) {
    Object.assign(rpgItem, category[name]);
  };

  // console.log(`${name} created.`, rpgItem);

  if (isInEquipmentSection(dx, dy)) {
    rpgItem.scale = 0.5;
    equipped.push(rpgItem);
  // } else if (isInInventorySection(rpgItem)) {
  //   inventory.push(rpgItem);
  } else {
    items.push(rpgItem);
  };
};

const randomID = (input) => {
  return Math.random() * input;
};

const updateWorldLocations = (valX, valY) => {
  player.data.details.location.x += valX;
  player.data.details.location.y += valY;

  // Update object locations in the world
  items.forEach(item => {
    item.coordinates.dx -= valX * item.size * item.scale;
    item.coordinates.dy -= valY * item.size * item.scale;
  });
};
// --------------------------------
const inRangeOfPlayer = (pointX, pointY) => {    
  return (
    pointX >= rangeOfPlayer.x &&
    pointX < rangeOfPlayer.x + rangeOfPlayer.width &&
    pointY >= rangeOfPlayer.y &&
    pointY < rangeOfPlayer.y + rangeOfPlayer.height
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

const isMouseOverButton = (mouseX, mouseY, button) => isPointInsideRectangle(mouseX, mouseY, button);

const isInInventorySection = (item) => {
  const inventorySection = inventoryContainerSizes.inventorySection;
  return isPointInsideRectangle(item.dx, item.dy, inventorySection);
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
  // mapbtn: { sx: 0, sy: 320, dx: screen.width + 16, dy: 208, size: 32 },
  // inventorybtn: { sx: 32, sy: 320, dx: screen.width + 80, dy: 208, size: 32 },
  // listbtn: { sx: 64, sy: 320, dx: screen.width + 142, dy: 208, size: 32 },
  // active: { sx: 96, sy: 320 }
// inventory functions

const isInsideScreenBounds = (dx, dy) => {
  return (
    dx + 64 < screen.width &&
    dx >= 0 &&
    dy + 64 < screen.height &&
    dy >= 0
  );
};

const drawMenu = () => {
  switch(menuToggle) {
    case 'map':
      // draw minimap
      // draw button toggle
      // draw minimap contents
      // append text
      break;
    case 'inventory':
      drawEquipmentSection();
      // draw button toggle
      // draw inventory
      break;
    case 'tracking':
      // draw who is being tracked
      // draw button toggle
      // draw list
      // draw stance
      break;
    default:
      break;
  };
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

// handle equipping items ------------------------------------------------
const isInEquipmentSection = (dx, dy) => {
  return isPointInsideRectangle(dx, dy, {
    x: screen.width,
    y: 0,
    width: 192,
    height: 192
  });
};

const handleEquipping = (item) => {
  if (menuToggle === 'inventory') {
    const playersEquippedItems = player.data.details.equipped;

    const resetPreviousItem = (type) => {
      if (playersEquippedItems[type] !== 'empty') {
        const prev = equipped.find(gear => gear.id === playersEquippedItems[type].id);
        prev.coordinates.dx = item.coordinates.dx;
        prev.coordinates.dy = item.coordinates.dy;
        prev.scale = 1;
        items.push(prev);
        equipped.splice(equipped.indexOf(prev), 1);
      };
    };

    const equipItem = (type) => {
      resetPreviousItem(type);
      playersEquippedItems[type] = item;
      item.coordinates.dx = equipLocations[type].x;
      item.coordinates.dy = equipLocations[type].y;
      item.scale = 0.5;
      equipped.push(item);
      items.splice(items.indexOf(item), 1);
      drawEquipmentSection();
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

// handle loading, form, and enter game ----------------------------------
const handleLoading = () => {
  const loadScreen = document.querySelector('.loading-container');
  const progress = document.querySelector('.loading-progress');

  const loadedAssets = [background, genus, menu].filter(asset => asset.loaded);
  const percentage = (loadedAssets.length / 3) * 100;

  progress.textContent = `entering oasis ... ${percentage.toFixed(2)}%`;
  
  if (loadedAssets.length === 3) {
    loadScreen.style.display = 'none';
    document.body.style.background = `url(${background.image.src}) center/cover no-repeat`;
    form.classList.remove('hidden');
    document.querySelector('#playername').focus();
  };
};

const handleFormAndEnterGame = async e => {
  e.preventDefault();

  const playerName = document.querySelector('#playername').value;
  player.data = resources.createPlayer(playerName);

  form.style.visibility = 'hidden';
  form.closed = true;

  await new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (typeof resources !== 'undefined') {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });

  // Enter World
  setTimeout(() => {
    if (genus.loaded && player.loaded) {
      document.querySelector('body').style.background = '#464646';
      canvas.style.background = '#464646';
      game.classList.remove('hidden');
      game.style.display = 'flex';
      handlePlayerStatsEquipmentAndInventory();
      drawOasis();
      drawMenu();
      // could add a character animation poofing into existence
    };
  }, 500);
};

// init items in game ----------------------------------------------------
const initItemsInGame = () => {
  // item 1
  initItem(randomID(items.length + 1), 'head', 'hood', 0, 0, 256, 256);
  // item 2
  initItem(randomID(items.length + 1), 'chest', 'tunic', 64, 0, 256, 320);
  // item 3
  initItem(randomID(items.length + 1), 'legs', 'pants', 128, 0, 256, 384);
  // item 4
  initItem(randomID(items.length + 1), 'neck', 'fanged', 448, 128, 192, 256);
  // item 5
  initItem(randomID(items.length + 1), 'mainhand', 'sword', 320, 64, 192, 320);
  // item 6
  initItem(randomID(items.length + 1), 'offhand', 'kite', 576, 64, 320, 320);
  // item 7
  initItem(randomID(items.length + 1), 'feet', 'shoes', 192, 0, 256, 448);
  // item 8
  initItem(randomID(items.length + 1), 'back', 'backpack', 0, 448, 320, 256);
  // item 9
  initItem(randomID(items.length + 1), 'head', 'coif', 0, 128, 512, 256);
  // item 10
  initItem(randomID(items.length + 1), 'chest', 'chainmail', 64, 128, 512, 320);
  // item 11
  initItem(randomID(items.length + 1), 'legs', 'chainmail kilt', 128, 128, 512, 384);
  // item 12
  initItem(randomID(items.length + 1), 'neck', 'silver', 512, 128, 448, 256);
  // item 13
  initItem(randomID(items.length + 1), 'mainhand', 'spear', 512, 64, 448, 320);
  // item 14
  initItem(randomID(items.length + 1), 'offhand', 'heater', 576, 128, 576, 320);
  // item 15
  initItem(randomID(items.length + 1), 'feet', 'chausses', 192, 128, 512, 448);
  // item 16
  initItem(randomID(items.length + 1), 'back', 'enchantedbackpack', 64, 448, 576, 384);
};

initItemsInGame();

// event listeners -------------------------------------------------------

addEventListener('mousedown', e => {
  // move items around map and how they stack, collision and water behavior
  if (form.closed) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    const selectedItem = findItemUnderMouse(mouseX, mouseY, items);      
    const equippedItem = findItemUnderMouse(mouseX, mouseY, equipped);
    
    if (selectedItem && inRangeOfPlayer(selectedItem.coordinates.dx, selectedItem.coordinates.dy)) {
      selectedItem.isDragging = true;
      canvas.style.cursor = 'grabbing';
    };

    if (equippedItem) {
      equippedItem.isDragging = true;
      canvas.style.cursor = 'grabbing';
    };
  };
  // move item into equipment section
  // handle equipping and unequipping
});

addEventListener('mousemove', e => {
  if (form.closed) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    const selectedItem = findItemUnderMouse(mouseX, mouseY, items);
    
    if (canvas.style.cursor !== 'grabbing') {
      canvas.style.cursor = 'crosshair';
    };

    if (selectedItem && canvas.style.cursor !== 'grabbing') {
      canvas.style.cursor = 'grab';
    };

    if (selectedItem && selectedItem.isDragging) {
      items.splice(items.indexOf(selectedItem), 1);
      items.push(selectedItem);      
    };
  };
});

addEventListener('mouseup', e => {
  const handleDragging = (item) => {
    const posX = e.clientX - canvas.getBoundingClientRect().left;
    const posY = e.clientY - canvas.getBoundingClientRect().top;
    const dx = Math.floor(posX / 64) * 64;
    const dy = Math.floor(posY / 64) * 64;
    const previousCoordinates = { dx: item.coordinates.dx, dy: item.coordinates.dy };
    if (!isInsideScreenBounds(dx, dy) && !isInEquipmentSection(dx, dy)) {
      item.isDragging = false;
      canvas.style.cursor = 'crosshair';
    } else if(isInsideScreenBounds(dx, dy)) {
      if (!collisionDetect(dx, dy) && !waterDetect(dx, dy)) {
        item.coordinates = { dx, dy };
        item.isDragging = false;
        canvas.style.cursor = 'grab';
      } else if (collisionDetect(dx, dy)) {
        item.isDragging = false;
        canvas.style.cursor = 'crosshair';
      } else if (waterDetect(dx, dy)) {
        items.splice(items.indexOf(item), 1);
        canvas.style.cursor = 'crosshair';
      };
      drawOasis();
    } else if (isInEquipmentSection(dx, dy)) {
      // item.coordinates = { dx, dy };
      handleEquipping(item);
      canvas.style.cursor = 'grab';
      drawOasis();
    };
  };

  if (form.closed) {
    items.forEach(item => {
      if (item.isDragging) {
        handleDragging(item);
      };
    });
  };
});

addEventListener('keydown', e => {
  if (!form.closed || chatbox || player.cooldown) {
    return;
  };

  let dx = player.coordinates.dx + player.offset;
  let dy = player.coordinates.dy + player.offset;
  let valX = 0;
  let valY = 0;

  switch (e.key) {
    case 'w':
      player.direction = player.source.upward;
      dy -= player.size;
      valY--;
      break;

    case 's':
      player.direction = player.source.downward;
      dy += player.size;
      valY++;
      break;

    case 'a':
      player.direction = player.source.leftward;
      dx -= player.size;
      valX--;
      break;

    case 'd':
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
});

addEventListener("DOMContentLoaded", () => {
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
});

const login = document.querySelector('#login-form');
login.addEventListener('submit', handleFormAndEnterGame);

addEventListener('beforeunload', async (e) => {
  await updateAndPostPlayerData();
});