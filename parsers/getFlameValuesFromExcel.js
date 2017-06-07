/**
 * Pull the values from the excel sheet, hold in an iterable
 **/

const XLSX = require('xlsx');

// read the file
var workbook  = XLSX.readFile(__dirname + '/../data/flames.xlsx');
var worksheet = workbook.Sheets['Sheet1'];

// parse to json
var jsws = XLSX.utils.sheet_to_json(worksheet);

// Figure out how many variations of the same we'll have to check...
// 20 different alternatives -> 20! = way too large of a number to ever check
// 9 switched positions, 11 switched lengths or widths -> 7 switched widths, 4 switched lengths
// 9! is still 362,880, so still ridiculously high, especially considering the other
// variations of how the flames could be ordered and whatnot

function collectFlames(bIncludeFlameLeaf, bSingle)
{
	var flames_array = {'top' : [], 'right' : [], 'bottom' : [], 'left' : []};
	var flames_single_array = [];
	
	for (var i = 0; i < jsws.length; i++)
	{
		if (jsws[i].border == 'STOP') continue;

		if (jsws[i].border == 'FLAME' || jsws[i].border == 'LEAF')
		{
			if (!!bIncludeFlameLeaf)
			{
				flames_array[jsws[i].side].push([jsws[i].border]);
			}

			continue;
		}

		flames_array[jsws[i].side].push([jsws[i].border, jsws[i].len.charAt(0), 
			jsws[i].outer_color, jsws[i].inner_color, jsws[i].width.charAt(0)]);

		flames_single_array.push([jsws[i].border, jsws[i].len.charAt(0), 
			jsws[i].outer_color, jsws[i].inner_color, jsws[i].width.charAt(0)]);
	}

	if (!!bSingle)
	{
		return flames_single_array;
	}

	return flames_array;
}

var flames_array_with_extra = collectFlames(true, false);
var flames_array = collectFlames(false, false);
var flames_single_array = collectFlames(false, true);

function getFlames(bIncludeFlameLeaf)
{
	if (!!bIncludeFlameLeaf) {
		return flames_array_with_extra;
	}

	return flames_array;
}

function getFlamesHex(start_pos, order, bits)
{
	var fsa = flames_single_array;
	var hexes = [];
	var b_border, b_len, b_out, b_in, b_width;
	var o = order ? order : [3,2,1,0];
	var b = bits  ? bits : ['i', 'l', 'y', 'g', 'f'];

	var count = 0;
	var end_limit = fsa.length;

	var i = start_pos ? start_pos : 0;
	while (count < end_limit)
	{
		b_border = (fsa[i][0] == b[0]) ? 1 : 0;
		b_len    = (fsa[i][1] == b[1]) ? 1 : 0;
		b_out    = (fsa[i][2] == b[2]) ? 1 : 0;
		b_in     = (fsa[i][3] == b[3]) ? 1 : 0;
		b_width  = (fsa[i][4] == b[4]) ? 1 : 0;

		var hex = (b_len << o[0]) + (b_out << o[1]) + (b_in << o[2]) + (b_width << o[3]);
		hexes.push(hex.toString(16));

		i = (i >= end_limit-1) ? 0 : i+1;
		count++;
	}

	return hexes.join('');
}

/**
 * Expose basic functions to the outside world
 **/
module.exports = {
    getFlames: getFlames,
    getFlamesHex: getFlamesHex
};
