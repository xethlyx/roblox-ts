import luau from "LuauAST";
import { errors } from "Shared/diagnostics";
import { DiagnosticService } from "TSTransformer/classes/DiagnosticService";
import { TransformState } from "TSTransformer/classes/TransformState";
import { createImportExpression } from "TSTransformer/util/createImportExpression";
import ts from "typescript";

export function transformImportExpression(state: TransformState, node: ts.CallExpression) {
	const moduleSpecifier = node.arguments[0];
	const nodeSource = luau.getNodeSource(node);

	if (!moduleSpecifier || !ts.isStringLiteral(moduleSpecifier)) {
		DiagnosticService.addDiagnostic(errors.noNonStringModuleSpecifier(node));
		return luau.emptyId(nodeSource);
	}

	const importExpression = createImportExpression(state, node.getSourceFile(), moduleSpecifier);
	const resolveId = luau.id("resolve", nodeSource);

	return luau.call(
		luau.property(state.TS(node, "Promise"), "new", nodeSource),
		[
			luau.create(
				luau.SyntaxKind.FunctionExpression,
				{
					hasDotDotDot: false,
					parameters: luau.list.make(resolveId),
					statements: luau.list.make(
						luau.create(
							luau.SyntaxKind.CallStatement,
							{
								expression: luau.call(resolveId, [importExpression], nodeSource),
							},
							nodeSource,
						),
					),
				},
				nodeSource,
			),
		],
		nodeSource,
	);
}
