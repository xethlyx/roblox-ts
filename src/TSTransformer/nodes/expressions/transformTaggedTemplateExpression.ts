import luau from "LuauAST";
import { TransformState } from "TSTransformer";
import { transformExpression } from "TSTransformer/nodes/expressions/transformExpression";
import { convertToIndexableExpression } from "TSTransformer/util/convertToIndexableExpression";
import { ensureTransformOrder } from "TSTransformer/util/ensureTransformOrder";
import ts from "typescript";

export function transformTaggedTemplateExpression(state: TransformState, node: ts.TaggedTemplateExpression) {
	const tagExp = transformExpression(state, node.tag);
	const nodeSource = luau.getNodeSource(node);

	if (ts.isTemplateExpression(node.template)) {
		const strings = new Array<luau.Expression>();
		strings.push(luau.string(node.template.head.text, nodeSource));
		for (const templateSpan of node.template.templateSpans) {
			strings.push(luau.string(templateSpan.literal.text, nodeSource));
		}

		const expressions = ensureTransformOrder(
			state,
			node.template.templateSpans.map(templateSpan => templateSpan.expression),
		);

		return luau.call(
			convertToIndexableExpression(tagExp),
			[luau.array(strings, nodeSource), ...expressions],
			nodeSource,
		);
	} else {
		return luau.call(
			convertToIndexableExpression(tagExp),
			[luau.array([luau.string(node.template.text, nodeSource)], nodeSource)],
			nodeSource,
		);
	}
}
