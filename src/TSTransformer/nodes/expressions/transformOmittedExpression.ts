import luau from "LuauAST";
import { TransformState } from "TSTransformer";
import ts from "typescript";

export function transformOmittedExpression(state: TransformState, node: ts.OmittedExpression) {
	return luau.nil(luau.getNodeSource(node));
}
