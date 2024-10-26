function initialiseTesseract() {
    const tesseract = [];
    for (let w = 0; w < 3; w++) {
        tesseract[w] = [];
        for (let x = 0; x < 3; x++) {
            tesseract[w][x] = [];
            for (let y = 0; y < 3; y++) {
                tesseract[w][x][y] = Array(3).fill("");
            }
        }
    }
    return tesseract;
}

export const tesseract = initialiseTesseract();

export function checkWinner(tesseract, player) {
    const directions = generateDirections();
    
    for (let x = 0; x < tesseract.length; x++) {
        for (let y = 0; y < tesseract[x].length; y++) {
            for (let z = 0; z < tesseract[x][y].length; z++) {
                for (let layer = 0; layer < tesseract[x][y][z].length; layer++) {
                    if (tesseract[x][y][z][layer] === player) {
                        for (let direction of directions) {
                            if (checkDirection(tesseract, player, x, y, z, layer, direction)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }

    return false;
}

function generateDirections() {
    const directions = [];

    for (let i = 0; i < 4; i++) {
        const axialDirection = [0, 0, 0, 0];
        axialDirection[i] = 1;
        directions.push(axialDirection);
        
        const negativeDirection = [0, 0, 0, 0];
        negativeDirection[i] = -1;
        directions.push(negativeDirection);
    }

    const generateDiagonals = (currentDirection, depth) => {
        if (depth === 4) {
            if (currentDirection.filter(v => v !== 0).length > 1) {
                directions.push(currentDirection.slice());
            }
            return;
        }

        for (let value of [-1, 0, 1]) {
            currentDirection[depth] = value;
            generateDiagonals(currentDirection, depth + 1);
        }
    };

    generateDiagonals([0, 0, 0, 0], 0);

    return directions.filter(dir => {
        return dir.some(v => v !== 0);
    });
}

function checkDirection(tesseract, player, x, y, z, layer, direction) {
    let count = 1;

    for (let i = 1; i < 3; i++) {
        const newX = x + i * direction[0];
        const newY = y + i * direction[1];
        const newZ = z + i * direction[2];
        const newLayer = layer + i * direction[3];

        if (
            newX >= 0 && newX < tesseract.length &&
            newY >= 0 && newY < tesseract[newX].length &&
            newZ >= 0 && newZ < tesseract[newX][newY].length &&
            newLayer >= 0 && newLayer < tesseract[newX][newY][newZ].length &&
            tesseract[newX][newY][newZ][newLayer] === player
        ) {
            count++;
        } else {
            break;
        }
    }

    for (let i = 1; i < 3; i++) {
        const newX = x - i * direction[0];
        const newY = y - i * direction[1];
        const newZ = z - i * direction[2];
        const newLayer = layer - i * direction[3];

        if (
            newX >= 0 && newX < tesseract.length &&
            newY >= 0 && newY < tesseract[newX].length &&
            newZ >= 0 && newZ < tesseract[newX][newY].length &&
            newLayer >= 0 && newLayer < tesseract[newX][newY][newZ].length &&
            tesseract[newX][newY][newZ][newLayer] === player
        ) {
            count++;
        } else {
            break;
        }
    }

    return count >= 3;
}

export function resetTesseract() {
    for (let w = 0; w < 3; w++) {
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 0; z < 3; z++) {
                    tesseract[w][x][y][z] = "";
                }
            }
        }
    }
}
