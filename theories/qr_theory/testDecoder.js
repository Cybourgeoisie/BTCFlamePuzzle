/**
 * Experiments in feeding the encrypted value into QR
 **/

const FLAMES = require('../parsers/getFlameValuesFromExcel.js');
const Canvas = require('canvas');
const QR = require('../qrcode-generator/js/qrcode.js');

// Setup for everything
var qr = new QR(6, 'Q');
qr.dSetModeCharLength(false);
qr.dSetAddDataBits(true);
qr.dOnlyPrintImageSrc(true);

// Form all permutations of ordering
bits_patterns = getAllBitsPatterns();
orders = permutator([0,1,2,3]);

// Limited for investigation
var directions = [["top", false], ["bottom", false], ["top", true], ["bottom", true]];

// All options
//var directions = [["top", false], ["right", false], ["bottom", false], ["left", false], 
//	["top", true], ["right", true], ["bottom", true], ["left", true]];

// Get our current version of the flames as hex
var mask = 0;

var hexes = "abcdefghijklmnopqrstuvwxyz";
//var hexes = FLAMES.getFlamesHex()
console.log('original: ' + hexes);

// Put hexes through the QR code generator
qr.clear();
qr.dSetModeCharLength(true);
qr.dSetAddErrorCorrectionBits(true);
qr.dSetApplyMaskPattern(true);
qr.setMaskPattern(mask);
//qr.addData(hexes, 'Raw');
qr.addData(hexes);
qr.make();

// Get the changed bits, turn back into hex, and run again
var db = qr.getDataBitsChanged();
var hexes = convertDataBitsToHex(db);
hexes = hexes.join('')
console.log('masked: ' + hexes);
if (getMode(hexes) == 'byte')
	console.log('message: ' + convertHexToMessage(hexes));

qr.clear();
qr.dSetModeCharLength(false);
qr.dSetAddErrorCorrectionBits(true);
qr.dSetApplyMaskPattern(true);
qr.setMaskPattern(mask);
qr.addData(hexes, 'Raw');
qr.make();

// Get the changed bits, turn back into hex, and run again
var db = qr.getDataBitsChanged();
var hexes = convertDataBitsToHex(db);
hexes = hexes.join('')
console.log('return: ' + hexes);
if (getMode(hexes) == 'byte')
	console.log('message: ' + convertHexToMessage(hexes));

//console.log(original_mode_counts);
//console.log(altered_mode_counts);


function hasValidModeBits(hexes)
{
	return !!(hexes[0] == '1' || hexes[0] == '2' || hexes[0] == '4' || hexes[0] == '8');
}

function isByteMode(hexes)
{
	return !!(hexes[0] == '4');
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
		//return ((size - 16) <= 74);
		return ((size - 2) <= 74);
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

function convertHexToMessage(hexes) {
	// Get the mode and size
	var mode = getMode(hexes);
	var size = getCharacterSize(hexes);

	if (!mode) return "invalid mode";

	var count = 0;
	var message = "";
	if (mode == 'byte') {
		for (var i = 3; i < 152; i+=2)
		{
			message += String.fromCharCode((parseInt(hexes.charAt(i), 16) * 16 + parseInt(hexes.charAt(i+1), 16)));
			if (++count >= size) break;
		}
	}
	else
	{
		throw "To be continued: " + mode;
	}

	return message;
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

function decode(img, mode, size)
{
	//var qrcodedecoder = new QrCode();
	//var image = new Canvas.Image();
	/*
	var image = new Canvas.Image();
	image.onload = function(){
		var canvas = new Canvas(49, 49);
		var ctx = canvas.getContext('2d');
		ctx.drawImage(image, 0, 0, 49, 49);

		var result;
		try{
			result = qrcodedecoder.decode(canvas);

			if (result.length != 64 && result.length != 66 && result.length != 52)
				return;

			console.log("Mode: " + mode + ", size: " + size + " compared to " + result.length);

			// Print the result
			console.log(result);

			// Print out the hex version
			hexes = [];
			for (var i = 0; i < result.length; i++)
			{
				hexes.push(parseInt(result.charCodeAt(i), 10).toString(16))
			}

			console.log(hexes.join(""));
		}
		catch(e)
		{
			//console.error('unable to read qr code: ' + e);
		}

	}
	image.src = img;
	*/

	/*
	qrcodedecoder.callback = function(error, result) {
	  if(error) {
	    console.log('err: ' + error)
	    return;
	  }
	  console.log('res: ' + result)
	  process.exit();
	}

	try{
		var res = qrcodedecoder.decode(canvas);
	}catch(e){
		console.error('unable to read qr code: ' + e);
	}
	*/

	/*
	(function(image, src, mode, size) {
		image.onload = function(){
		  var result;
		  try{
		    //result = qrcodedecoder.decode(image);

		    qrcodedecoder.callback = function(error, result) {
			  if(error) {
			    console.log('err: ' + error)
			    return;
			  }
			  console.log('res: ' + result)
			  process.exit();
			}
			var res = qrcodedecoder.decode(image);

		    //console.log("Mode: " + mode + ", size: " + size + " compared to " + result.length);
		  }catch(e){
		    console.error('unable to read qr code: ' + e);
		  }
		}
		image.src = src;
	})(image, img, mode, size);
	*/
}