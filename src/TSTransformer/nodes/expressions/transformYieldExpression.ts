import luau from "LuauAST";
import { TransformState } from "TSTransformer/classes/TransformState";
import { transformExpression } from "TSTransformer/nodes/expressions/transformExpression";
import { convertToIndexableExpression } from "TSTransformer/util/convertToIndexableExpression";
import ts from "typescript";

export function transformYieldExpression(state: TransformState, node: ts.YieldExpression) {
	const nodeSource = luau.getNodeSource(node);

	if (!node.expression) {
		return luau.call(luau.globals.coroutine.yield, [], nodeSource);
	}

	const expression = transformExpression(state, node.expression);
	if (node.asteriskToken) {
		const loopId = luau.tempId("result", nodeSource);
		state.prereq(
			luau.create(
				luau.SyntaxKind.ForStatement,
				{
					ids: luau.list.make(loopId),
					expression: luau.property(convertToIndexableExpression(expression), "next", nodeSource),
					statements: luau.list.make<luau.Statement>(
						luau.create(
							luau.SyntaxKind.IfStatement,
							{
								condition: luau.property(loopId, "done", nodeSource),
								statements: luau.list.make(luau.create(luau.SyntaxKind.BreakStatement, {}, nodeSource)),
								elseBody: luau.list.make(),
							},
							nodeSource,
						),
						luau.create(
							luau.SyntaxKind.CallStatement,
							{
								expression: luau.call(
									luau.globals.coroutine.yield,
									[luau.property(loopId, "value", nodeSource)],
									nodeSource,
								),
							},
							nodeSource,
						),
					),
				},
				nodeSource,
			),
		);

		return luau.nil(nodeSource);
	} else {
		return luau.call(luau.globals.coroutine.yield, [expression], nodeSource);
	}
}
