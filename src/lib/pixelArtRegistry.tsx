class PixelArtRegistry {
  private states: RegistryState[] = [];
  private currentState: number = 0;
  private applier: (grid: Grid) => void;
  public ACTIONS = {
    drawnPixel: "drawn pixel",
    fillGrid: "filled grid",
    fillLine: "filled line",
    fillCollumn: "filled column",
    reset: "reset grid",
    init: "initial grid",
    multipleDrawnPixels: "multiple drawn pixels",
  };

  constructor(initialGrid: Grid, applier: (grid: Grid) => void) {
    this.states[0] = { grid: this.copy(initialGrid), actionDescription: this.ACTIONS.init };
    this.applier = applier;
  }

  private applyState(index: number) {
    this.applier(this.states[index].grid);
  }

  public registerState(grid: Grid, actionDescription: string, index?: number) {
    if (index === undefined) {
      index = this.states.length;
    }
    this.states[index] = { grid: this.copy(grid), actionDescription };
    this.currentState = index;
  }

  /**
   * Creates a deep copy of a grid. This action is necessary because a shallow copy was sent,
   * so every change was being applied on all the states.
   * @param grid The grid.
   * @returns {number[][]} The copied grid.
   */
  private copy(grid: Grid): Grid {
    let newGrid: Grid = [[]];
    for (let y = 0; y < grid.length; y++) {
      newGrid[y] = [];
      for (let x = 0; x < grid[y].length; x++) {
        newGrid[y][x] = grid[y][x];
      }
    }
    return newGrid;
  }

  public canUndo() {
    return this.currentState - 1 >= 0;
  }

  public canRedo() {
    return this.currentState + 1 < this.states.length;
  }

  public undo() {
    if (this.canUndo()) {
      this.applyState(this.currentState - 1);
      this.currentState--;
    }
  }

  public redo() {
    if (this.canRedo()) {
      this.applyState(this.currentState + 1);
      this.currentState++;
    }
  }

  public resetStatesOnCurrentOne() {
    this.states = [this.states.at(this.currentState)!];
  }
}

export default PixelArtRegistry;
