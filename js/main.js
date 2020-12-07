'use strict';

/* version of this application */
var SEEDER_VERSION = "01";

var loadedROM = null;

var ROM_CRC32 = {
	'00': 0xD1B36786,
	'02': 0x7A588F4B,
};

/* Addresses of interesting locations in REV02. */
var ADDRESS_MAP = {
	'fixedWorldLevelSeeds': 0x097704,
	'fixedWorldShipPieces': 0x097738,
	'whatMenu': 0x024328,
	'earthlingsForLevel': 0x026446,
	'levelAttributeSet': 0x08c00e,
	'presentWeightTable': 0xabea8,
	'inventoryStringTable': 0xabc42,
	'bonusPresentReplacement': 0x16f51,
	'bonusPresentSpriteAddr': 0xab010,
	'bonusPresentSpriteOptions': [0xaae4a, 0xaaee4, 0xaaf92],
	'startingInventoryPresentsP1': [0x14393, 0x14397, 0x143a5, 0x143ab],
	'startingInventoryPresentsP2': [0x143c5, 0x143cb, 0x143d9, 0x143df],
};

/*
 * Translation function to convert REV02 addresses to the corresponding
 * REV00 location.
 */
function fixupAddressRev02ToRev00(addr) {
	if (addr >= 0x3A598)
		addr = addr - 0x02;
	if (addr >= 0x27B1C)
		addr = addr + 0x08;
	if (addr >= 0x27AAC)
		addr = addr - 0x04;
	if (addr >= 0x27A10)
		addr = addr + 0x06;
	if (addr >= 0x1F954)
		addr = addr - 0x10;
	if (addr >= 0x1F8B4)
		addr = addr - 0x14;
	if (addr >= 0x1F7B0)
		addr = addr - 0x10;
	if (addr >= 0x1F758)
		addr = addr - 0x02;
	if (addr >= 0x17374)
		addr = addr - 0x12;
	if (addr >= 0x12610)
		addr = addr - 0x10;
	if (addr >= 0x8FCA)
		addr = addr - 0x10;
	if (addr >= 0x8866)
		addr = addr - 0x10;

	return addr;
}

function getAddressMap(rev) {
	if (rev == "02") {
		return ADDRESS_MAP;
	} else if (rev == "00") {
		var newMap = {};
		for (var key in ADDRESS_MAP) {
			if (ADDRESS_MAP.hasOwnProperty(key)) {
				if (Array.isArray(ADDRESS_MAP[key])) {
					newMap[key] = ADDRESS_MAP[key].map(fixupAddressRev02ToRev00);
				} else {
					newMap[key] = fixupAddressRev02ToRev00(ADDRESS_MAP[key]);
				}
			}
		}
		return newMap;
	}
}

var EARTHLINGS = {
	'SHIP_PIECE': 0,
	'DEVIL': 1,
	'HAMSTER': 2,
	'SHOPPING_CART': 3,
	'DENTIST': 4,
	'WAHINI': 5,
	'BEES': 6,
	'CUPID': 7,
	'TORNADO': 8,
	'MAILBOX': 9,
	'WIZARD': 10,
	'WISEMAN': 11,
	'NERDS': 12,
	'LAWNMOWER_MAN': 13,
	'SHARK': 14,
	'CHICKENS': 15,
	'BOOGIE': 16,
	'OPERA_SINGER': 17,
	'MOLE': 18,
	'ICE_CREAM_TRUCK': 19,
	'SANTA': 20,
	'ANGRY_DENTIST': 21,
	'ANGRY_BEES': 22,
	'LEMONADE_STAND': 23,
	'HOTTUB': 24
};

var GOOD_EARTHLINGS = [
	EARTHLINGS['WIZARD'],
	EARTHLINGS['WISEMAN'],
	EARTHLINGS['OPERA_SINGER'],
	EARTHLINGS['SANTA'],
];

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

function TjeRom(genesisRom)
{
	this.rom = genesisRom;
	this.view = new DataView(this.rom.data);
	this.addrs = getAddressMap(this.rom.product_revision);
}

