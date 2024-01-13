import { resources } from './src/resources.js';
import { Player , Tile, Item } from './src/class.js';

window.addEventListener('load', event => {

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
  const login = document.querySelector('#login-form');
  let chatbox = false;

  // init player | npcs | items --------------------------------------------
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

  const drawFrame = (image, frame) => {
    const { sx, sy } = frame.source;
    const { dx, dy } = frame.coordinates;
    const size = frame.size;
    ctx.drawImage(image, sx, sy, size, size, dx, dy, size, size);
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
    const playerStatsContainer = document.getElementById('playerdata-container');
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
    const drawOasisOutput = drawOasis();
    console.log(drawOasisOutput.boundaries)
    return detectCollision(drawOasisOutput.boundaries, newX, newY);
  };
  
  const waterDetect = (newX, newY) => {
    return detectCollision(wateries, newX, newY);
  };

  function updateWorldLocations(valX, valY) {
    player.data.details.location.x += valX;
    player.data.details.location.y += valY;
  
    // Update object locations in the world
    // items.forEach(item => {
    //   item.dx -= valX * item.size * item.scale;
    //   item.dy -= valY * item.size * item.scale;
    // });
  };

  // load assets -----------------------------------------------------------
  const genus = new Image();
  genus.src = './backend/assets/map_data/spritesheet-genus.png';
  genus.onload = () => {
    genus.loaded = true;
    genus.size = 64;
    genus.spritesheetFrames = 25;
    genus.mapFrameDimensions = { row: 160, col: 140 };
  };

  // draw functions -------------------------------------------------------- 
  const drawOasis = (currentMap = resources.mapData.isLoaded && resources.mapData.genus01.layers) => {
    const upperTiles = [ 576, 577, 578, 579, 601, 602, 603, 604 ];
    const waterTiles = [ 1, 2, 3, 4, 5, 6, 7, 8 ];
    const boundaries = [];
    const wateries = [];
    const uppermost = [];

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
            const upper = new Tile({ sx, sy }, { dx, dy });
            upper.loadImage().then(() => {
              upper.tileID = tileID;
              uppermost.push(upper);
            });
          };

          if (waterTiles.includes(tileID)) {
            const water = new Tile({ sx, sy }, { dx, dy });
            water.loadImage().then(() => {
              wateries.push(water);
            });
          };

          if (tileID === 25) {
            const boundary = new Tile({ sx, sy }, { dx, dy });
            boundary.loadImage().then(() => {
              boundaries.push(boundary);
            });
          } else {
            drawFrame(genus, { source: { sx, sy }, coordinates: { dx, dy }, size: 64 });
          };
        };
      });
    });

    player.draw(ctx);

    uppermost.forEach(tile => {
      drawFrame(
        genus, 
        { 
          source: { sx: tile.source.sx, sy: tile.source.sy }, 
          coordinates: { dx: tile.coordinates.dx, dy: tile.coordinates.dy },
          size: tile.size 
        }
      );
    });
    return { boundaries, wateries, uppermost };
  };

  // handle form and... enter game -----------------------------------------
  const handleFormAndEnterGame = async e => {
    e.preventDefault();

    const playerName = document.getElementById('playername').value;
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

    // canvas.style.background = '#464646';
    const game = document.querySelector('#game-container');
    game.style.display = 'flex';

    // Enter World
    if (genus.loaded && player.loaded) {
      appendPlayerStatData();
      drawOasis();
    };
  };

  // event listeners -------------------------------------------------------
  addEventListener('mousedown', e => {

  });

  addEventListener('mousemove', e => {

  });

  addEventListener('mouseup', e => {

  });

  addEventListener('keydown', e => {
    if (!form.closed || chatbox || player.cooldown) {
      return;
    };
  
    let { dx, dy } = player.coordinates;
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

  addEventListener('beforeunload', async (e) => {
    await updateAndPostPlayerData();
  });

  login.addEventListener('submit', handleFormAndEnterGame);
});