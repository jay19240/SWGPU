import { gfx2Manager } from '../gfx2/gfx2_manager';
import { Gfx2Drawable } from '../gfx2/gfx2_drawable';
import { Gfx2TileMap } from '../gfx2_tile/gfx2_tile_map';
import { Gfx2IsoTile } from './gfx2_iso_tile';

/**
 * A Isometric tilemap layer.
 */
class Gfx2IsoTileMapLayer extends Gfx2Drawable {
  tilemap: Gfx2TileMap;
  layerIndex: number;
  tiles: Array<Gfx2IsoTile>;
  frameIndex: number;
  frameProgress: number;
  showDebug: boolean;

  constructor() {
    super();
    this.tilemap = new Gfx2TileMap();
    this.layerIndex = 0;
    this.tiles = [];
    this.frameIndex = 0;
    this.frameProgress = 0;
    this.showDebug = false;
  }

  loadFromTileMap(tilemap: Gfx2TileMap, layerIndex: number): void {
    this.tilemap = tilemap;
    this.layerIndex = layerIndex;
    this.tiles = [];
    this.frameIndex = 0;
    this.frameProgress = 0;

    const tilelayer = tilemap.getTileLayer(layerIndex);

    if (tilelayer.isVisible()) {
      for (let i = 0; i < tilelayer.getRows(); i++) {
        for (let j = 0; j < tilelayer.getColumns(); j++) {
          const tileId = tilelayer.getTile(j, i);
          if (tileId == 0) {
            continue;
          }
  
          this.placeTile(tileId, i, j);
        }
      }
    }
  }

  /**
   * The update function.
   * 
   * @param {number} ts - The timestep.
   */
  update(ts: number): void {
    const tileset = this.tilemap.getTileset();
    const tilelayer = this.tilemap.getTileLayer(this.layerIndex);
    if (!tileset || !tilelayer) {
      return;
    }

    if (this.frameProgress > tilelayer.getFrameDuration()) {
      this.frameIndex = this.frameIndex + 1;
      this.frameProgress = 0;
    }

    for (const tile of this.tiles) {
      if (tile.animation.length > 0) {
        const tileId = tile.animation[this.frameIndex % tile.animation.length];
        tile.sx = tileset.getTilePositionX(tileId);
        tile.sy = tileset.getTilePositionY(tileId);
      }
    }

    this.frameProgress += ts;
  }

  /**
   * The draw function.
   */
  draw(): void {
    const tilelayer = this.tilemap.getTileLayer(this.layerIndex);
    if (!tilelayer) {
      return;
    }

    const ctx = gfx2Manager.getContext();

    if (tilelayer.isVisible()) {
      const tileset = this.tilemap.getTileset();
      const scale = this.tilemap.getTileWidth() / tileset.getTileWidth();
  
      for (let i = 0; i < tilelayer.getRows(); i++) {
        for (let j = 0; j < tilelayer.getColumns(); j++) {
          let tileId = tilelayer.getTile(j, i);
          const position = this.tilemap.getPositionIso(i, j);
          const animation = tileset.getAnimation(tileId);
  
          if (animation) {
            tileId = animation[this.frameIndex % animation.length];
          }
  
          ctx.drawImage(
            tileset.getTexture(),
            tileset.getTilePositionX(tileId),
            tileset.getTilePositionY(tileId),
            tileset.getTileWidth(),
            tileset.getTileHeight(),
            position[0],
            position[1],
            this.tilemap.getTileWidth(),
            tileset.getTileHeight() * scale
          );
        }
      }
    }

    if (this.showDebug) {
      for (let i = 0; i < tilelayer.getRows(); i++) {
        for (let j = 0; j < tilelayer.getColumns(); j++) {
          let tileId = tilelayer.getTile(j, i);
          const position = this.tilemap.getPositionIso(i, j);

          if (tileId != 0) {
            ctx.save();
            ctx.translate(position[0], position[1]);
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(32, -16);
            ctx.lineTo(0, -32);
            ctx.lineTo(-32, -16);
            ctx.lineTo(0, 0);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
          }
        }
      }
    }
  }

  placeTile(tileId: number, row: number, col: number): void {
    const tileset = this.tilemap.getTileset();
    const scale = this.tilemap.getTileWidth() / tileset.getTileWidth();
    const animation = tileset.getAnimation(tileId);
    const position = this.tilemap.getPositionIso(row, col);

    this.tiles.push(new Gfx2IsoTile({
      texture: tileset.getTexture(),
      animation: animation ?? [],
      elevation: this.layerIndex,
      col: col,
      row: row,
      sx: tileset.getTilePositionX(tileId),
      sy: tileset.getTilePositionY(tileId),
      sw: tileset.getTileWidth(),
      sh: tileset.getTileHeight(),
      dx: position[0],
      dy: position[1],
      dw: this.tilemap.getTileWidth(),
      dh: tileset.getTileHeight() * scale
    }));
  }

  removeTileAt(row: number, col: number): void {
    const index = this.tiles.findIndex(t => t.col == col && t.row == row);
    if (index == -1) {
      return;
    }

    this.tiles.splice(index, 1);
  }

  getTiles(): Array<Gfx2IsoTile> {
    return this.tiles;
  }

  setShowDebug(showDebug: boolean): void {
    this.showDebug = showDebug;
  }
}

export { Gfx2IsoTileMapLayer };