'use strict';

/* version of this application */
var SEEDER_VERSION = "00";

var loadedROM = null;

var ROM_INFO = {
	'00': {
		'crc32': 0xD1B36786,
		'fixedWorldLevelSeeds': 0x097694,
		'fixedWorldShipPieces': 0x0976c8,
		'whatMenu': 0x0242B0,
	},
	'02': {
		'crc32': 0x7A588F4B,
		'fixedWorldLevelSeeds': 0x097704,
		'fixedWorldShipPieces': 0x097738,
		'whatMenu': 0x024328,
	}
}

/* things in the game that we can use for random seed names */
var INIT_SEED = [
	"TOEJAM", "EARL", "JAMMIN", "WIENER", "DUFUS",
	"POINDEXTER", "PEANUT", "DUDE", "BRO", "HOMEY",
	"RAPMASTER", "FUNKLORD", "GONER", "BOGUS",
	"ICARUS", "WINGS", "SPRING", "SHOES", "INNERTUBE",
	"TOMATO", "SLING", "SHOT", "ROCKET", "SKATES",
	"ROSE", "BUSHES", "SUPER", "BONUS", "HITOPS",
	"DOORWAY", "FOOD", "ROOTBEER", "PROMOTION",
	"UNFALL", "RAIN", "CLOUD", "FUDGE", "SUNDAE",
	"DECOY", "BUMMER", "LIFE", "RANDOMIZER", "CUPID",
	"TELEPHONE", "JACKPOT", "SCHOOL", "BOOK",
	"EARTHLING", "BOOMBOX", "CARROT", "WIZARD",
	"OPERA", "SINGER", "WISE", "DENTIST", "DEVIL",
	"WAHINE", "HUBBA", "LEMONADE", "BUCK", "TORNADO",
	"MAILBOX", "CHICKEN", "MOLDY", "CHEESE", "SANTA",
	"BOOGIE", "FISH", "CABBAGE", "CAKE", "PIE", "TRUCK",
	"ELEVATOR", "ROCKETSHIP", "WINDSHIELD", "METAWATT",
	"SPEAKER", "FUNKOMATIC", "AMPLAMATOR", "CONNECTOR",
	"FIN", "LEG", "AWESOME", "SNOWBOARD", "RIGHTEOUS",
	"CAPSULE", "HYPERFUNK", "THRUSTER", "LAMONT",
	"PEABO", "LEWANDA", "SMOOT", "OTIS", "BLOONA",
	"CHESTER", "LESTER", "FLARNEY", "SHARLA", "JAMOUT",
	"BELT", "ICK", "YUCK", "WOW", "HAMBURGER",
	"CANDY", "FRIES", "PANCAKE", "WATERMELON", "HOMEBOY",
	"PIZZA", "CEREAL", "TRIXIE", "FUNKOTRON", "INSANE",
	"ACHOO", "GESUNDHEIT", "GETACLUE", "NOTBAD",
	"CRUSIN", "THUMPIN", "FUNKY", "DRIVE", "CRANKIT",
	"GALAXY", "SPACE", "EARTH"
];

/* dumb slow crc32 */
function crc32(u8arr)
{
	var i, j;
	var len = u8arr.length;
	var crc = -1;
	var mask;
	for (i = 0; i < len; ++i)
	{
		var tmp = (crc ^ u8arr[i]) & 0xFF
		for (j = 0; j < 8; ++j)
		{
			if ((tmp & 1) === 1)
				tmp = (tmp >>> 1) ^ (0xEDB88320);
			else
				tmp = (tmp >>> 1);
		}
		crc = (crc >>> 8) ^ tmp;
	}
	i = (crc ^ -1);
	if (i < 0)
		i += 0x100000000;
	return i
}

function SeededRNG(seed)
{
	this.ctx = seed;
}

/* This is the same RNG algo the game uses. */
SeededRNG.prototype.random = function()
{
	var hi = Math.floor(this.ctx / 127773);
	var lo = this.ctx % 127773;
	var x = 16807 * lo - 2836 * hi;
	if (x < 0)
		x += 0x7FFFFFFF;
	this.ctx = x;
	return (x - 1)
}

function bytesToString(u8arr)
{
	var str = String.fromCharCode.apply(null, u8arr);
	return str;
}

