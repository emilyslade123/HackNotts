import { tesseract, checkWinner, resetTesseract } from './tesseract.js';

let scene, camera, renderer, controls;
const layers = [];
let currentPlayer = 'X';

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    scene.position.x -= 1;
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(7, 7, 8);

    for (let w = 0; w < 3; w++) {
        const layer = createCubeLayer(w);
        layer.position.x = (w - 1) * 5;
        layers.push(layer);
        scene.add(layer);
    }

    animate();
}
init();

function createCubeLayer(layerOffset) {
    const layer = new THREE.Group();
    const offset = 1.3;

    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 3; z++) {
                const geometry = new THREE.SphereGeometry(0.3, 32, 32);
                const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
                const point = new THREE.Mesh(geometry, material);
                material.transparent = true;
                material.opacity = 0.85;

                point.position.set(
                    (x - 1) * offset,
                    (y - 1) * offset,
                    (z - 1) * offset
                );

                point.position.x += layerOffset;

                point.userData = { layer: layerOffset, x, y, z, value: '' };
                layer.add(point);
            }
        }
    }

    return layer;
}

let isDragging = false;
let startX, startY;
let winnerFound = false;

document.addEventListener('mousedown', (event) => {
    startX = event.clientX;
    startY = event.clientY;
    isDragging = false;
});

document.addEventListener('mouseup', (event) => {
    if (!isDragging) {
        onMouseClick(event);
    }
});

document.addEventListener('mousemove', (event) => {
    const distance = Math.sqrt(Math.pow(event.clientX - startX, 2) + Math.pow(event.clientY - startY, 2));
    if (distance > 5) {
        isDragging = true;
    }
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    scene.traverse((object) => {
        if (object.isMesh && object.userData.value === '') {
            object.material.color.set(0xaaaaaa);
        }
    });

    if (intersects.length > 0) {
        const point = intersects[0].object;
        if (point.userData.value === '') {
            if (winnerFound) {
                point.material.color.set(0x555555);
            } else {
                point.material.color.set(currentPlayer === 'X' ? 0x8B0000 : 0x00008B);
            }
        }
    }
})

function onMouseClick(event) {
    if (winnerFound) return;
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const point = intersects[0].object;

        if (point.userData.value === '') {
            point.material.color.set(currentPlayer === 'X' ? 0xff0000 : 0x0000ff);
            point.userData.value = currentPlayer;

            const { layer, x, y, z } = point.userData;
            tesseract[layer][x][y][z] = currentPlayer;
            
            console.log(currentPlayer, checkWinner(tesseract, currentPlayer))
            if (checkWinner(tesseract, currentPlayer)) {
                winnerFound = true;
                updateTurnIndicator();
                return;
            }

            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateTurnIndicator();
        }
    }
}

function resetGame() {
    winnerFound = false;
    currentPlayer = 'X';
    updateTurnIndicator();
    resetTesseract();

    scene.traverse((object) => {
        if (object.isMesh && object.userData.value !== undefined) {
            object.material.color.set(0xaaaaaa);
            object.userData.value = "";
        }
    });
}

function createResetButton() {
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset Game';
    resetButton.style.display = 'block';
    resetButton.style.position = 'absolute';
    resetButton.style.top = '20px';
    resetButton.style.left = '20px';
    resetButton.style.padding = '10px';
    resetButton.style.fontSize = '16px';
    resetButton.addEventListener('click', resetGame);
    document.body.appendChild(resetButton);
}
createResetButton();

function createTurnIndicator() {
    const turnIndicator = document.createElement('div');
    turnIndicator.style.position = 'absolute';
    turnIndicator.style.top = '20px';
    turnIndicator.style.left = '50%';
    turnIndicator.style.transform = 'translateX(-50%)';
    turnIndicator.style.padding = '10px';
    turnIndicator.style.fontSize = '16px';
    turnIndicator.style.color = currentPlayer === 'X' ? 'red' : 'blue';
    turnIndicator.textContent = `Current Player: ${currentPlayer}`;
    document.body.appendChild(turnIndicator);
}
createTurnIndicator();


function updateTurnIndicator() {
    const turnIndicator = document.querySelector('div');
    if (winnerFound) {
        turnIndicator.textContent = `${currentPlayer} wins!`;
        turnIndicator.style.fontSize = '28px';
    } else {
        turnIndicator.textContent = `Current Player: ${currentPlayer}`;
        turnIndicator.style.fontSize = '16px';
    }
    turnIndicator.style.color = currentPlayer === 'X' ? 'red' : 'blue';
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function createInfoButtonAndOverlay() {
    const infoButton = document.createElement('button');
    infoButton.textContent = 'How to Play';
    infoButton.style.position = 'absolute';
    infoButton.style.top = '20px';
    infoButton.style.right = '20px';
    infoButton.style.padding = '10px';
    infoButton.style.fontSize = '16px';
    document.body.appendChild(infoButton);

    const infoOverlay = document.createElement('div');
    infoOverlay.style.overflowY = 'scroll';
    infoOverlay.style.position = 'fixed';
    infoOverlay.style.top = '0';
    infoOverlay.style.left = '0';
    infoOverlay.style.width = '100%';
    infoOverlay.style.height = '100%';
    infoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    infoOverlay.style.color = 'white';
    infoOverlay.style.display = 'none';
    infoOverlay.style.justifyContent = 'center';
    infoOverlay.style.alignItems = 'center';
    infoOverlay.style.fontSize = '20px';
    infoOverlay.style.padding = '10px';
    infoOverlay.style.boxSizing = 'border-box';
    infoOverlay.innerHTML = `
    <div>
        <h2>Welcome to Four-Dimensional Noughts and Crosses!</h2>
        <p>This version extends the classic 2D game to 4D. The three cubes together represent three-dimensional slices of a four-dimensional object called a tesseract.</p>
        <p>Take turns to place your piece (X or O) in one of the available points.</p>
        <p>Click and drag your mouse to rotate the tesseract and view the cubes from different angles. Scroll to zoom in and out. Click on a point to place your piece.</p>
        <p>You win by forming a straight line of your pieces through the tesseract. You can do this by forming:</p>
        <ul>
            <li>A horizontal line: Across any row within a cube.</li>
            <li>A vertical line: Down any column within a cube.</li>
            <li>A diagonal line: From one corner to the opposite corner within a cube.</li>
            <li>A 4D line: Connect points that cross through all three cubes. For example, put a piece at the same point in every cube. Or, put a piece in the top left in the first cube, the top middle in the second cube, and the top right in the third cube</li>
        </ul>
        <p>Click anywhere to return to the game</p>
    </div>
    `
    document.body.appendChild(infoOverlay);
    
    infoOverlay.addEventListener('click', () => {
        infoOverlay.style.display = 'none';
    });

    infoButton.addEventListener('click', () => {
        infoOverlay.style.display = 'flex';
    });

}
createInfoButtonAndOverlay();


