import luau from "LuauAST";
import { TransformState } from "TSTransformer";
import ts from "typescript";

export function transformTrueKeyword(state: TransformState, node: ts.TrueLiteral) {
	return luau.create(luau.SyntaxKind.TrueLiteral, {}, luau.getNodeSource(node));
}

export function transformFalseKeyword(state: TransformState, node: ts.TrueLiteral) {
	return luau.create(luau.SyntaxKind.FalseLiteral, {}, luau.getNodeSource(node));
}
