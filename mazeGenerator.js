import Grid from "./grid.js";

export default class MazeGenerator {
  #rows;
  #cols;
  #board;

  constructor(rows = 5, cols = 5, density = 0.8) {
    this.#rows = rows;
    this.#cols = cols;
    this.wallRemovalProbability = density;
    this.#board = {
      rows: rows,
      cols: cols,
      start: {
        row: 0,
        col: 0,
      },
      goal: {
        row: rows - 1,
        col: cols - 1,
      },
      maze: this.#defaultGrid(),
    };
  }

  #defaultGrid() {
    const grid = new Grid(this.#rows, this.#cols, {});
    for (let r = 0; r < this.#rows; r++) {
      for (let c = 0; c < this.#cols; c++) {
        grid.set(
          { row: r, col: c },
          {
            row: r,
            col: c,
            north: true,
            east: true,
            west: true,
            south: true,
            inMaze: false,
          }
        );
      }
    }
    return grid;
  }

  generate() {
    const start = this.#board.start;
    const startCoords = { row: start.row, col: start.col };
    const startCell = this.#board.maze.get(startCoords);
    startCell.inMaze = true;
    this.#board.maze.set(startCoords, startCell);

    let frontier = this.#board.maze
      .neighbourValues(startCoords)
      .filter((cell) => !cell.inMaze);

    while (frontier.length > 0) {
      const i = Math.floor(Math.random() * frontier.length);
      const currentCell = frontier[i];
      frontier[i] = frontier[frontier.length - 1];
      frontier.pop();
      const coords = {
        row: currentCell.row,
        col: currentCell.col,
      };

      const neighboursInMaze = this.neighboursInMaze(coords);
      // console.log(`Neighbours in cell:`, neighboursInMaze);

      if (neighboursInMaze.length > 0) {
        const randomNeighbour =
          neighboursInMaze[Math.floor(Math.random() * neighboursInMaze.length)];
        this.cellsConnect(coords, randomNeighbour);
      }

      const cell = this.#board.maze.get(coords);
      if (cell && !cell.inMaze) {
        console.log("cell:", cell);
        cell.inMaze = true;
        this.#board.maze.set(coords, cell);

        const neighbors = this.#board.maze.neighbourValues(coords);
        const unvisitedNeighbors = neighbors.filter(
          (neighbor) => !neighbor.inMaze
        );
        frontier.push(...unvisitedNeighbors);
      }
    }
  }

  neighboursInMaze(coords) {
    const neighboursInMaze = [];
    const neighbours = this.#board.maze.neighbourValues(coords);
    for (const neighbour of neighbours) {
      if (neighbour.inMaze) {
        neighboursInMaze.push(neighbour);
      }
    }
    return neighboursInMaze;
  }

  cellsConnect(cellFrom, cellTo) {
    const maze = this.#board.maze;
    const isDirections = [
      {
        direction: "north",
        opposite: "south",
        expression: cellTo.row === cellFrom.row - 1,
      },
      {
        direction: "east",
        opposite: "west",
        expression: cellTo.col === cellFrom.col + 1,
      },
      {
        direction: "south",
        opposite: "north",
        expression: cellTo.row === cellFrom.row + 1,
      },
      {
        direction: "west",
        opposite: "east",
        expression: cellTo.col === cellFrom.col - 1,
      },
    ];
    if (
      maze.isWithinGrid({ row: cellFrom.row, col: cellFrom.col }) &&
      maze.isWithinGrid({ row: cellTo.row, col: cellTo.col })
    ) {
      for (const isDirection of isDirections) {
        if (isDirection.expression) {
          if (Math.random() < this.wallRemovalProbability) {
            const newCell1 = maze.get({ row: cellFrom.row, col: cellFrom.col });
            const newCell2 = maze.get({ row: cellTo.row, col: cellTo.col });

            newCell1[isDirection.direction] = false;
            newCell2[isDirection.opposite] = false;

            maze.set({ row: newCell1.row, col: newCell1.col }, newCell1);
            maze.set({ row: newCell2.row, col: newCell2.col }, newCell2);
          }
        }
      }
    }
  }

  getBoard() {
    const mazeArr = [];
    for (let currRow = 0; currRow < this.#board.rows; currRow++) {
      const row = [];
      for (let currCol = 0; currCol < this.#board.cols; currCol++) {
        row.push(this.#board.maze.get({ row: currRow, col: currCol }));
      }
      mazeArr.push(row);
    }
    this.#board.maze = mazeArr;
    return this.#board;
  }
}
