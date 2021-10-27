export type BinaryOperator =
	| "+"
	| "-"
	| "*"
	| "/"
	| "^"
	| "%"
	| ".."
	| "<"
	| "<="
	| ">"
	| ">="
	| "=="
	| "~="
	| "and"
	| "or";

export type UnaryOperator = "-" | "not" | "#";

export type AssignmentOperator = "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "^=" | "..=";

export interface NodeSource {
	sourceFile: string;
	line: number;
	character: number;
}