function stringToBytes(str)
{
	var arr = [];
	for (var i = 0; i < str.length; ++i)
		arr[i] = str[i].charCodeAt(0);
	arr[i] = 0;
	return arr;
}

function GenesisRom(arrayBuffer)
{
	var arr = new Uint8Array(arrayBuffer)
	this.domestic_game_name = bytesToString(arr.slice(0x120, 0x150))
	this.product_number = bytesToString(arr.slice(0x180, 0x18A))
	this.product_revision = bytesToString(arr.slice(0x18C, 0x18E))
	this.crc32 = crc32(arr)
	this.data = arrayBuffer;
}

function romFileChanged(obj)
{
	var file = obj.target.files[0];
	var reader = new FileReader();
	reader.onload = romFileLoaded;
	reader.readAsArrayBuffer(file);
}

function romFileLoaded(obj)
{
	var rom = new GenesisRom(obj.target.result);

	var gameid = document.getElementById('gameid')
	gameid.innerText = rom.domestic_game_name + " REV " + rom.product_revision;
	document.getElementById('pid').style.display = 'block';
	var gamecrc = document.getElementById('gamecrc')
	gamecrc.innerText = rom.crc32.toString(16)
	document.getElementById('pcrc').style.display = 'block';

	if (ROM_INFO.hasOwnProperty(rom.product_revision) &&
		ROM_INFO[rom.product_revision].crc32 == rom.crc32)
	{
		gamecrc.innerText += " [valid]"
		loadedROM = rom;

		/* make up an initial seed */
		generateNewSeed();
		document.getElementById('pseed').style.display = 'block';
		document.getElementById('pgo').style.display = 'block';
	}
	else
	{
		gamecrc.innerText += " [invalid]"
		loadedROM = null;
		document.getElementById('pseed').style.display = 'none';
		document.getElementById('pgo').style.display = 'none';
	}
}

function generateLevelSeeds(rng)
{
	var seeds = []
	for (var i = 0; i < 26; ++i)
	{
		seeds[i] = rng.random() % 0xFFFF;
	}
	return seeds;
}

function shuffleArray(arr, rng)
{
	for (var i = arr.length - 1; i > 0; --i)
	{
		var j = rng.random() % (i + 1);
		var tmp = arr[i];
		arr[i] = arr[j];
		arr[j] = tmp;
	}
}

function generateShipPieces(rng)
{
	/* create an array with all levels 2 -> 24 */
	var possibleShipPieces = []
	for (var i = 0; i <= 22; ++i)
	{
		possibleShipPieces[i] = i + 2
	}
	shuffleArray(possibleShipPieces, rng)
	/* grab the first ten */
	possibleShipPieces = possibleShipPieces.slice(0, 10)
	/* one lucky winner gets to be level 25! */
	var slotToReplace = Math.floor(rng.random() % 10)
	possibleShipPieces[slotToReplace] = 25
	return possibleShipPieces;
}

function generateInitialSeed()
{
	/* initial seed is up to 16 characters */
	var parts = [];
	var partsLength = 0;
	while (partsLength < 16)
	{
		var term = INIT_SEED[Math.floor(Math.random() * INIT_SEED.length)]
		if (term.length + partsLength > 16)
		{
			/* not enough room, just add a single char */
			var v = Math.random();
			if (v < 0.50)
			{
				/* 50% chance for digit */
				term = String.fromCharCode(48 + ((v * 100) % 10));
			}
			else
			{
				/* 50% chance for letter */
				term = String.fromCharCode(65 + ((v * 100) % 26));				
			}
		}
		parts.push(term);
		partsLength += term.length;
	}

	shuffleArray(parts, new SeededRNG(Math.floor(Math.random() * 0x7FFFFFFF)))
	return parts.join('');
}

function seedNameToFilePart(seedStr)
{
	/* right trim */
	seedStr = seedStr.replace(/\s+$/g, '');
	/* replace spaces with _ */
	seedStr = seedStr.replace(' ', '_');
	return seedStr
}

