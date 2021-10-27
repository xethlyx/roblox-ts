import * as luau from "LuauAST/bundle";

export const strings = {
	// metamethods
	__index: luau.globalString("__index"),
	__tostring: luau.globalString("__tostring"),
	__mode: luau.globalString("__mode"),
	k: luau.globalString("k"), // used for __mode

	// types
	number: luau.globalString("number"),
	table: luau.globalString("table"),

	// opcall
	success: luau.globalString("success"),
	value: luau.globalString("value"),
	error: luau.globalString("error"),

	// other
	", ": luau.globalString(", "), // used for ReadonlyArray.join()
};
