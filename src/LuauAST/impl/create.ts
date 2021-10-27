// helper creation
import * as luau from "LuauAST/bundle";
import { NodeSource } from "LuauAST/bundle";

type AllowedFieldTypes = luau.Node | luau.List<luau.Node> | boolean | number | string | undefined;
type FilterProps<T, U> = { [K in keyof T]: T[K] extends U ? T[K] : never };
type FilteredNodeByKind<T extends keyof luau.NodeByKind> = FilterProps<luau.NodeByKind[T], AllowedFieldTypes>;

// creation
export function create<T extends keyof luau.NodeByKind>(
	kind: T,
	fields: {
		[K in Exclude<keyof FilteredNodeByKind<T>, keyof luau.Node>]: FilteredNodeByKind<T>[K];
	},
	source: NodeSource,
): luau.NodeByKind[T] {
	// super hack!
	const node = Object.assign({ kind }, fields) as unknown as luau.NodeByKind[T];
	node.source = source;

	for (const [key, value] of Object.entries(fields)) {
		if (luau.isNode(value)) {
			if (value.parent) {
				const clone: luau.Node = { ...value };
				clone.parent = node;
				node[key as never] = clone as never;
			} else {
				value.parent = node;
			}
		} else if (luau.list.isList(value)) {
			luau.list.forEachListNode(value, listNode => {
				if (listNode.value.parent) {
					const clone: luau.Node = { ...listNode.value };
					clone.parent = node;
					listNode.value = clone;
				} else {
					listNode.value.parent = node;
				}
			});
		}
	}

	return node;
}

let lastTempId = 0;

/**
 * Creates a new temporary identifier for a node.
 */
export function tempId(name = "", source: NodeSource) {
	return luau.create(luau.SyntaxKind.TemporaryIdentifier, { name, id: lastTempId++ }, source);
}

/**
 * Creates a new empty identifier '_' for a node.
 */
export function emptyId(source: NodeSource) {
	return luau.create(luau.SyntaxKind.EmptyIdentifier, {}, source);
}

/**
 * Creates a new `nil` literal node.
 */
export function nil(source: NodeSource) {
	return luau.create(luau.SyntaxKind.NilLiteral, {}, source);
}

/**
 * Creates a new `boolean` literal node.
 * @param value The value of the boolean literal.
 */
export function bool(value: boolean, source: NodeSource) {
	if (value) {
		return luau.create(luau.SyntaxKind.TrueLiteral, {}, source);
	} else {
		return luau.create(luau.SyntaxKind.FalseLiteral, {}, source);
	}
}

/**
 * Creates a new `number` literal node.
 * @param value The number to make
 */
export function number(value: number, source: NodeSource): luau.Expression {
	if (value >= 0) {
		return luau.create(luau.SyntaxKind.NumberLiteral, { value: String(value) }, source);
	} else {
		return luau.create(
			luau.SyntaxKind.UnaryExpression,
			{
				operator: "-",
				expression: luau.number(Math.abs(value), source),
			},
			source,
		);
	}
}

/**
 * Creates a new `string` literal node.
 * @param value The value of the string
 */
export function string(value: string, source: NodeSource) {
	return luau.create(luau.SyntaxKind.StringLiteral, { value }, source);
}

/**
 * Creates a new identifier node.
 * @param name The name of the identifier.
 */
export function id(name: string, source: NodeSource) {
	return luau.create(luau.SyntaxKind.Identifier, { name }, source);
}

/**
 * Creates a new comment node.
 * @param text The text of the comment
 */
export function comment(text: string, source: NodeSource) {
	return luau.create(luau.SyntaxKind.Comment, { text }, source);
}

/**
 * Creates a new array node.
 * @param members The `luau.Expression` nodes of the new array.
 */
export function array(members: Array<luau.Expression> = [], source: NodeSource) {
	return luau.create(
		luau.SyntaxKind.Array,
		{
			members: luau.list.make(...members),
		},
		source,
	);
}

/**
 * Creates a new set node.
 * @param members The `luau.Expression` nodes of the new set.
 */
export function set(members: Array<luau.Expression> = [], source: NodeSource) {
	return luau.create(
		luau.SyntaxKind.Set,
		{
			members: luau.list.make(...members),
		},
		source,
	);
}

/**
 * Creates a new map node.
 * @param fields The array of key-value mappings.
 */
export function map(fields: Array<[luau.Expression, luau.Expression]> = [], source: NodeSource) {
	return luau.create(
		luau.SyntaxKind.Map,
		{
			fields: luau.list.make(
				...fields.map(([index, value]) =>
					luau.create(luau.SyntaxKind.MapField, { index, value }, index.source),
				),
			),
		},
		source,
	);
}

/**
 * Creates a new mixed table node.
 * @param fields The array of either value or key-value mappings.
 */
export function mixedTable(
	fields: Array<luau.Expression | [luau.Expression, luau.Expression]> = [],
	source: NodeSource,
) {
	return luau.create(
		luau.SyntaxKind.MixedTable,
		{
			fields: luau.list.make(
				...fields.map(field => {
					if (Array.isArray(field)) {
						return luau.create(
							luau.SyntaxKind.MapField,
							{ index: field[0], value: field[1] },
							field[0].source,
						);
					} else {
						return field;
					}
				}),
			),
		},
		source,
	);
}

export function binary(
	left: luau.Expression,
	operator: luau.BinaryOperator,
	right: luau.Expression,
	source: NodeSource,
) {
	return luau.create(luau.SyntaxKind.BinaryExpression, { left, operator, right }, source);
}

export function unary(operator: luau.UnaryOperator, expression: luau.Expression, source: NodeSource) {
	return luau.create(luau.SyntaxKind.UnaryExpression, { operator, expression }, source);
}

export function property(expression: luau.IndexableExpression, name: string, source: NodeSource) {
	return luau.create(luau.SyntaxKind.PropertyAccessExpression, { expression, name }, source);
}

export function call(expression: luau.IndexableExpression, args: Array<luau.Expression> = [], source: NodeSource) {
	return luau.create(
		luau.SyntaxKind.CallExpression,
		{
			expression,
			args: luau.list.make(...args),
		},
		source,
	);
}
