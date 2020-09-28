/**
 * Parse the flames, assuming pairs to generate one Base-58 value
 */

/*
	TODO
		- flames intermingled, or inner then outer
		- off by one for stats
		- apply the cipher
		- all variations of bit orders and values
		- mod 59, interval 17
*/

const FLAMES = require('../parsers/getFlameValuesFromExcel.js');
var flames = FLAMES.getFlames(false, true);

var bits_patterns = FLAMES.getAllBitsPatterns3Bits();
var orders = FLAMES.permutator([0,1,2]);

var single, double, pair_bits, string;

generateAlphabet();
for (var offBy = 0; offBy < 2; offBy++)
{
	/*
	for (var order = 0; order < orders.length; order++)
	{
		for (var bits = 0; bits < bits_patterns.length; bits++)
		{
		*/
			var order = 0;
			var bits = 0;
			for (var modulo = 0; modulo < 2; modulo++)
			//var modulo = 1;
			{
				//console.log("Modulo?", modulo);

				/*["", "XOR"]*/
				["", "XOR", "XOR_ALT", "XOR_REV"].forEach(function(method, i) {
					// Intermingled
					sortFlamesIntoInnerOuter();
					resetStats();
					binFlames(flames, orders[order], bits_patterns[bits], method, !!modulo);

					console.log("Intermingled", method);
					//console.log(single, double, double.length);

					console.log(string);

					// See if we find a pattern that satisfies Base 58
					if (subsetSatisfiesBase58(string + string))
					{
						console.log(subsetSatisfiesBase58(string + string));
					}

					// Inner, Outer
					resetStats();
					binFlames(inner, orders[order], bits_patterns[bits], method, !!modulo);
					binFlames(outer, orders[order], bits_patterns[bits], method, !!modulo);

					console.log(string);

					//console.log("Inner, then outer", method);
					//console.log(single, double, double.length);
					// See if we find a pattern that satisfies Base 58
					if (subsetSatisfiesBase58(string + string))
					{
						console.log(subsetSatisfiesBase58(string + string));
					}
				});
			}
		/*
		}
	}
	*/

	// Off by one
	flames.push(flames[0]);
	flames.splice(0, 1);
	//console.log("-- Off by one --");
}

function binFlames(values, order, bit_pattern, method = "", useModulus = false) {
	var bXor = false, bXorAlt = false, bXorRev = false;
	if (method == 'XOR') {
		bXor = true;
	} else if (method == 'XOR_ALT') {
		bXorAlt = true;
	} else if (method == 'XOR_REV') {
		bXorRev = true;
	}

	values.forEach(function(v, i) {
		// It shouldn't matter how the bits are chosen for statistics (for decryption, yes - statistics, no)
		// As long as it is consistent

		//jsws[i].border, jsws[i].len.charAt(0), 
		//		jsws[i].outer_color, jsws[i].inner_color, jsws[i].width.charAt(0), jsws[i].side
		var bits = (v[1] == bit_pattern[0] ? 1 : 0) * Math.pow(2, order[0]) + (v[2] == bit_pattern[1] ? 1 : 0) * Math.pow(2, order[1]) + (v[3] == bit_pattern[2] ? 1 : 0) * Math.pow(2, order[2]);

		// Apply cipher
		if (i%2 == 0)
		{
			bits = (bXor) ? bits ^ 3 : (bXorAlt ? bits = bits ^ 4 : (bXorRev ? bits = bits ^ 2 : bits));
		}
		else
		{
			bits = (bXor) ? bits ^ 2 : (bXorAlt ? bits = bits ^ 5 : (bXorRev ? bits = bits ^ 3 : bits));
		}

		if (single.hasOwnProperty(bits))
		{
			single[bits]++;
		}
		else
		{
			single[bits] = 1;
		}

		if (i%2 == 0)
		{
			pair_bits = bits << 3;
		}
		else
		{
			pair_bits += bits;
			if (double.hasOwnProperty(pair_bits))
			{
				double[pair_bits]++;
			}
			else
			{
				double[pair_bits] = 1;
				double.length++;
			}

			string += transcribeBits(pair_bits, useModulus);

			pair_bits = 0;
		}
	});
}

function makeBytesFrom6BitSets(bitset)
{
	var bytestring = (bitset[0] << 18) + (bitset[1] << 12) + (bitset[2] << 6) + bitset[3];
	return [
		bytestring >> 16,
		(bytestring - ((bytestring >> 16) << 16)) >> 8,
		(bytestring - ((bytestring >> 8) << 8)),
	];
}

function convertBitstringToBytestring(string)
{
	var bytearray = [];
	var bitarray = string.split("");
	for (var i = 0; i < string.length; i+=4) {
		bytearray.push(makeBytesFrom6BitSets(bitarray.slice(i,i+4)));
	}
	return bytearray.join(", ");
}


function subsetSatisfiesBase58(string)
{
	var base58Alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".split("");
	var count = 0;
	var arr = string.split("");

	var str_sat = "";
	arr.forEach(function(letter) {
		if (base58Alphabet.indexOf(letter) !== -1)
		{
			str_sat += letter;
			count++;
		}
		else
		{
			str_sat = "";
			count = 0;
		}
	});

	return (count >= 51) ? str_sat : false;
}

function transcribeBits(bits, bModulo)
{
	if (!!bModulo)
	{
		//console.log(bits, "became", (bits * 17) % 64)
		bits = (bits * 17) % 64;

		/*
		for (var i = 0; i < 17; i++)
		{
			bits_contender = (bits * (1 + i * 64)) / 17;

			if ((Math.floor(bits_contender) == Math.ceil(bits_contender)))
			{
				console.log('i =', i);
				bits = bits_contender;
				break;
			}
		}
		*/
	}

	return alphabet[bits];
}

function resetStats() {
	single = {};
	double = {'length':0};
	pair_bits = 0;
	string = "";
}

function sortFlamesIntoInnerOuter() {
	// Preprocessing
	inner  = [];
	outer  = [];
	string = "";
	flames.forEach(function(v, i) {
		if (v[0] == 'i') {
			inner.push(v);
		} else {
			outer.push(v);
		}
	});
}

var alphabet;
function generateAlphabet()
{
	alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
		'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
	alphabet.forEach(function(letter) {
		alphabet.push(letter.toLowerCase());
	});
	alphabet = alphabet.concat(['0','1','2','3','4','5','6','7','8','9']);
	alphabet.push('?', '!');
}