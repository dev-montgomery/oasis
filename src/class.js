// Base class for objects with common properties
class GameObject {
  constructor({ src, source, coordinates, size }) {
    this.image = new Image();
    this.image.src = src;
    this.source = source;
    this.coordinates = coordinates;
    this.size = size || 64;
  };

  // Ensure that the image is loaded
  loadImage = () => {
    return new Promise((resolve, reject) => {
      this.image.onload = resolve;
      this.image.onerror = reject;
    });
  };
};

export class Player extends GameObject {
  constructor({ source, coordinates }) {
    super({ src: '../backend/assets/player_data/player.png', source, coordinates });
    this.direction = { sx: 0, sy: 0 };
    this.offset = 16;
    this.speed = 500;
    this.cooldown = false;
  };

  draw = (ctx) => {
    ctx.drawImage(
      this.image,
      this.direction.sx,
      this.direction.sy,
      this.size,
      this.size,
      this.coordinates.dx,
      this.coordinates.dy,
      this.size,
      this.size
    );
  };
};

export class Tile extends GameObject {
  constructor({ source, coordinates }) {
    super({ src: '../backend/assets/map_data/spritesheet-genus.png', source, coordinates });
  };
};

export class Item extends GameObject {
  constructor({ id, type, name, sx, sy, dx, dy, scale }) {
    super({ src: '../backend/assets/item_data/items.png' });
    this.id = id;
    this.type = type;
    this.name = name;
    this.sx = sx;
    this.sy = sy;
    this.dx = dx;
    this.dy = dy;
    this.scale = scale;
    this.isDragging = false;
  };

  draw = (ctx) => {
    ctx.drawImage(
      this.image,
      this.sx,
      this.sy,
      this.size,
      this.size,
      this.dx,
      this.dy,
      this.size * this.scale,
      this.size * this.scale
    );
  };
};