/**
 * Experiments in feeding the encrypted value into QR
 **/

const FLAMES = require('../parsers/getFlameValuesFromExcel.js');
const Canvas = require('canvas');
const qrcodedecoder = require('jsqrcode')(Canvas);
const QR = require('../qrcode-generator/js/qrcode.js');

// Setup for everything
var qr = new QR(6, 'Q');
qr.dSetModeCharLength(false);
qr.dSetAddDataBits(true);
qr.dOnlyPrintImageSrc(true);

// createImgTag is super slow compared to createTableTag
//console.log(qr.createTableTag(8));


// Form all permutations of ordering
bits_patterns = getAllBitsPatterns();
orders = permutator([0,1,2,3]);

var s = 0;
for (var s = 0; s < 152; s++)
{
	for (var o = 0; o < orders.length; o++)
	{
		for (var i = 0; i < bits_patterns.length; i++)
		{
			// Get our current version of the flames as hex
			var hexes = FLAMES.getFlamesHex(s, orders[o], bits_patterns[i]);
			//console.log('old: ' + hexes);

			// Put hexes through the QR code generator
			qr.clear();
			qr.dSetAddErrorCorrectionBits(true);
			qr.dSetApplyMaskPattern(true);
			qr.setMaskPattern(0);
			qr.addData(hexes, 'Raw');
			qr.make();

			// See if there's anything worth looking at
			if (hasValidModeBits(hexes) && isSensibleCharacterSize(hexes))
			{
				//console.log('old: ' + hexes);
				var img = qr.createImgTag(1);
				decode(img, getMode(hexes), getCharacterSize(hexes));
			}

			// Get the changed bits, turn back into hex, and run again
			var db = qr.getDataBitsChanged();
			var new_hexes = convertDataBitsToHex(db);
			new_hexes = new_hexes.join('')
			//console.log('new: ' + new_hexes);

			qr.clear();
			qr.dSetAddErrorCorrectionBits(true);
			qr.dSetApplyMaskPattern(true);
			qr.setMaskPattern(0);
			qr.addData(new_hexes, 'Raw');
			qr.make();

			if (hasValidModeBits(new_hexes) && isSensibleCharacterSize(new_hexes))
			{
				//console.log('new: ' + new_hexes);
				var img = qr.createImgTag(1);
				decode(img, getMode(new_hexes), getCharacterSize(new_hexes));
			}
		}
	}
	console.error('start pos: ' + s);
}


function hasValidModeBits(hexes)
{
	return !!(hexes[0] == '1' || hexes[0] == '2' || hexes[0] == '4' || hexes[0] == '8');
}

function getMode(hexes)
{
	// Validate
	var alt = 'none';
	if (hexes[0] == '1') {
		alt  = 'numeric'
	} else if (hexes[0] == '2') {
		alt  = 'alnum'
	} else if (hexes[0] == '4') {
		alt  = 'byte'
	} else if (hexes[0] == '8') {
		alt  = 'kanji'
	}
	else
		return false;

	return alt;
}

function getCharacterSize(hexes)
{
	// Validate
	var size = 0;
	if (hexes[0] == '1') {
		size = parseInt(hexes[1], 16) * 64 + parseInt(hexes[2], 16) * 4 + ((parseInt(hexes[3], 16) & 0xF) >> 2)
	} else if (hexes[0] == '2') {
		size = parseInt(hexes[1], 16) * 32 + parseInt(hexes[2], 16) * 2 + ((parseInt(hexes[3], 16) & 0xF) >> 3)
	} else if (hexes[0] == '4') {
		size = parseInt(hexes[1], 16) * 16 + parseInt(hexes[2], 16)
	} else if (hexes[0] == '8') {
		size = parseInt(hexes[1], 16) * 16 + parseInt(hexes[2], 16)
	}
	else
		return false;

	return size;
}

function isSensibleCharacterSize(hexes)
{
	// Validate
	var size = getCharacterSize(hexes);
	if (hexes[0] == '1') {
		return ((size - 16) <= 178);
	} else if (hexes[0] == '2') {
		return ((size - 16) <= 108);
	} else if (hexes[0] == '4') {
		return ((size - 16) <= 74);
	} else if (hexes[0] == '8') {
		return ((size - 16) <= 45);
	}
	
	return false;
}

// Permutator code
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

function decode(img, mode, size)
{
	var image = new Canvas.Image();

	(function(image, src, mode, size) {
		image.onload = function(){
		  var result;
		  try{
		    result = qrcodedecoder.decode(image);
		    console.log("Mode: " + mode + ", size: " + size + " compared to " + result.length);
		    console.log(result);
		  }catch(e){
		    console.error('unable to read qr code: ' + e);
		  }
		}
		image.src = src;
	})(image, img, mode, size);
}

function convertDataBitsToHex(db) {
	var new_hexes = new Array(152).fill(0);
	for (var i = 0; i < 152; i++)
	{
		var offset = 0;
		if (i%8 < 2) { offset = 0 + i%2; }
		else if (i%8 < 4) { offset = 152/4 + i%2; }
		else if (i%8 < 6) { offset = 152/2 + i%2 - 1; } // -1 to account for Math.floor(i/4)
		else if (i%8 < 8) { offset = 3*152/4 + i%2 - 1; } // -1 to account for Math.floor(i/4)

		var new_hexes_index = offset + Math.floor(i/4);

		var character = (db[i*4] << 3) + (db[i*4+1] << 2) + (db[i*4+2] << 1) + (db[i*4+3]);
		new_hexes[new_hexes_index] = character.toString(16);
	}
	return new_hexes;
}

// Form all patterns of bits
function getAllBitsPatterns()
{
	bits_patterns = [];
	for (var len = 0; len < 2; len++)
		for (var outer = 0; outer < 2; outer++)
			for (var inner = 0; inner < 2; inner++)
				for (var width = 0; width < 2; width++)
					bits_patterns.push(['i', (len < 1) ? 'l' : 's', (outer < 1) ? 'r' : 'y',
						(inner < 1) ? 'p' : 'g', (width < 1) ? 't' : 'f']);
	return bits_patterns;
}