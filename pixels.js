//I need to comment this shit

const canvas = document.getElementById('canvas');

//Black and white seemingly have different character widths then the rest of the colored squares.
//Testing still needs to be done.
//const squareColors = [ '#8E562E', '#E81224', '#F7630C', '#FFF100', '#16C60C', '#0078D7', '#886CE4', '#F2F2F2' ];
//const squareEmojis = [ '🟫', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬜' ];

const SQUARE_COLORS_ARRAY = [ '#8E562E', '#E81224', '#F7630C', '#FFF100', '#16C60C', '#0078D7', '#886CE4' ];
const SQUARE_EMOJIS_ARRAY = [ '🟫', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪' ];
const DEFAULT_BG_COLOR = SQUARE_COLORS_ARRAY.length - 1;
var colorIndexWeAreDrawing = 0;
const MAX_COLORS = SQUARE_COLORS_ARRAY.length;
const GRID_SIZE = 11;
const CANVAS_SQUARE_SIZE = 36; //px
const CANVAS_GRID_LINE_WIDTH = 1;
const CURRENT_VERSION = 1;

//generate a 2d grid for storing emojis in
var grid = new Array(GRID_SIZE);

//when the window is loaded
function init() {
	initalizeGrid();
	updateCanvasGrid();
	drawPalette();
	drawCurrentColor();
	decodeOnFirstLoad();
}

function initalizeGrid() {
	for (var i = 0; i < GRID_SIZE; i++) {
		grid[i] = new Array(GRID_SIZE);
		for (var j = 0; j < GRID_SIZE; j++) {
			grid[i][j] = DEFAULT_BG_COLOR;
		}
	}
}

function updateCanvasGrid() {
	const ctx = canvas.getContext('2d');
	//ctx.clearRect(0, 0, canvas.width, canvas.height);

	var canvasSize = GRID_SIZE * (CANVAS_SQUARE_SIZE + CANVAS_GRID_LINE_WIDTH) + CANVAS_GRID_LINE_WIDTH;

	for (var i = 0; i < GRID_SIZE; i++) {
		for (var j = 0; j < GRID_SIZE; j++) {
			let colorIndex = grid[i][j];
			let color = SQUARE_COLORS_ARRAY[colorIndex];
			let xCord = j * (CANVAS_SQUARE_SIZE + CANVAS_GRID_LINE_WIDTH) + CANVAS_GRID_LINE_WIDTH;
			let yCord = i * (CANVAS_SQUARE_SIZE + CANVAS_GRID_LINE_WIDTH) + CANVAS_GRID_LINE_WIDTH;
			fillSquare(xCord, yCord, CANVAS_SQUARE_SIZE, CANVAS_SQUARE_SIZE, color);
		}
	}

	ctx.strokeStyle = 'black';
	ctx.lineWidth = 1;

	for (let i = 0; i < GRID_SIZE + 1; i++) {
		let xCord = i * (CANVAS_SQUARE_SIZE + CANVAS_GRID_LINE_WIDTH);
		drawLine(xCord, 0, xCord, canvasSize);
		drawLine(0, xCord, canvasSize, xCord);
	}

	updateEmojiGrid();

	function drawLine(x1, y1, x2, y2) {
		ctx.beginPath();
		ctx.moveTo(x1 + 0.5, y1 + 0.5);
		ctx.lineTo(x2 + 0.5, y2 + 0.5);
		ctx.stroke();
	}

	function fillSquare(x, y, width, height, color) {
		ctx.strokeStyle = 'transparent';
		ctx.fillStyle = color;
		ctx.fillRect(x, y, width, height);
	}
}

function updateEmojiGrid() {
	$('#code').html(getEmojiString(true));
}

function updateUrl() {
	var obj = new Object();
	obj.version = CURRENT_VERSION;
	obj.data = grid;
	var str = JSON.stringify(obj);
	str = btoa(str);
	window.location.hash = str;
	console.log('Updating hash: ' + str);
}

function decodeOnFirstLoad() {
	var hash = window.location.hash;
	hash = hash.substring(1);
	if (hash) {
		try {
			var decoded = atob(hash);
			var obj = JSON.parse(decoded);

			if (obj.version == 1) {
				var data = obj.data;
				if (Array.isArray(data)) {
					if (data.length == GRID_SIZE) {
						for (var i = 0; i < GRID_SIZE; i++) {
							var innerArray = data[i];
							if (Array.isArray(innerArray)) {
								if (innerArray.length == GRID_SIZE) {
									for (var j = 0; j < GRID_SIZE; j++) {
										var rawData = data[i][j];
										if (Number.isInteger(rawData)) {
											if (!(rawData >= 0 && rawData < MAX_COLORS)) {
												console.error(
													'Failed to decode hash. Data object at ' +
														i +
														'-' +
														j +
														" isn't between 0 and " +
														MAX_COLORS +
														'. It is ' +
														rawData +
														'.'
												);
												return;
											}
										} else {
											console.error(
												'Failed to decode hash. Data object at ' +
													i +
													'-' +
													j +
													" isn't a integer"
											);
											return;
										}
									}
								} else {
									console.error(
										'Failed to decode hash. Data field inner array ' +
											i +
											" isn't the correct size!"
									);
									return;
								}
							} else {
								console.error(
									'Failed to decode hash. Data field inner array ' + i + " isn't an array!"
								);
								return;
							}
						}
					} else {
						console.error("Failed to decode hash. Data array isn't the correct size!");
						return;
					}
				} else {
					console.error("Failed to decode hash. Data field isn't an array!");
					return;
				}

				//the data is right for version 1
				grid = data;
				updateCanvasGrid();
			} else {
				console.error('Failed to decode hash. Unknown version!');
				return;
			}
		} catch (err) {
			console.error('Please stop messing with the hash string!', err);
			return;
		}
	}
}

function getEmojiString(newlines = false) {
	var str = '';
	for (var i = 0; i < grid[0].length; i++) {
		for (var j = 0; j < grid[i].length; j++) {
			var index = grid[i][j];
			str += SQUARE_EMOJIS_ARRAY[index];
		}
		if (newlines) {
			str += '\n';
		}
	}
	return str;
}

//draw the currently slected color
function drawCurrentColor() {
	$('#selected').html(' ');
	let div = '<div id="colorSelected"></div>';
	$('#selected').append(div);
	$('#colorSelected').css('background', SQUARE_COLORS_ARRAY[colorIndexWeAreDrawing]);
}

//draw the avaiable colors we can use
function drawPalette() {
	$('#palette').html(' ');

	for (let i = 0; i < SQUARE_COLORS_ARRAY.length; i++) {
		let div = '<div id="color' + i + '"></div>';
		$('#palette').append(div);
		$('#color' + i).css('background', SQUARE_COLORS_ARRAY[i]);
	}

	//add the click events
	$('#palette div').each(function(div) {
		$(`#color${div}`).click(function() {
			if (SQUARE_COLORS_ARRAY[div]) {
				let color = SQUARE_COLORS_ARRAY[div];
				colorIndexWeAreDrawing = div;
				drawCurrentColor();
			}
		});
	});
}

//update the url on mouse up reguardless if they are off of the canvas or not
document.documentElement.addEventListener('mouseup', function(e) {
	updateUrl();
});

//when we click the canvas, try drawing a square
canvas.onclick = function(event) {
	mouseDrawOnCanvas(event);
};

//when we move the mouse, try drawing a square
$('canvas').on('mousemove', function(event) {
	event.preventDefault();
	if (event.buttons == 1 || event.buttons == 3) {
		mouseDrawOnCanvas(event);
	}
});

function gridCoordsFromCanvas(canvasX) {
	return Math.floor((canvasX - CANVAS_GRID_LINE_WIDTH) / (CANVAS_SQUARE_SIZE + CANVAS_GRID_LINE_WIDTH));
}

function mouseDrawOnCanvas(event) {
	let margin = canvas.getBoundingClientRect(); //This will calculate the margins for the canvas

	let x = event.clientX - margin.left;
	let y = event.clientY - margin.top;

	let i = gridCoordsFromCanvas(y);
	let j = gridCoordsFromCanvas(x);

	if (i >= 0 && i < GRID_SIZE && j >= 0 && j < GRID_SIZE) {
		grid[i][j] = colorIndexWeAreDrawing;
		updateCanvasGrid();
	}
}

//when the single line string button is clicked
$('#copySingleString').click(function() {
	var $temp = $('<textarea>');
	$('body').append($temp);
	$temp.val(getEmojiString()).select();
	document.execCommand('copy');
	$temp.remove();
});

//when the copy multi line string button is clicked
$('#copyMultiLineString').click(function() {
	var $temp = $('<textarea>');
	$('body').append($temp);
	$temp.val(getEmojiString(true)).select();
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
	str = str.replace('%text%', getEmojiString());
	$temp.val(str).select();
	document.execCommand('copy');
	$temp.remove();
});

//when the window is loaded
window.addEventListener('load', init, false);
