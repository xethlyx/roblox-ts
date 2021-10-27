import luau from "LuauAST";
import { RenderState } from "LuauRenderer";

export function mapStatements(state: RenderState) {
	const result: Record<number, luau.NodeSource> = {};

	for (const [node, luauPosition] of state.positionMapping.entries()) {
		result[luauPosition] = node.source;
	}

	return JSON.stringify(result);
}
