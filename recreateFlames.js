/**
 * Draw an SVG version of the flames for validating
 * the Excel sheet
 **/

// returns a window with a document and an svg root node 
const window   = require('svgdom')
const SVG      = require('svg.js')(window)
const document = window.document
const FLAMES   = require('./parsers/getFlameValuesFromExcel.js');
 
// create svg.js instance 
const draw = SVG(document.documentElement)


function SVGDrawManager() {
	// Get size
	var height = 1658, width = 2160;
	var x_horz = 1275, y_horz = 225, x_vert = 250, y_vert = 960;
	var offset = 200;

	// Black background
	draw.rect(width*2, height*2).fill('black');

	this.drawFlamePattern = function(flames)
	{
		for (var side in flames) {
			if (flames.hasOwnProperty(side)) {
				var num_flames = flames[side].length;
				flames[side].forEach(function(flame, index) {
					if (flame.length < 5) return;

					if (side == 'top') {
						pos = {"x" : x_horz * index / num_flames + offset, "y" : 100};
					} else if (side == 'bottom') { 
						pos = {"x" : x_horz * (num_flames - index) / num_flames + offset, "y" : y_vert+1.5*offset};
					} else if (side == 'right') {
						pos = {"x" : x_horz+1.5*offset, "y" : y_vert * index / num_flames + offset};
					} else if (side == 'left') {
						pos = {"x" : 100, "y" : y_vert * (num_flames - index) / num_flames + offset};
					}

					drawFlame(side.charAt(0), pos, flame);
				});
			}
		}
	}

	function drawFlame(side, pos, f)
	{
		var in_or_out_border = f[0], length = f[1], out_color = f[2], in_color = f[3], fill = f[4];

		var l, w = 30;
		if (length == 'l') {
			l = 60;
		} else {
			l = 30;
		}

		out_color = (out_color == ('y') ? 'yellow' : 'red');
		in_color  = (in_color  == ('g') ? 'green'  : 'purple');

		if (side == 't' || side == 'b') {
			if (side == 't') {
				pos.y += (in_or_out_border == 'i' ? 75 : -75);
			} else {
				pos.y += (in_or_out_border == 'o' ? 75 : -75);
			}

			draw.ellipse(w, l).fill(out_color).move(pos.x, pos.y);
			if (fill == 'f'){
				draw.circle(w/2).fill(in_color).move(pos.x+w/3, pos.y+w/4);
			} else {
				draw.ellipse(w/6, w/2).fill(in_color).move(pos.x+w/3, pos.y+w/4);
			}
		} else {
			if (side == 'l') {
				pos.x += (in_or_out_border == 'i' ? 75 : -75);
			} else {
				pos.x += (in_or_out_border == 'o' ? 75 : -75);
			}

			draw.ellipse(l, w).fill(out_color).move(pos.x, pos.y);
			if (fill == 'f') {
				draw.circle(w/2).fill(in_color).move(pos.x+w/4, pos.y+w/4);
			} else {
				draw.ellipse(w/2, w/6).fill(in_color).move(pos.x+w/4, pos.y+w/4);
			}
		}
	}

	this.output = function() {
		console.log(draw.svg());
	}

	return this;
}

var flames = FLAMES.getFlames(true);

/**
 * Draw the flames
 **/
//var svg = new SVGDrawManager();
//svg.drawFlamePattern(flames);
//svg.output();

/**
 * Get some data on the flames
 **/
/*
var n_in = 0, n_out = 0, n_red = 0, n_yellow = 0, n_fat = 0, n_thin = 0, n_green = 0, n_purple = 0, n_long = 0, n_short = 0;
for (var side in flames) {
	if (flames.hasOwnProperty(side)) {
		flames[side].forEach(function(f, index) {
			if (f.length < 5) return;
			var in_or_out_border = f[0], length = f[1], out_color = f[2], in_color = f[3], fill = f[4];
			n_long += (length == 'l');
			n_short += (length == 's');
			n_red += (out_color == 'r');
			n_yellow += (out_color == 'y');
			n_green += (in_color == 'g');
			n_purple += (in_color == 'p');
			n_fat += (fill == 'f');
			n_thin += (fill == 't');
			n_in += (in_or_out_border == 'i');
			n_out += (in_or_out_border == 'o');
		});
	}
}

console.log('out: ' + n_out + '; in: ' + n_in);
console.log('fat: ' + n_fat + '; thin: ' + n_thin);
console.log('long: ' + n_long + '; short: ' + n_short);
console.log('yellow: ' + n_yellow + '; red: ' + n_red);
console.log('green: ' + n_green + '; purple: ' + n_purple);
*/


var n_in = 0, n_red = 0, n_fat = 0, n_green = 0, n_long = 0;
var bits = Array(32);
for (var side in flames) {
	if (flames.hasOwnProperty(side)) {
		flames[side].forEach(function(f, index) {
			if (f.length < 5) return;
			var in_or_out_border = f[0], length = f[1], out_color = f[2], in_color = f[3], fill = f[4];
			n_long = (length == 'l') ? 1 : 0;
			n_red = (out_color == 'r') ? 1 : 0;
			n_green = (in_color == 'g') ? 1 : 0;
			n_fat = (fill == 'f') ? 1 : 0;
			n_in = (in_or_out_border == 'i') ? 1 : 0;
			key = (n_long << 3) + (n_red << 2) + (n_green << 1) + (n_fat << 0);
			
			if (!bits[key])
				bits[key] = 0;
			bits[key] += 1;
		});
	}
}

for (var i = 0; i < 32; i++)
{
	console.log(i + ' : ' + bits[i]);
}
