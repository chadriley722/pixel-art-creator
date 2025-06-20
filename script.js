// DOM Elements
const pixelGrid = document.getElementById('pixelGrid');
const colorPicker = document.getElementById('colorPicker');
const colorValue = document.getElementById('colorValue');
const colorPalette = document.getElementById('colorPalette');

// State
let currentColor = '#000000';
let gridWidth = 16;
let gridHeight = 16;
let isMouseDown = false;

// Default color palette
const defaultColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', 
    '#0000ff', '#ffff00', '#00ffff', '#ff00ff',
    '#808080', '#800000', '#808000', '#008000',
    '#800080', '#008080', '#000080'
];

// Initialize the app
function init() {
    // Set up event listeners
    colorPicker.addEventListener('input', updateCurrentColor);
    document.addEventListener('mousedown', () => isMouseDown = true);
    document.addEventListener('mouseup', () => isMouseDown = false);
    
    // Initialize color palette
    defaultColors.forEach(color => addColorToPalette(color));
    
    // Set default grid size
    setPresetGridSize(16);
}

// Set the grid size with width and height
function setGridSize(width, height) {
    gridWidth = width;
    gridHeight = height;
    renderGrid();
}

// Set preset grid size (square)
function setPresetGridSize(size) {
    gridWidth = size;
    gridHeight = size;
    document.getElementById('customWidth').value = size;
    document.getElementById('customHeight').value = size;
    renderGrid();
}

// Set custom grid size from inputs
function setCustomGridSize() {
    const width = parseInt(document.getElementById('customWidth').value);
    const height = parseInt(document.getElementById('customHeight').value);
    
    // Validate inputs
    if (isNaN(width) || isNaN(height) || width < 4 || height < 4 || width > 100 || height > 100) {
        alert('Please enter valid dimensions between 4 and 100');
        return;
    }
    
    setGridSize(width, height);
}

// Render the pixel grid
function renderGrid() {
    pixelGrid.innerHTML = '';
    
    // Create grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid';
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;
    gridContainer.style.gap = '0';
    
    // Create pixels
    for (let i = 0; i < gridWidth * gridHeight; i++) {
        const pixel = document.createElement('div');
        pixel.className = 'pixel bg-white';
        pixel.dataset.index = i;
        
        // Add event listeners for click and drag
        pixel.addEventListener('mousedown', handlePixelClick);
        pixel.addEventListener('mouseover', handlePixelHover);
        
        // Prevent drag selection
        pixel.addEventListener('dragstart', (e) => e.preventDefault());
        
        gridContainer.appendChild(pixel);
    }
    
    pixelGrid.appendChild(gridContainer);
}

// Handle pixel click
function handlePixelClick(e) {
    if (e.button !== 0) return; // Only left click
    
    const pixel = e.target;
    pixel.style.backgroundColor = currentColor;
    
    // Add click animation
    pixel.classList.add('pixel-click');
    setTimeout(() => pixel.classList.remove('pixel-click'), 200);
}

// Handle pixel hover (for click and drag)
function handlePixelHover(e) {
    if (isMouseDown) {
        const pixel = e.target;
        pixel.style.backgroundColor = currentColor;
    }
}

// Update the current color
function updateCurrentColor() {
    currentColor = colorPicker.value;
    colorValue.textContent = currentColor;
    
    // Update active state in palette
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.classList.toggle('active', swatch.style.backgroundColor === currentColor);
    });
}

// Add a color to the palette
function addToPalette() {
    const color = colorPicker.value;
    if (!defaultColors.includes(color)) {
        addColorToPalette(color);
    }
}

// Add a color to the palette UI
function addColorToPalette(color) {
    if (document.querySelector(`.color-swatch[data-color="${color}"]`)) return;
    
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;
    swatch.title = color;
    
    swatch.addEventListener('click', () => {
        colorPicker.value = color;
        updateCurrentColor();
    });
    
    colorPalette.insertBefore(swatch, colorPalette.firstChild);
}