TjeRom.prototype.getLevelSeeds = function()
{
	var startAddr = this.addrs.fixedWorldLevelSeeds;
	var levelSeeds = [];
	for (var i = 0; i < 10; ++i)
		levelSeeds[i] = this.view.getUint16(startAddr+(i*2));
	return levelSeeds;
}

TjeRom.prototype.setLevelSeeds = function(value)
{
	var startAddr = this.addrs.fixedWorldLevelSeeds;
	for (var i = 0; i < 26; ++i)
		this.view.setUint16(startAddr+(i*2), value[i]);
}

TjeRom.prototype.getShipPieceFloors = function()
{
	var startAddr = this.addrs.fixedWorldShipPieces;
	var shipPieces = [];
	for (var i = 0; i < 10; ++i)
		shipPieces[i] = this.view.getUint8(startAddr+i);
	return shipPieces;
}

TjeRom.prototype.setShipPieceFloors = function(value)
{
	var startAddr = this.addrs.fixedWorldShipPieces;
	for (var i = 0; i < 10; ++i)
		this.view.setUint8(startAddr+i, value[i]);
}

TjeRom.prototype.getLevelTypes = function()
{
	var startAddr = this.addrs.levelAttributeSet;
	var levelTypes = [];
	for (var i = 0; i < 24; ++i)
		levelTypes[i] = this.view.getUint8(startAddr+i);
	return levelTypes;
}

TjeRom.prototype.setLevelTypes = function(value)
{
	var startAddr = this.addrs.levelAttributeSet;
	for (var i = 0; i < 24; ++i)
	{
		this.view.setUint8(startAddr+i, value[i]);
	}
}

TjeRom.prototype.getEarthlingPlacement = function(value)
{
	var startAddr = this.addrs.earthlingsForLevel;
	var earthlings = [];
	for (level = 0; level < 26; ++level)
	{
		earthlings[level] = []
		for (i = 0; i < 20; ++i)
		{
			var earthling = this.view.getUint8(startAddr + (level*20) + i);
			earthlings[level][i] = earthling;
		}
	}
	return earthlings;
}

TjeRom.prototype.setEarthlingPlacement = function(value)
{
	var startAddr = this.addrs.earthlingsForLevel;
	for (level = 0; level < 26; ++level)
	{
		for (i = 0; i < 20; ++i)
		{
			this.view.setUint8(startAddr + (level*20) + i, value[level][i]);
		}
	}
}

TjeRom.prototype.setBonusPresent = function(type, spriteIndex)
{
	this.view.setUint8(this.addrs.bonusPresentReplacement, type);

	// NOP out this branch
	this.view.setUint16(this.addrs.bonusPresentReplacement+1, 0x4E71);
	this.view.setUint16(this.addrs.bonusPresentReplacement+3, 0x4E71);

	this.view.setUint32(this.addrs.inventoryStringTable+(4*27),
		this.view.getUint32(this.addrs.inventoryStringTable+(4*type)));

	this.view.setUint32(this.addrs.bonusPresentSpriteAddr,
		this.addrs.bonusPresentSpriteOptions[spriteIndex]);
}

TjeRom.prototype.setStartingInventory = function(presents)
{
	var i;

	for (i = 0; i < 4; ++i)
		this.view.setUint8(this.addrs.startingInventoryPresentsP1[i], presents[i%4]);
	for (i = 0; i < 4; ++i)
		this.view.setUint8(this.addrs.startingInventoryPresentsP2[i], presents[(i+2)%4]);
}

TjeRom.prototype.chooseRandomPresent = function(rng)
{
	var presentWeightTable = [];
	var maxWeight = 0;
	var i;
	for (i = 0; i < 27; ++i) {
		presentWeightTable[i] = this.view.getUint8(this.addrs.presentWeightTable);
		maxWeight += presentWeightTable[i];
	}
	var rngValue = rng.random() % maxWeight;
	var accumulator = 0;
	for (i = 0; i < 27; ++i) {
		accumulator += presentWeightTable[i];
		if (rngValue <= accumulator)
			return i;
	}
}

