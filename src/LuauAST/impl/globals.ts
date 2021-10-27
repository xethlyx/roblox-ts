import * as luau from "LuauAST/bundle";

// Ugly hack for now - this will be wiped in the sourcemaps
// I should come up with a long-term solution
const GLOBAL_NODE_SOURCE: luau.NodeSource = {
	sourceFile: "internal",
	character: 0,
	line: 0,
};

export const globalId = (id: string) => luau.id(id, GLOBAL_NODE_SOURCE);
export const globalString = (id: string) => luau.string(id, GLOBAL_NODE_SOURCE);
export const globalProperty = (
	expression: luau.IndexableExpression<keyof luau.IndexableExpressionByKind>,
	name: string,
) => luau.property(expression, name, GLOBAL_NODE_SOURCE);

const COROUTINE_ID = globalId("coroutine");
const MATH_ID = globalId("math");
const STRING_ID = globalId("string");
const TABLE_ID = globalId("table");
const UTF8_ID = globalId("utf8");

export const globals = {
	TS: globalId("TS"),
	_G: globalId("_G"),
	assert: globalId("assert"),
	bit32: globalId("bit32"),
	coroutine: {
		yield: globalProperty(COROUTINE_ID, "yield"),
	},
	error: globalId("error"),
	exports: globalId("exports"),
	getmetatable: globalId("getmetatable"),
	ipairs: globalId("ipairs"),
	next: globalId("next"),
	pairs: globalId("pairs"),
	pcall: globalId("pcall"),
	require: globalId("require"),
	script: globalId("script"),
	select: globalId("select"),
	self: globalId("self"),
	setmetatable: globalId("setmetatable"),
	string: {
		byte: globalProperty(STRING_ID, "byte"),
		find: globalProperty(STRING_ID, "find"),
		format: globalProperty(STRING_ID, "format"),
		gmatch: globalProperty(STRING_ID, "gmatch"),
		gsub: globalProperty(STRING_ID, "gsub"),
		lower: globalProperty(STRING_ID, "lower"),
		match: globalProperty(STRING_ID, "match"),
		rep: globalProperty(STRING_ID, "rep"),
		reverse: globalProperty(STRING_ID, "reverse"),
		split: globalProperty(STRING_ID, "split"),
		sub: globalProperty(STRING_ID, "sub"),
		upper: globalProperty(STRING_ID, "upper"),
	},
	super: globalId("super"),
	table: {
		clear: globalProperty(TABLE_ID, "clear"),
		concat: globalProperty(TABLE_ID, "concat"),
		create: globalProperty(TABLE_ID, "create"),
		find: globalProperty(TABLE_ID, "find"),
		insert: globalProperty(TABLE_ID, "insert"),
		move: globalProperty(TABLE_ID, "move"),
		remove: globalProperty(TABLE_ID, "remove"),
		sort: globalProperty(TABLE_ID, "sort"),
	},
	utf8: {
		charpattern: globalProperty(UTF8_ID, "charpattern"),
		codes: globalProperty(UTF8_ID, "codes"),
	},
	math: {
		min: globalProperty(MATH_ID, "min"),
	},
	tostring: globalId("tostring"),
	type: globalId("type"),
	typeof: globalId("typeof"),
	unpack: globalId("unpack"),

	// roblox
	game: globalId("game"),
};
