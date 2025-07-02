import { ColorID } from "@root/config";
import { FilledCell, Quintro } from "@root/types";

export const findQuintros = (cells: FilledCell[], width: number, height: number): Quintro[] => {
    if (cells.length < 5) {
        return [];
    }
    const lastCell = cells[cells.length - 1];

    const { position, color } = lastCell;

    const adjacentCellCoords = [];

    const cellMap = cells.reduce(
        (map, cell) => {
            map[JSON.stringify(cell.position)] = cell.color!;
            return map;
        },
        {} as {[key: string]: ColorID}
    );

    const quintros: Quintro[] = [];
    const [cellX, cellY] = position;

    // Check horizontal
    {
        const cells: FilledCell[] = [];
        cells.push(lastCell);

        for (let x = cellX - 1; x >= 0; x--) {
            if (cellMap[JSON.stringify([x, cellY])] === color) {
                cells.unshift({
                    position: [x, cellY],
                    color,
                });
            }
            else {
                break;
            }
        }

        for (let x = cellX + 1; x < width; x++) {
            if (cellMap[JSON.stringify([x, cellY])] === color) {
                cells.push({
                    position: [x, cellY],
                    color,
                });
            }
            else {
                break;
            }
        }
        if (cells.length >= 5) {
            quintros.push({
                cells,
                color,
                numberOfEmptyCells: 0,
            });
        }
    }

    // Check vertical
    {
        const cells: FilledCell[] = [];
        cells.push(lastCell);

        for (let y = cellY - 1; y >= 0; y--) {
            if (cellMap[JSON.stringify([cellX, y])] === color) {
                cells.unshift({
                    position: [cellX, y],
                    color,
                });
            }
            else {
                break;
            }
        }

        for (let y = cellY + 1; y < height; y++) {
            if (cellMap[JSON.stringify([cellX, y])] === color) {
                cells.push({
                    position: [cellX, y],
                    color,
                });
            }
            else {
                break;
            }
        }
        if (cells.length >= 5) {
            quintros.push({
                cells,
                color,
                numberOfEmptyCells: 0,
            });
        }
    }

    // Check diagonal (top-left --> bottom-right)
    {
        const cells: FilledCell[] = [];
        cells.push(lastCell);

        for (let x = cellX - 1, y = cellY - 1; x >= 0 && y >=0; x--, y--) {
            if (cellMap[JSON.stringify([x, y])] === color) {
                cells.unshift({
                    position: [x, y],
                    color,
                });
            }
            else {
                break;
            }
        }
        
        for (let x = cellX + 1, y = cellY + 1; x < width && y < height; x++, y++) {
            if (cellMap[JSON.stringify([x, y])] === color) {
                cells.unshift({
                    position: [x, y],
                    color,
                });
            }
            else {
                break;
            }
        }
        
        if (cells.length >= 5) {
            quintros.push({
                cells,
                color,
                numberOfEmptyCells: 0,
            });
        }
    }
    
    // Check diagonal (top-right --> bottom-left)
    {
        const cells: FilledCell[] = [];
        cells.push(lastCell);

        for (let x = cellX + 1, y = cellY - 1; x < width && y >=0; x++, y--) {
            if (cellMap[JSON.stringify([x, y])] === color) {
                cells.unshift({
                    position: [x, y],
                    color,
                });
            }
            else {
                break;
            }
        }
        
        for (let x = cellX - 1, y = cellY + 1; x >= 0 && y < height; x--, y++) {
            if (cellMap[JSON.stringify([x, y])] === color) {
                cells.unshift({
                    position: [x, y],
                    color,
                });
            }
            else {
                break;
            }
        }
        
        if (cells.length >= 5) {
            quintros.push({
                cells,
                color,
                numberOfEmptyCells: 0,
            });
        }
    }

    return quintros;
};
