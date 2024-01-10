import { resources } from './src/resources.js';
import { Item, Player, Tile } from './src/class.js';

window.addEventListener('load', event => {

  // Canvas and Screen Element Sizes
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

  // const and let variables
  const API_URL = 'http://localhost:4000/playerdata';
  const form = document.querySelector('.form-container');
  const login = document.querySelector('#login-form');

  // init player
  const player = new Player({ 
    sprite: { 
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

  // utility functions
  const updateLocalPlayerData = () => {
    const playerToUpdateIndex = resources.playerData.playerlist.findIndex(player => player.id === player.data.id);
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

  const loadImage = async (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = src;
    });
  };

  // load assets
  const genus = loadImage('./backend/assets/map_data/spritesheet-genus.png');
  genus.size = 64;
  genus.spritesheetFrames = 25;
  genus.mapFrameDimensions = { row: 160, col: 140 };
  genus.loaded = true;

  // handle form
  const handleFormAndLoadPlayerData = async e => {
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

    if (genus.loaded && player.loaded) {
      player.draw(ctx);
      // drawGenus({ player })
      // appendPlayerData()
    };
  };

  // event listeners
  addEventListener('mousedown', e => {

  });

  addEventListener('mousemove', e => {

  });

  addEventListener('mouseup', e => {

  });

  addEventListener('keydown', e => {

  });

  addEventListener('beforeunload', async () => {
    await updateAndPostPlayerData();
  });

  login.addEventListener('submit', handleFormAndLoadPlayerData);
});