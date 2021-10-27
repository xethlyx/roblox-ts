import { NodeSource } from "LuauAST/bundle";
import ts from "typescript";

export function getNodeSource(node: ts.Node): NodeSource {
	const sourceFile = node.getSourceFile();
	const { line, character } = ts.getLineAndCharacterOfPosition(sourceFile, node.pos);

	return { sourceFile: sourceFile.path, line, character };
}
