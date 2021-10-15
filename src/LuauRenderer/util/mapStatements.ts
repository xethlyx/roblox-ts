import { RenderState } from "LuauRenderer";

export function mapStatements(state: RenderState) {
	const result: Record<number, number> = {};

	for (const [node, luauPosition] of state.positionMapping.entries()) {
		if (node.source === undefined) continue;
		result[luauPosition] = node.source;
	}

	return JSON.stringify(result);
}
