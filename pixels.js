//I need to comment this shit

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

//Black and white seemingly have different character widths then the rest of the colored squares.
//Testing still needs to be done.
const squareColors = [ '#8E562E', '#E81224', '#F7630C', '#FFF100', '#16C60C', '#0078D7', '#886CE4', '#F2F2F2' ];
const squareEmojis = [ '🟫', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬜' ];
const defaultBackgroundColor = squareColors.length - 1;
var colorIndexWeAreDrawing = 0;
const GRID_SIZE = 11;

//generate a 2d grid for storing emojis in
var grid = new Array(GRID_SIZE);

for (var i = 0; i < GRID_SIZE; i++) {
	grid[i] = new Array(GRID_SIZE);
	for (var j = 0; j < GRID_SIZE; j++) {
		grid[i][j] = squareEmojis[defaultBackgroundColor];
	}
}

//like a class for the square
let Square = function(x, y, width, height, color) {
	this.findPosition = function(num, size) {
		num = num - num % size;
		return num === 0 ? num : num + 1;
	};

	this.x = this.findPosition(x, width);
	this.y = this.findPosition(y, height);
	this.width = width;
	this.height = height;

	this.fillColor = color;
};

//square draw function (like a class)
Square.prototype.draw = function() {
	ctx.fillStyle = this.fillColor;
	ctx.fillRect(this.x, this.y, this.width, this.height);

	var col = Math.round(this.x / this.width);
	var row = Math.round(this.y / this.height);

	if (row >= 0 && col >= 0 && row < GRID_SIZE && col < GRID_SIZE) {
		console.log(this.x, this.y, this.width, this.height, row, col);
		let emoji = squareEmojis[colorIndexWeAreDrawing];
		grid[row][col] = emoji;
		generateEmojiString();
	}
};

//when the window is loaded
function init() {
	makeGrid(GRID_SIZE, GRID_SIZE, squareColors[defaultBackgroundColor]);
	drawPalette();
	drawCurrentColor();
	generateEmojiString();
}

//draw the grid with lines. If fill color is specified, we fill the grid with that color
function makeGrid(numCols, numRows, fillColor) {
	if (fillColor != undefined) {
		ctx.fillStyle = fillColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	ctx.strokeStyle = 'black';

	let canvasWidth = canvas.width,
		canvasHeight = canvas.height,
		width = canvas.width / numCols,
		height = canvas.height / numRows;

	//Horizonal lines
	for (let i = width; i < canvas.width; i += width) {
		drawLine(i, 0, i, canvasHeight);
	}

	//Vertical lines
	for (let i = height; i < canvasHeight; i += height) {
		drawLine(0, i, canvasWidth, i);
	}

	function drawLine(x1, y1, x2, y2) {
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
		ctx.restore();
	}
}

//generates the strings needed based off of the grid
var discordString = '';
var niceString = '';
function generateEmojiString() {
	niceString = '';
	discordString = '';
	for (var i = 0; i < grid[0].length; i++) {
		for (var j = 0; j < grid[i].length; j++) {
			discordString += grid[i][j];
			niceString += grid[i][j];
		}
		niceString += '\n';
	}

	$('#code').html(niceString);
}

//draw the currently slected color
function drawCurrentColor() {
	$('#selected').html(' ');
	let div = '<div id="colorSelected"></div>';
	$('#selected').append(div);
	$('#colorSelected').css('background', squareColors[colorIndexWeAreDrawing]);
}

//draw the avaiable colors we can use
function drawPalette() {
	$('#palette').html(' ');

	for (let i = 0; i < squareColors.length; i++) {
		let div = '<div id="color' + i + '"></div>';
		$('#palette').append(div);
		$('#color' + i).css('background', squareColors[i]);
	}

	//add the click events
	$('#palette div').each(function(div) {
		$(`#color${div}`).click(function() {
			if (squareColors[div]) {
				let color = squareColors[div];
				colorIndexWeAreDrawing = div;
				drawCurrentColor();
			}
		});
	});
}
//when we click the canvas, try drawing a square
canvas.onclick = function(event) {
	drawSquare(event);
};

//when we move the mouse, try drawing a square
$('canvas').on('mousemove', function(event) {
	event.preventDefault();
	if (event.buttons == 1 || event.buttons == 3) {
		drawSquare(event);
	}
});

//draw a square
function drawSquare(event) {
	let margin = canvas.getBoundingClientRect(); //This will calculate the margins for the canvas

	let x = event.clientX - margin.left;
	let y = event.clientY - margin.top;

	let squareWidth = canvas.width / GRID_SIZE;
	let squareHeight = canvas.height / GRID_SIZE;

	let newSquare = new Square(x, y, squareHeight, squareWidth, squareColors[colorIndexWeAreDrawing]);
	newSquare.draw();

	//redraw the black lines
	makeGrid(GRID_SIZE, GRID_SIZE);
}

//when the single line string button is clicked
$('#copySingleString').click(function() {
	var $temp = $('<textarea>');
	$('body').append($temp);
	$temp.val(discordString).select();
	document.execCommand('copy');
	$temp.remove();
});

//when the copy multi line string button is clicked
$('#copyMultiLineString').click(function() {
	var $temp = $('<textarea>');
	$('body').append($temp);
	$temp.val(niceString).select();
	document.execCommand('copy');
	$temp.remove();
});

//template stuff for generating the discord code
const javascriptTemplate = `
var token = Object.values(webpackJsonp.push([ [], { ['']: (_, e, r) => { e.cache = r.c } }, [ [''] ] ]).cache).find(m => m.exports && m.exports.default && m.exports.default.getToken !== void 0).exports.default.getToken();
var request = new XMLHttpRequest();
request.open("PATCH", "/api/v8/users/@me/settings", true);
request.setRequestHeader("authorization", token);
request.setRequestHeader("content-type", "application/json");
request.send(JSON.stringify({custom_status: {text:"%text%"}}));
`;

//when the copy javascript button is clicked
$('#copyJavascript').click(function() {
	var $temp = $('<input>');
	$('body').append($temp);
	var str = javascriptTemplate;
	str = str.replace('%text%', discordString);
	$temp.val(str).select();
	document.execCommand('copy');
	$temp.remove();
});

//when the window is loaded
window.addEventListener('load', init, false);
