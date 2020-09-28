/**
 * Pull the values from the excel sheet, hold in an iterable
 **/

var CoinKey = require('coinkey');
var ci = require('coininfo');
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
			jsws[i].outer_color, jsws[i].inner_color, jsws[i].width.charAt(0), jsws[i].side]);
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

function getFlames(bIncludeFlameLeaf, bSingleArray)
{
	if (!!bIncludeFlameLeaf) {
		return flames_array_with_extra;
	}

	if (!!bSingleArray) {
		return flames_single_array;
	}

	return flames_array;
}

function getFlamesHex(start_pos, order, bits, reverse, b_inner, b_outer)
{
	var fsa = flames_single_array;
	var hexes = [];
	var b_border, b_len, b_out, b_in, b_width;
	var o = order ? order : [3,2,1,0];
	var b = bits  ? bits : ['i', 'l', 'y', 'g', 'f'];

	if (b_inner == null) b_inner = true;
	if (b_outer == null) b_outer = true;
	if (!b_outer && !b_inner) throw "Invalid settings: b_inner and/or b_outer must be true";

	var count = 0;
	var end_limit = fsa.length;

	// Find the starting point
	var i = 0, current_i = 0;

	if (start_pos != null && typeof start_pos == 'number' && start_pos >= 0 && start_pos <= end_limit)
	{
		while (current_i != start_pos) {
			if ((b_inner && fsa[i][0] == 'i') || (b_outer && fsa[i][0] == 'o')) {
				current_i++;
			}
			i++;
		}
	}
	else if (start_pos != null && typeof start_pos == 'string' && 
		(start_pos == 'top' || start_pos == 'bottom' || start_pos == 'left' || start_pos == 'right'))
	{
		// Start at beginning or end
		if (reverse)
			i = end_limit - 1;
		else
			i = 0;

		// Pick a side - we'll numerically hardcode these
		if (b_inner && !b_outer) {
			while (!(fsa[i][5] == start_pos && fsa[i][0] == 'i')) {
				if (reverse) i--;
				else i++;
			}
		}
		else if (!b_inner && b_outer) {
			while (!(fsa[i][5] == start_pos && fsa[i][0] == 'o')) {
				if (reverse) i--;
				else i++;
			}
		} else {
			while (fsa[i][5] != start_pos) {
				if (reverse) i--;
				else i++;
			}
		}
	}

	// TODO handle reverse traversal

	while (count < end_limit)
	{
		b_border = (fsa[i][0] == b[0]) ? 1 : 0;
		b_len    = (fsa[i][1] == b[1]) ? 1 : 0;
		b_out    = (fsa[i][2] == b[2]) ? 1 : 0;
		b_in     = (fsa[i][3] == b[3]) ? 1 : 0;
		b_width  = (fsa[i][4] == b[4]) ? 1 : 0;

		var hex = (b_len << o[0]) + (b_out << o[1]) + (b_in << o[2]) + (b_width << o[3]);

		if ((b_inner && fsa[i][0] == 'i') || (b_outer && fsa[i][0] == 'o')) {
			hexes.push(hex.toString(16));
		}

		if (reverse)
		{
			i = (i == 0) ? end_limit-1 : i-1;
		}
		else
		{
			i = (i >= end_limit-1) ? 0 : i+1;			
		}
		count++;
	}

	return hexes.join('');
}

function getInnerFlamesHex(opt)
{
	var options = {
		'reverse' : opt.hasOwnProperty('reverse') ? opt.reverse : false,
		'b_inner' : true,
		'b_outer' : false,
		'order'   : opt.hasOwnProperty('order')   ? opt.order   : null,
		'bits'    : opt.hasOwnProperty('bits')    ? opt.bits    : null,
		'start'   : opt.hasOwnProperty('start')   ? opt.start   : 0
	};

	return getFlamesHex(options.start, options.order, options.bits, options.reverse,
		options.b_inner, options.b_outer);
}

function getOuterFlamesHex(opt)
{
	var options = {
		'reverse' : opt.hasOwnProperty('reverse') ? opt.reverse : false,
		'b_inner' : false,
		'b_outer' : true,
		'order'   : opt.hasOwnProperty('order')   ? opt.order   : null,
		'bits'    : opt.hasOwnProperty('bits')    ? opt.bits    : null,
		'start'   : opt.hasOwnProperty('start')   ? opt.start   : 0
	};

	return getFlamesHex(options.start, options.order, options.bits, options.reverse,
		options.b_inner, options.b_outer);
}

function getAllBitsPatterns3Bits()
{
	bits_patterns = [];
	for (var len = 0; len < 2; len++)
		for (var outer = 0; outer < 2; outer++)
			for (var inner = 0; inner < 2; inner++)
				bits_patterns.push([
					(len < 1) ? 'l' : 's', 
					(outer < 1) ? 'r' : 'y',
					(inner < 1) ? 'p' : 'g']);
	return bits_patterns;
}

function permutator(inputArr) {
  var results = [];

  function permute(arr, memo) {
    var cur, memo = memo || [];

    for (var i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        results.push(memo.concat(cur));
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }

    return results;
  }

  return permute(inputArr);
}

function testPrivateKey(pk)
{
	var ck = CoinKey.fromWif(pk)

	ck.compressed = false;
	console.log(ck.publicAddress)
	ck.compressed = true;
	console.log(ck.publicAddress)
	console.log(ck.versions.public === ci('BTC').versions.public) // => true 
}

/**
 * Expose basic functions to the outside world
 **/
module.exports = {
    getFlames: getFlames,
    getFlamesHex: getFlamesHex,
    getInnerFlamesHex: getInnerFlamesHex,
    getOuterFlamesHex: getOuterFlamesHex,
    getAllBitsPatterns3Bits: getAllBitsPatterns3Bits,
    permutator: permutator,
    testPrivateKey: testPrivateKey
};
