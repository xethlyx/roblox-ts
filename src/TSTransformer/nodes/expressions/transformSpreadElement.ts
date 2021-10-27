import luau from "LuauAST";
import { errors } from "Shared/diagnostics";
import { assert } from "Shared/util/assert";
import { TransformState } from "TSTransformer";
import { DiagnosticService } from "TSTransformer/classes/DiagnosticService";
import { transformExpression } from "TSTransformer/nodes/expressions/transformExpression";
import { getAddIterableToArrayBuilder } from "TSTransformer/util/getAddIterableToArrayBuilder";
import { isArrayType, isDefinitelyType } from "TSTransformer/util/types";
import { validateNotAnyType } from "TSTransformer/util/validateNotAny";
import ts from "typescript";

export function transformSpreadElement(state: TransformState, node: ts.SpreadElement) {
	validateNotAnyType(state, node.expression);

	// array literal is caught and handled separately in transformArrayLiteralExpression.ts
	assert(!ts.isArrayLiteralExpression(node.parent) && node.parent.arguments);
	if (node.parent.arguments[node.parent.arguments.length - 1] !== node) {
		DiagnosticService.addDiagnostic(errors.noPrecedingSpreadElement(node));
	}

	const expression = transformExpression(state, node.expression);

	const nodeSource = luau.getNodeSource(node);
	const type = state.getType(node.expression);
	if (isDefinitelyType(type, t => isArrayType(state, t))) {
		return luau.call(luau.globals.unpack, [expression], nodeSource);
	} else {
		const addIterableToArrayBuilder = getAddIterableToArrayBuilder(state, node.expression, type);
		const arrayId = state.pushToVar(luau.array([], nodeSource), "array");
		const lengthId = state.pushToVar(luau.number(0, nodeSource), "length");
		state.prereqList(addIterableToArrayBuilder(state, expression, arrayId, lengthId, 0, false));
		return luau.call(luau.globals.unpack, [arrayId], nodeSource);
	}
}
