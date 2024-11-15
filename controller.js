"use strict";

import MazeGenerator from "./mazeGenerator.js";
import MazeSolver from "./mazeSolver.js";
import Stack from "./stack.js";

window.addEventListener("load", async () => {
  const c = new Controller();
  c.init();
});

class Controller {
  constructor() {
    this.board = "";
    this.route = new Stack();
    this.handleGenerateClick = this.handleGenerateClick.bind(this);
    this.handleSolveBtnClick = this.handleSolveBtnClick.bind(this);
  }

  async init() {
    this.eventListeners();
  }

  eventListeners() {
    const generateBtn = document.querySelector("#generateBtn");
    generateBtn.removeEventListener("click", this.handleGenerateClick);
    generateBtn.addEventListener("click", this.handleGenerateClick);
    const solveBtn = document.querySelector("#solveBtn");
    solveBtn.removeEventListener("click", this.handleSolveBtnClick);
    solveBtn.addEventListener("click", this.handleSolveBtnClick);
  }

  handleGenerateClick(event) {
    event.preventDefault();
    const form = event.target.closest("form");
    const inputRows = form.mazeRows.value;
    const inputCols = form.mazeCols.value;

    this.route = new Stack();
    this.generateMaze(inputRows, inputCols);
    this.displayBoard();
  }

  handleSolveBtnClick(event) {
    event.preventDefault();
    this.solver();
    this.displayBoard();
  }

  generateMaze(rows, cols) {
    const randMaze = new MazeGenerator(rows, cols);
    randMaze.generate();
    this.board = randMaze.getBoard();
  }

  solver() {
    if (this.board.start) {
      const startCell =
        this.board.maze[this.board.start.row][this.board.start.col];
      const solver = new MazeSolver(this.board, startCell);
      const route = solver.solve();
      if (route) {
        this.route = route;
      }
    }
  }

  displayBoard() {
    document.querySelector(
      "#game"
    ).innerHTML = `<div id="board" style="grid-template-columns: repeat(${
      this.board.cols
    }, 1fr); width: ${this.board.cols * 20}px"></div>`;
    let cellNo = 0;
    for (let row = 0; row < this.board.rows; row++) {
      for (let col = 0; col < this.board.cols; col++) {
        cellNo++;
        document.querySelector("#board").insertAdjacentHTML(
          "beforeend",
          `
                <div class="cell" id="cell${cellNo}"></div>
                `
        );
        const cell = this.board.maze[row][col];
        const cellElement = document.querySelector(`#cell${cellNo}`);
        if (cell.north) {
          cellElement.classList.add("north");
        }
        if (cell.east) {
          cellElement.classList.add("east");
        }
        if (cell.west) {
          cellElement.classList.add("west");
        }
        if (cell.south) {
          cellElement.classList.add("south");
        }
        if (row === this.board.start.row && col === this.board.start.col) {
          cellElement.classList.add("start");
        } else if (row === this.board.goal.row && col === this.board.goal.col) {
          cellElement.classList.add("goal");
        }
        for (let i = 0; i < this.route.size(); i++) {
          const routeCell = this.route.get(i);
          if (routeCell.row === cell.row && routeCell.col === cell.col) {
            cellElement.innerHTML = `<div class="route"></div>`;
          }
        }
      }
    }
  }
}
