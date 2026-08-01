import { TILE_TYPE, GAME_RULES } from "../../../shared/type.js";

const SPAWN_CORNERS = [
    { row: 1, col: 1 },                                               // top-left
    { row: 1, col: GAME_RULES.MAP_COLS - 2 },                         // top-right
    { row: GAME_RULES.MAP_ROWS - 2, col: 1 },                         // bottom-left
    { row: GAME_RULES.MAP_ROWS - 2, col: GAME_RULES.MAP_COLS - 2 },   // bottom-right
];

function createEmptyGrid(){
    const grid = [];

    for (let row = 0; row < GAME_RULES.MAP_ROWS; row++){
        const rowTiles = [];
        
        for (let col = 0; col < GAME_RULES.MAP_COLS; col++){
            rowTiles.push(TILE_TYPE.EMPTY);
        }
        grid.push(rowTiles);
    }

    return grid;
}

function placeBorderWalls(grid){
    const lastRow = GAME_RULES.MAP_ROWS - 1;
    const lastCol = GAME_RULES.MAP_COLS - 1;

    //fill the top and bottom row
    for (let col = 0; col < GAME_RULES.MAP_COLS; col++){
        grid[0][col] = TILE_TYPE.WALL;
        grid[lastRow][col] = TILE_TYPE.WALL;
    }

    //fill the left and right cplums
    for (let row = 0; row < GAME_RULES.MAP_ROWS; row++){
        grid[row][0] = TILE_TYPE.WALL;
        grid[row][lastCol] = TILE_TYPE.WALL;
    }
}

function placePillarWalls(grid){
    for (let row = 1; row < GAME_RULES.MAP_ROWS - 1; row++){
        for (let col = 1; col < GAME_RULES.MAP_COLS - 1; col++){
            if (row % 2 === 0 && col % 2 === 0){
                grid[row][col] = TILE_TYPE.WALL;
            }
        }

    }
}

function clearSpawnZones(grid) {
    for (const corner of SPAWN_CORNERS) {
        // which direction is "inward" depends on which corner this is
        const rowStep = corner.row === 1 ? 1 : -1;
        const colStep = corner.col === 1 ? 1 : -1;

        grid[corner.row][corner.col] = TILE_TYPE.EMPTY;
        grid[corner.row + rowStep][corner.col] = TILE_TYPE.EMPTY;
        grid[corner.row][corner.col + colStep] = TILE_TYPE.EMPTY;
        //make sure player can plade a bomb initially and have enough space to move around not die from its own blast (enough empty tiles)
        grid[corner.row + rowStep * 2][corner.col] = TILE_TYPE.EMPTY;
grid[corner.row][corner.col + colStep * 2] = TILE_TYPE.EMPTY;
    }
}

function isSafeTile(row, col) {
    for (const corner of SPAWN_CORNERS) {
        const rowStep = corner.row === 1 ? 1 : -1;
        const colStep = corner.col === 1 ? 1 : -1;

        const safeTiles = [
            { row: corner.row, col: corner.col },
            { row: corner.row + rowStep, col: corner.col },
            { row: corner.row, col: corner.col + colStep },
                { row: corner.row + rowStep * 2, col: corner.col },
                    { row: corner.row, col: corner.col + colStep * 2 },


        ];

        for (const tile of safeTiles) {
            if (tile.row === row && tile.col === col) {
                return true;
            }
        }
    }
    return false;
}

// probability of block spawning
const BLOCK_SPAWN_CHANCE = 0.6;

function placeRandomBlocks(grid) {
    for (let row = 1; row < GAME_RULES.MAP_ROWS - 1; row++) {
        for (let col = 1; col < GAME_RULES.MAP_COLS - 1; col++) {
            // skip anything that's not empty (walls)
            if (grid[row][col] !== TILE_TYPE.EMPTY) continue;

            // skip spawn corners and their safe neighbors
            if (isSafeTile(row, col)) continue;

            if (Math.random() < BLOCK_SPAWN_CHANCE) {
                grid[row][col] = TILE_TYPE.BLOCK;
            }
        }
    }
}

export function generateMap() {
    const grid = createEmptyGrid();

    placeBorderWalls(grid);
    placePillarWalls(grid);
    clearSpawnZones(grid);
    placeRandomBlocks(grid);

    return {
        rows: GAME_RULES.MAP_ROWS,
        cols: GAME_RULES.MAP_COLS,
        tiles: grid,
        spawnPoints: SPAWN_CORNERS,
    };
}
