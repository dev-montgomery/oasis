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
  
  const upperTiles = [ 576, 577, 578, 579, 601, 602, 603, 604 ];
  const waterTiles = [ 1, 2, 3, 4, 5, 6, 7, 8 ];

  const form = document.querySelector('.form-container');
  const login = document.querySelector('#login-form');

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
            const upper = new Tile({
              source: { sx, sy },
              coordinates: { dx, dy }
            });
            upper.tileID = tileID;
            uppermost.push(upper);
          };

          if (waterTiles.includes(tileID)) {
            const water = new Tile({
              source: { sx, sy },
              coordinates: { dx, dy }
            });
            wateries.push(water);
          };

          if (tileID === 25) {
            const boundary = new Tile({
              source: { sx, sy },
              coordinates: { dx, dy }
            });
            boundaries.push(boundary);
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

  // game functions --------------------------------------------------------


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

    canvas.style.background = '#464646';

    // Enter World
    if (genus.loaded && player.loaded) {
      drawOasis();
      // appendPlayerData()
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

  });

  addEventListener('beforeunload', async (e) => {
    await updateAndPostPlayerData();
  });

  login.addEventListener('submit', handleFormAndEnterGame);
});