/**
 * Bin all combinations of switches in the flames
 * Try to find statistical significance in some combinations not appearing
 * 
 * From prior experiments, it looked like the long / short flames were not equally
 * distributed (much more likely to see a long flame). If we're using hex values,
 * this seems unlikely, since why would we limit ourselves to the first 8 bits
 * most of the time? Unless the "hex" values represented something with significant
 * statistical difference.
 * 
 * However, if we combine two flames at a time, then in theory, we should see the lower-end
 * bits as being equally distributed, and the higher end bits more likely to be biased.
 *
 * So let's find out if there's a pattern to the "bits".
 */

const FLAMES = require('../../parsers/getFlameValuesFromExcel.js');
var flames = FLAMES.getFlames(false, true);

/**
 * Tests to run:
 * - Try intertwined inner / outer flames, and inner / outer separated
 * - Try finding statistically significant differences in individual flames and pairs of flames
 *
 *
 */

function filterFlames(values, key, value) {
	var filtered = [];
	values.forEach(function(v, i) {
		if (v[key] == value)
			filtered.push(v);
	});
	return filtered;
}

function alternateFlames(values, start_index) {
	var filtered = [];
	for (var i = start_index; i < values.length; i+=2)
		filtered.push(values[i]);
	return filtered;
}

function countFlames(flames) {
	var counts = {
		'length' : {'tall': 0, 'short':0},
		'width' : {'fat': 0, 'thin':0},
		'inner' : {'green': 0, 'purple':0},
		'outer' : {'red': 0, 'yellow':0}
	};

	flames.forEach(function(v, i) {
		// .border, .len.charAt(0), .outer_color, .inner_color, .width.charAt(0), .side
		counts.length.tall  += (v[1] == 'l' ? 1 : 0);
		counts.length.short += (v[1] == 's' ? 1 : 0);
		counts.outer.red    += (v[2] == 'r' ? 1 : 0);
		counts.outer.yellow += (v[2] == 'y' ? 1 : 0);
		counts.inner.green  += (v[3] == 'g' ? 1 : 0);
		counts.inner.purple += (v[3] == 'p' ? 1 : 0);
		counts.width.fat    += (v[4] == 'f' ? 1 : 0);
		counts.width.thin   += (v[4] == 't' ? 1 : 0);
	});

	return counts;
}


var temp_flames;

console.log("1: Statistics on all flames");
console.log("Count: " + flames.length);
console.log(countFlames(flames));
console.log("\r\n");

console.log("2: Statistics on inner flames");
temp_flames = filterFlames(flames, 0, 'i');
console.log("Count: " + temp_flames.length);
console.log(countFlames(temp_flames));
console.log("\r\n");

console.log("3: Statistics on outer flames");
temp_flames = filterFlames(flames, 0, 'o');
console.log("Count: " + temp_flames.length);
console.log(countFlames(temp_flames));
console.log("\r\n");

console.log("4: Statistics on inner flames, every other flame (odd)");
temp_flames = filterFlames(flames, 0, 'i');
temp_flames = alternateFlames(temp_flames, 0);
console.log("Count: " + temp_flames.length);
console.log(countFlames(temp_flames));
console.log("\r\n");

console.log("5: Statistics on inner flames, every other flame (even)");
temp_flames = filterFlames(flames, 0, 'i');
temp_flames = alternateFlames(temp_flames, 1);
console.log("Count: " + temp_flames.length);
console.log(countFlames(temp_flames));
console.log("\r\n");

console.log("6: Statistics on outer flames, every other flame (odd)");
temp_flames = filterFlames(flames, 0, 'o');
temp_flames = alternateFlames(temp_flames, 0);
console.log("Count: " + temp_flames.length);
console.log(countFlames(temp_flames));
console.log("\r\n");

console.log("7: Statistics on outer flames, every other flame (even)");
temp_flames = filterFlames(flames, 0, 'o');
temp_flames = alternateFlames(temp_flames, 1);
console.log("Count: " + temp_flames.length);
console.log(countFlames(temp_flames));
console.log("\r\n");

console.log("8: Statistics on all flames, every other flame (odd)");
temp_flames = alternateFlames(flames, 0);
console.log("Count: " + temp_flames.length);
console.log(countFlames(temp_flames));
console.log("\r\n");

console.log("9: Statistics on all flames, every other flame (even)");
temp_flames = alternateFlames(flames, 1);
console.log("Count: " + temp_flames.length);
console.log(countFlames(temp_flames));
console.log("\r\n");