TjeRom.prototype.updateMenu = function(seedName)
{
	var i;
	var romRevision = this.rom.product_revision;

	/* make first option return 0x0004, starts 'fixed world' */
	var firstMenuItemPtr = this.addrs.whatMenu;
	this.view.setUint16(firstMenuItemPtr+6, 0x0004);
	var firstItemStrPtr = this.view.getUint32(firstMenuItemPtr+2);
	/* move the last option down, make it non-selectable */
	var lastMenuItemPtr = this.addrs.whatMenu + (8*4);
	this.view.setUint8 (lastMenuItemPtr+1, 0x16);
	this.view.setUint16(lastMenuItemPtr+6, 0xFFFF);
	var lastItemStrPtr = this.view.getUint32(lastMenuItemPtr+2);

	/* turn first option into "seeded world" */
	var firstItemStr = new Uint8Array(this.rom.data, firstItemStrPtr, 30);
	var newFirstItemStr = stringToBytes("Play New Game -- Seeded World")
	for (i = 0; i < newFirstItemStr.length; ++i)
		firstItemStr[i] = newFirstItemStr[i];

	/* turn last option into seed and version identifier */
	var lastItemStr = new Uint8Array(this.rom.data, lastItemStrPtr, 30);
	var newLastItemStr = stringToBytes("Seed "+seedName+"  R"+romRevision+"V"+SEEDER_VERSION);
	for (i = 0; i < newLastItemStr.length; ++i)
		lastItemStr[i] = newLastItemStr[i];
}

TjeRom.prototype.updateChecksum = function()
{
	var newChecksum = 0;
	for (var i = 0x200; i < this.view.byteLength; i += 2)
	{
		newChecksum += this.view.getUint16(i);
		/* keep as uint16 */
		newChecksum = newChecksum & 0xFFFF;
	}
	this.view.setUint16(0x18E, newChecksum);
}


function setOptionDisplay(value)
{
	var ids = ['pseed', 'pgo', 'pleveltypes', 'pearthlinglevels', 'pstartinginventory'];

	ids.forEach(function(id) {
		document.getElementById(id).style.display = value;
	});
}

function romFileChanged(obj)
{
	var file = obj.target.files[0];
	var reader = new FileReader();
	reader.onload = romFileLoaded;
	reader.readAsArrayBuffer(file);
}

function handleROMLoad(rom, userInitiated)
{
	var gameid = document.getElementById('gameid')
	gameid.innerText = rom.domestic_game_name + " REV " + rom.product_revision;
	document.getElementById('pid').style.display = 'block';
	var gamecrc = document.getElementById('gamecrc')
	gamecrc.innerText = rom.crc32.toString(16)
	document.getElementById('pcrc').style.display = 'block';

	if (ROM_CRC32.hasOwnProperty(rom.product_revision) &&
		ROM_CRC32[rom.product_revision] == rom.crc32)
	{
		gamecrc.innerText += " [valid]"
		loadedROM = rom;

		/* make up an initial seed if needed */
		if (document.getElementById('seed').value.length == 0) {
			generateNewSeed();
		}
		setOptionDisplay('block');
		return true;
	}
	else if (userInitiated)
	{
		gamecrc.innerText += " [invalid]"
		loadedROM = null;
		setOptionDisplay('none');
	}
	return false;
}

function attemptReloadOfROM()
{
	var rom_data = localforage.getItem('tje_rom').then(function(value) {
		if (value == null) {
			console.log("not in storage")
			return;
		}

		var rom = new GenesisRom(value);
		if (!handleROMLoad(rom, false)) {
			/* if this is bad, we should remove it */
			localforage.removeItem('tje_rom').then(function(v) {});
		}
	});
}