function computeOctetsFromSeedInput(inputStr)
{
	var i;

	/* seed is a 16-char set of bytes; pad out with spaces */
	var seed = new Uint8Array(16);
	for (i = 0; i < 16; ++i)
		seed[i] = 0x20;

	/* limit to 16 chars */
	inputStr = inputStr.substr(0, 16);

	for (i = 0; i < inputStr.length; ++i)
	{
		var c = inputStr[i];
		if ((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') ||
			(c == '.' || c == ' ' || c == '-' || c == '!'))
		{
			/* pass-through */
		}
		else if (c >= 'a' && c <= 'z')
		{
			c = c.toUpperCase();
		}
		else
		{
			c = ' ';
		}
		seed[i] = c.charCodeAt(0);
	}

	return seed;
}

function patchROM(arrayBuffer, romRevision, seedStr)
{
	var i;

	var seedOctets = computeOctetsFromSeedInput(seedStr);
	var seedName = bytesToString(seedOctets);
	var seedFilePart = seedNameToFilePart(seedName);
	var rng = new SeededRNG(crc32(seedOctets));

	var info = ROM_INFO[romRevision];

	var romView = new DataView(arrayBuffer);

	/* apply new level seeds */
	var levelSeeds = generateLevelSeeds(rng);
	for (i = 0; i < 26; ++i)
		romView.setUint16(info.fixedWorldLevelSeeds+(i*2), levelSeeds[i])

	/* apply new ship piece locations */
	var shipPieces = generateShipPieces(rng);
	var romPiecesView = new Uint8Array(arrayBuffer, info.fixedWorldShipPieces, 10);
	for (i = 0; i < 10; ++i)
		romView.setUint8(info.fixedWorldShipPieces+i, shipPieces[i]);

	/* now, fix up the menu */

	/* make first option return 0x0004, starts 'fixed world' */
	var firstMenuItemPtr = info.whatMenu;
	romView.setUint16(firstMenuItemPtr+6, 0x0004);
	var firstItemStrPtr = romView.getUint32(firstMenuItemPtr+2);
	/* move the last option down, make it non-selectable */
	var lastMenuItemPtr = info.whatMenu + (8*4);
	romView.setUint8 (lastMenuItemPtr+1, 0x16);
	romView.setUint16(lastMenuItemPtr+6, 0xFFFF);
	var lastItemStrPtr = romView.getUint32(lastMenuItemPtr+2);

	/* turn first option into "seeded world" */
	var firstItemStr = new Uint8Array(arrayBuffer, firstItemStrPtr, 30);
	var newFirstItemStr = stringToBytes("Play New Game -- Seeded World")
	for (i = 0; i < newFirstItemStr.length; ++i)
		firstItemStr[i] = newFirstItemStr[i];

	/* turn last option into seed and version identifier */
	var lastItemStr = new Uint8Array(arrayBuffer, lastItemStrPtr, 30);
	var newLastItemStr = stringToBytes("Seed "+seedName+"  R"+romRevision+"V"+SEEDER_VERSION);
	for (i = 0; i < newLastItemStr.length; ++i)
		lastItemStr[i] = newLastItemStr[i];

	/* fix up checksum */
	var newChecksum = 0;
	for (i = 0x200; i < romView.byteLength; i += 2)
	{
		newChecksum += romView.getUint16(i);
		/* keep as uint16 */
		newChecksum = newChecksum & 0xFFFF;
	}
	romView.setUint16(0x18E, newChecksum);

	var outputRom = new Blob([arrayBuffer], {type:"application/x-mega-drive-rom"});
	saveAs(outputRom, "TJE_seed_" + seedFilePart + "_R" + romRevision + "V" + SEEDER_VERSION + ".smd");
}

function generateNewROM()
{
	/* no rom loaded, nothing to do */
	if (loadedROM == null)
		return;

	var inputSeed = document.getElementById('seed').value;
	patchROM(loadedROM.data, loadedROM.product_revision, inputSeed);

	return false;
}

function generateNewSeed()
{
	document.getElementById('seed').value = generateInitialSeed();
}

function main()
{
	document.getElementById('pid').style.display = 'none';
	document.getElementById('pcrc').style.display = 'none';
	document.getElementById('pseed').style.display = 'none';
	document.getElementById('pgo').style.display = 'none';
	document.getElementById('romfile').addEventListener('change', romFileChanged);
	document.getElementById('randomize').addEventListener('click', generateNewSeed);
	document.getElementById('generate').addEventListener('click', generateNewROM)
}

main();
