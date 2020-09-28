/**
 * Try to determine if the ribbons denote the order in which the flames
 * should appear. Then pairs of the remaining 3 bits could be used
 * to encode a message (2^6, or 64 => WIF requires 58, Alphanum requires 62)
 */

const FLAMES = require('../../parsers/getFlameValuesFromExcel.js');
var flames = FLAMES.getFlames(false, true);

function filterFlames(values, key, value) {
	var filtered = [];
	values.forEach(function(v, i) {
		if (v[key] == value)
			filtered.push(v);
	});
	return filtered;
}

function countFlames(flames, pattern) {
	var pattern_index = 0;
	var count = 0;
	flames.forEach(function(v, i) {
		// .border, .len.charAt(0), .outer_color, .inner_color, .width.charAt(0), .side
		if (pattern[pattern_index] == v[1]) {
			count++;
			pattern_index = (pattern_index+1)%pattern.length
		}
	});

	return count;
}


var left_pattern  = ['s', 'l', 'l', 's', 'l', 's'];
var right_pattern = ['s', 'l', 's', 'l', 'l', 's'];
var reverse_flames = flames.slice().reverse();

console.log("1: All flames, intertwined, sllsls");
console.log("Count: " + countFlames(flames, left_pattern));
console.log("\r\n");

console.log("2: All flames, intertwined, slslls");
console.log("Count: " + countFlames(flames, right_pattern));
console.log("\r\n");

console.log("3: All flames, reversed, intertwined, sllsls");
console.log("Count: " + countFlames(reverse_flames, left_pattern));
console.log("\r\n");

console.log("4: All flames, reversed, intertwined, slslls");
console.log("Count: " + countFlames(reverse_flames, right_pattern));
console.log("\r\n");

console.log("5: All flames, outer then inner, sllsls");
var outer_flames = filterFlames(flames, 0, 'o');
var inner_flames = filterFlames(flames, 0, 'i');
var temp_flames  = outer_flames.concat(inner_flames);
console.log("Count: " + countFlames(temp_flames, left_pattern));
console.log("\r\n");

console.log("6: All flames, outer then inner, slslls");
console.log("Count: " + countFlames(temp_flames, right_pattern));
console.log("\r\n");

console.log("7: All flames, inner then outer, sllsls");
temp_flames  = inner_flames.concat(outer_flames);
console.log("Count: " + countFlames(temp_flames, left_pattern));
console.log("\r\n");

console.log("8: All flames, inner then outer, slslls");
console.log("Count: " + countFlames(temp_flames, right_pattern));
console.log("\r\n");

console.log("9: All flames, reversed, outer then inner, sllsls");
outer_flames = filterFlames(flames, 0, 'o').reverse();
inner_flames = filterFlames(flames, 0, 'i').reverse();
temp_flames  = outer_flames.concat(inner_flames);
console.log("Count: " + countFlames(temp_flames, left_pattern));
console.log("\r\n");

console.log("10: All flames, reversed, outer then inner, slslls");
console.log("Count: " + countFlames(temp_flames, right_pattern));
console.log("\r\n");

console.log("11: All flames, reversed, inner then outer, sllsls");
temp_flames  = inner_flames.concat(outer_flames);
console.log("Count: " + countFlames(temp_flames, left_pattern));
console.log("\r\n");

console.log("12: All flames, reversed, inner then outer, slslls");
console.log("Count: " + countFlames(temp_flames, right_pattern));
console.log("\r\n");