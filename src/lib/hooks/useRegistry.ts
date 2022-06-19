import {useCallback, useState} from "react";
import RegistryActions from "../utils/RegistryActions";

const copyGrid = (grid:Grid): Grid => {
    let newGrid: Grid = [];
    for (let y = 0; y < grid.length; y++) {
        newGrid[y] = [];
        for (let x = 0; x < grid[y].length; x++) {
            newGrid[y][x] = grid[y][x];
        }
    }
    return newGrid;
};

const useRegistry = (initialGrid:Grid, applier:(grid:Grid)=>void): PixelArtRegistry => {
    const [states, setStates] = useState<RegistryState[]>([{grid:copyGrid(initialGrid), actionDescription:RegistryActions.init}]);
    const [currentState, setCurrentState] = useState<number>(0);

    const applyState = useCallback((index:number) => {
        applier(copyGrid(states[index].grid));
    }, [states, applier]);

    const registerState = useCallback((grid:Grid, actionDescription:string, index?:number) => {
        if (index === undefined) {
            index = states.length;
        }
        setStates((v) => {
            v[index!] = {grid: copyGrid(grid), actionDescription}
            return v;
        });
        setCurrentState(index);
    }, [states]);

    const canUndo = useCallback(() => {
        return currentState - 1 >= 0;
    }, [currentState]);

    const canRedo = useCallback(() => {
        return currentState + 1 < states.length;
    }, [currentState, states]);

    const undo = useCallback(() => {
        if (canUndo()) {
            applyState(currentState - 1)
            setCurrentState(v => v - 1);
        }
    }, [canUndo, applyState, currentState]);

    const redo = useCallback(() => {
        if (canRedo()) {
            applyState(currentState + 1);
            setCurrentState(v => v + 1);
        }
    }, [canRedo, applyState, currentState]);

    const resetStatesOnCurrentOne = useCallback(() => {
        setStates((v) => {
            return [v.at(currentState)!];
        });
    }, [currentState]);

    return {
        applyState,
        registerState,
        canUndo,
        canRedo,
        undo,
        redo,
        resetStatesOnCurrentOne
    };
};

export default useRegistry;