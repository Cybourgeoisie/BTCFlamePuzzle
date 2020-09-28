/**
 * Bin all combinations of switches in the flames
 * Try to find statistical significance in some combinations not appearing
 */

const FLAMES = require('../parsers/getFlameValuesFromExcel.js');
var flames = FLAMES.getFlames(false, true);

function binFlames(values) {

	var combinations = {};

	values.forEach(function(v, i) {
		// It shouldn't matter how the bits are chosen for statistics (for decryption, yes - statistics, no)
		// As long as it is consistent

		//jsws[i].border, jsws[i].len.charAt(0), 
		//		jsws[i].outer_color, jsws[i].inner_color, jsws[i].width.charAt(0), jsws[i].side
		var bits = (v[0] == 'i' ? 1 : 0) * 1 + 
			(v[1] == 'l' ? 1 : 0) * 2 + 
			(v[2] == 'r' ? 1 : 0) * 4 + 
			(v[3] == 'g' ? 1 : 0) * 8 + 
			(v[4] == 'f' ? 1 : 0) * 16 +
			(v[5] == 'left' || v[5] == 'bottom' ? 1 : 0) * 32;


		if (combinations.hasOwnProperty(bits))
		{
			combinations[bits]++;
		}
		else
		{
			combinations[bits] = 1;
		}
	});

	return combinations;
}

console.log(binFlames(flames));