function romFileLoaded(obj)
{
	var rom = new GenesisRom(obj.target.result, true);
	if (handleROMLoad(rom)) {
		/* cache this off in local storage */
		localforage.setItem('tje_rom', rom.data).then(function(v) {});
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
	var possibleShipPieces = [];
	for (var i = 0; i <= 22; ++i)
	{
		possibleShipPieces[i] = i + 2
	}
	shuffleArray(possibleShipPieces, rng);
	/* grab the first ten */
	possibleShipPieces = possibleShipPieces.slice(0, 10);
	/* one lucky winner gets to be level 25! */
	var slotToReplace = Math.floor(rng.random() % 10)
	possibleShipPieces[slotToReplace] = 25;
	return possibleShipPieces;
}

function generateLevelTypes(tjeRom, options, rng)
{
	var type = options.levelTypes;
	var i;

	var levelTypes = tjeRom.getLevelTypes();

	/* TODO: game gets unhappy if the first two levels are changed. */

	if (type == "original")
	{
		return;
	}
	if (type == "shuffled")
	{
		var prefix = levelTypes.slice(0, 2);
		var suffix = levelTypes.slice(2);
		shuffleArray(suffix, rng);
		levelTypes = prefix.concat(suffix);
	}
	else if (type == "randomized")
	{
		for (i = 2; i < 24; ++i)
		{
			levelTypes[i] = rng.random() % 8;
		}
	}

	tjeRom.setLevelTypes(levelTypes);
}

function generateEarthlingPlacement(tjeRom, options, rng)
{
	var type = options.earthlingLevels;
	var i;
	var j;
	var level;

	if (type != "shuffled" && type != "randomized")
		return; /* do nothing */

	var earthlings = tjeRom.getEarthlingPlacement();

	var earthlingCounts = [];
	for (i = 0; i < 25; ++i)
		earthlingCounts[i] = 0;

	for (level = 0; level < 26; ++level)
	{
		for (i = 0; i < 20; ++i)
		{
			var earthling = earthlings[level][i];
			if (earthling != 255 && level > 1)
			{
				earthlingCounts[earthling]++;
			}
		}
	}

	if (type == "original")
	{
		return;
	}
	else if (type == "shuffled")
	{
		var newEarthlings = [];
		var levelMap = [];
		for (i = 0; i < 24; ++i)
			levelMap[i] = (i+2);
		shuffleArray(levelMap, rng);

		newEarthlings[0] = earthlings[0];
		newEarthlings[1] = earthlings[1];
		for (i = 0; i < 24; ++i)
			newEarthlings[i+2] = earthlings[levelMap[i]];

		earthlings = newEarthlings;
	}
	else if (type == "randomized")
	{
		var levelMap = [];
		var newEarthlings = [];

		newEarthlings[0] = earthlings[0];
		newEarthlings[1] = earthlings[1];

		for (i = 0; i < 24; ++i)
		{
			levelMap[i] = (i+2);
			newEarthlings[i+2] = [];
		}

		/*
		 * Place good earthlings up-front, because we want at most
		 * one (of each type) per level.
		 */
		GOOD_EARTHLINGS.forEach(function(id) {
			shuffleArray(levelMap, rng);
			var levels = levelMap.slice(0, earthlingCounts[id]);
			levels.forEach(function (lvl) {
				newEarthlings[lvl].push(id);
			});
			/* clear the count */
			earthlingCounts[id] = 0;
		});

		/*
		 * Now place the rest.
		 */
		for (i = 0; i < 25; ++i) {
			for (j = 0; j < earthlingCounts[i]; ++j) {
				do {
					level = (rng.random() % 24) + 2;
				} while (newEarthlings[level].length >= 20);
				newEarthlings[level].push(i);
			}
		}

		for (level = 0; level < 26; ++level) {
			newEarthlings[level].sort((a,b) => a-b);
			while (newEarthlings[level].length < 20) {
				newEarthlings[level].push(255);
			}
			newEarthlings[level].reverse();
		}

		earthlings = newEarthlings;
	}

	tjeRom.setEarthlingPlacement(earthlings);
}

function generateStartingInventory(tjeRom, options, rng)
{
	var type = options.startingInventory;
	var i;
	var MYSTERY_PRESENT = 0x1A;
	var BONUS_PRESENT = 0x1B;

	if (type == "original")
	{
		return;
	}
	else if (type == "mystery")
	{
		tjeRom.setStartingInventory([MYSTERY_PRESENT,
					     MYSTERY_PRESENT,
					     MYSTERY_PRESENT,
					     MYSTERY_PRESENT]);
	}
	else if (type == "random")
	{
		var inventory = [];
		for (i = 0; i < 4; ++i)
			inventory[i] = tjeRom.chooseRandomPresent(rng);
		tjeRom.setStartingInventory(inventory);
	}
	else if (type == "randombonus")
	{
		tjeRom.setStartingInventory([BONUS_PRESENT,
					     BONUS_PRESENT,
					     BONUS_PRESENT,
					     BONUS_PRESENT]);
		var bonusPresent;
		do {
			bonusPresent = tjeRom.chooseRandomPresent(rng);
		} while (bonusPresent >= MYSTERY_PRESENT);
		var presentSprite = rng.random() % 3;

		tjeRom.setBonusPresent(bonusPresent, presentSprite);
	}
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

function gameOptionsFromForm()
{
	var seed = document.getElementById('seed').value;
	var levelTypes = document.getElementById('leveltypes').value;
	var earthlingLevels = document.getElementById('earthlinglevels').value;
	var startingInventory = document.getElementById('startinginventory').value;

	if (["original", "shuffled", "randomized"].indexOf(levelTypes) == -1)
		levelTypes = "original";
	if (["original", "shuffled", "randomized"].indexOf(earthlingLevels) == -1)
		earthlingLevels = "original";
	if (["original", "mystery", "random", "randombonus"].indexOf(startingInventory) == -1)
		startingInventory = "original";

	var options = {
		'levelTypes': levelTypes,
		'earthlingLevels': earthlingLevels,
		'startingInventory': startingInventory
	};

	return options;
}

function patchROM(arrayBuffer, romRevision, seedStr)
{
	var i;

	var options = gameOptionsFromForm();

	var seedOctets = computeOctetsFromSeedInput(seedStr);
	var seedName = bytesToString(seedOctets);
	var seedFilePart = seedNameToFilePart(seedName);
	var rng = new SeededRNG(crc32(seedOctets));

	var tjeRom = new TjeRom(loadedROM);

	/* apply new level seeds */
	var levelSeeds = generateLevelSeeds(rng);
	tjeRom.setLevelSeeds(levelSeeds);

	/* apply new ship piece locations */
	var shipPieces = generateShipPieces(rng);
	tjeRom.setShipPieceFloors(shipPieces);

	generateLevelTypes(tjeRom, options, rng);
	generateEarthlingPlacement(tjeRom, options, rng);
	generateStartingInventory(tjeRom, options, rng);

	/* now, fix up the menu */
	tjeRom.updateMenu(seedName);
	tjeRom.updateChecksum();

	var outputRom = new Blob([arrayBuffer], {type:"application/x-mega-drive-rom"});
	saveAs(outputRom, "TJE_seed_" + seedFilePart + "_R" + romRevision + "V" + SEEDER_VERSION + ".smd");
	attemptReloadOfROM();
}

function generateNewROM()
{
	/* no rom loaded, nothing to do */
	if (loadedROM == null)
		return;

	var inputSeed = document.getElementById('seed').value;
	window.location.hash = '!' + inputSeed;
	patchROM(loadedROM.data, loadedROM.product_revision, inputSeed);

	return false;
}

function generateNewSeed()
{
	var seed = generateInitialSeed();
	document.getElementById('seed').value = seed;
	window.location.hash = '!' + seed;
}

function main()
{
	document.getElementById('pid').style.display = 'none';
	document.getElementById('pcrc').style.display = 'none';
	setOptionDisplay('none');
	document.getElementById('romfile').addEventListener('change', romFileChanged);
	document.getElementById('randomize').addEventListener('click', generateNewSeed);
	document.getElementById('generate').addEventListener('click', generateNewROM)

	if (window.location.hash && window.location.hash.length > 1) {
		var init_seed = window.location.hash.replace("#!", "");
		document.getElementById('seed').value = init_seed;
	}

	attemptReloadOfROM();
}

window.addEventListener('DOMContentLoaded', function (event) { main(); });
