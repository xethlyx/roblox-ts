import luau from "LuauAST";
import { assert } from "Shared/util/assert";
import { TransformState } from "TSTransformer";
import { transformExpression } from "TSTransformer/nodes/expressions/transformExpression";
import { ensureTransformOrder } from "TSTransformer/util/ensureTransformOrder";
import { getAddIterableToArrayBuilder } from "TSTransformer/util/getAddIterableToArrayBuilder";
import { createArrayPointer, disableArrayInline } from "TSTransformer/util/pointer";
import ts from "typescript";

export function transformArrayLiteralExpression(state: TransformState, node: ts.ArrayLiteralExpression) {
	const nodeSource = luau.getNodeSource(node);

	if (!node.elements.find(element => ts.isSpreadElement(element))) {
		return luau.array(ensureTransformOrder(state, node.elements), nodeSource);
	}

	const ptr = createArrayPointer("array");
	const lengthId = luau.tempId("length", nodeSource);
	let lengthInitialized = false;
	let amtElementsSinceUpdate = 0;

	function updateLengthId() {
		const right = luau.unary("#", ptr.value, nodeSource);
		if (lengthInitialized) {
			state.prereq(
				luau.create(
					luau.SyntaxKind.Assignment,
					{
						left: lengthId,
						operator: "=",
						right,
					},
					nodeSource,
				),
			);
		} else {
			state.prereq(
				luau.create(
					luau.SyntaxKind.VariableDeclaration,
					{
						left: lengthId,
						right,
					},
					nodeSource,
				),
			);
			lengthInitialized = true;
		}
		amtElementsSinceUpdate = 0;
	}

	for (let i = 0; i < node.elements.length; i++) {
		const element = node.elements[i];
		if (ts.isSpreadElement(element)) {
			if (luau.isArray(ptr.value)) {
				disableArrayInline(state, ptr);
				updateLengthId();
			}
			assert(luau.isAnyIdentifier(ptr.value));

			const type = state.getType(element.expression);
			const addIterableToArrayBuilder = getAddIterableToArrayBuilder(state, element.expression, type);
			const spreadExp = transformExpression(state, element.expression);
			const shouldUpdateLengthId = i < node.elements.length - 1;
			state.prereqList(
				addIterableToArrayBuilder(
					state,
					spreadExp,
					ptr.value,
					lengthId,
					amtElementsSinceUpdate,
					shouldUpdateLengthId,
				),
			);
		} else {
			const [expression, prereqs] = state.capture(() => transformExpression(state, element));
			if (luau.isArray(ptr.value) && !luau.list.isEmpty(prereqs)) {
				disableArrayInline(state, ptr);
				updateLengthId();
			}
			if (luau.isArray(ptr.value)) {
				luau.list.push(ptr.value.members, expression);
			} else {
				state.prereqList(prereqs);
				state.prereq(
					luau.create(
						luau.SyntaxKind.Assignment,
						{
							left: luau.create(
								luau.SyntaxKind.ComputedIndexExpression,
								{
									expression: ptr.value,
									index: luau.binary(
										lengthId,
										"+",
										luau.number(amtElementsSinceUpdate + 1, nodeSource),
										nodeSource,
									),
								},
								nodeSource,
							),
							operator: "=",
							right: expression,
						},
						nodeSource,
					),
				);
			}
			amtElementsSinceUpdate++;
		}
	}

	return ptr.value;
}