// Export the pixel art as PNG
function exportImage() {
    const gridContainer = pixelGrid.querySelector('.grid');
    if (!gridContainer) return;
    
    // Get export options
    const transparentBg = document.getElementById('transparentBg').checked;
    const showGridLines = document.getElementById('showGridLines').checked;
    const showRowNumbers = document.getElementById('showRowNumbers').checked;
    const showColumnNumbers = document.getElementById('showColumnNumbers').checked;
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Set canvas size (20px per pixel)
    const pixelSize = 20;
    const padding = showGridLines ? 1 : 0;
    const numberPadding = 20; // Space for row/column numbers
    
    // Calculate canvas size with optional number padding
    let canvasWidth = gridWidth * (pixelSize + padding) - padding;
    let canvasHeight = gridHeight * (pixelSize + padding) - padding;
    
    // Add padding for row/column numbers
    if (showRowNumbers) canvasWidth += numberPadding;
    if (showColumnNumbers) canvasHeight += numberPadding;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Clear the canvas with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Only fill with white if transparent background is not selected
    if (!transparentBg) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Set up text styles for row/column numbers
    if (showRowNumbers || showColumnNumbers) {
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#666';
    }
    
    // Track if we have any colored pixels
    let hasColoredPixels = false;
    
    // First pass: check if we have any colored pixels
    const pixels = gridContainer.querySelectorAll('.pixel');
    for (const pixel of pixels) {
        const bgColor = window.getComputedStyle(pixel).backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'white' && bgColor !== 'rgb(255, 255, 255)') {
            hasColoredPixels = true;
            break;
        }
    }
    
    // If no colored pixels and transparent background, return empty transparent image
    if (transparentBg && !hasColoredPixels) {
        // Create download link with empty transparent image
        const link = document.createElement('a');
        link.download = `pixel-art-${new Date().getTime()}.png`;
        link.href = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        link.click();
        return;
    }
    
    // Draw each pixel
    pixels.forEach((pixel, index) => {
        const row = Math.floor(index / gridWidth);
        const col = index % gridWidth;
        
        // Get computed style to handle default white background
        let bgColor = window.getComputedStyle(pixel).backgroundColor;
        
        // Skip if transparent background and pixel is white/transparent
        if (transparentBg && (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'white' || bgColor === 'rgb(255, 255, 255)')) {
            return;
        }
        
        // Only draw if we have a valid color
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
            ctx.fillStyle = bgColor;
            let x = col * (pixelSize + padding);
            let y = row * (pixelSize + padding);
            
            // Adjust position if showing row/column numbers
            if (showRowNumbers) x += numberPadding;
            if (showColumnNumbers && row === 0) y += numberPadding;
            
            ctx.fillRect(x, y, pixelSize, pixelSize);
        }
    });
    
    // Add grid lines if enabled
    if (showGridLines && !transparentBg) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= gridWidth; x++) {
            let xPos = x * (pixelSize + padding);
            if (showRowNumbers) xPos += numberPadding;
            
            ctx.beginPath();
            ctx.moveTo(xPos - 0.5, showColumnNumbers ? numberPadding : 0);
            ctx.lineTo(xPos - 0.5, canvas.height);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= gridHeight; y++) {
            let yPos = y * (pixelSize + padding);
            if (showColumnNumbers) yPos += numberPadding;
            
            ctx.beginPath();
            ctx.moveTo(showRowNumbers ? numberPadding : 0, yPos - 0.5);
            ctx.lineTo(canvas.width, yPos - 0.5);
            ctx.stroke();
        }
    }
    
    // Add row numbers if enabled
    if (showRowNumbers) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#666';
        
        for (let y = 0; y < gridHeight; y++) {
            const yPos = y * (pixelSize + padding) + (pixelSize / 2);
            const adjustedY = showColumnNumbers ? yPos + numberPadding : yPos;
            ctx.fillText(
                (y + 1).toString(), 
                numberPadding / 2, 
                adjustedY
            );
        }
    }
    
    // Add column numbers if enabled
    if (showColumnNumbers) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#666';
        
        for (let x = 0; x < gridWidth; x++) {
            const xPos = x * (pixelSize + padding) + (pixelSize / 2);
            const adjustedX = showRowNumbers ? xPos + numberPadding : xPos;
            ctx.fillText(
                (x + 1).toString(), 
                adjustedX, 
                numberPadding / 2 + 3 // Slight vertical adjustment for better centering
            );
        }
    }
    
    // Create download link
    const link = document.createElement('a');
    link.download = `pixel-art-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
