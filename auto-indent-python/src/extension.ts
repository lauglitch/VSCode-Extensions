import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.autoIndentPython",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor found!");
        return;
      }

      const selection = editor.selection;
      if (selection.isEmpty) {
        vscode.window.showWarningMessage("No text selected.");
        return;
      }

      const selectedText = editor.document.getText(selection);
      const indentedText = autoIndentPython(selectedText);

      editor.edit((editBuilder) => {
        editBuilder.replace(selection, indentedText);
      });
    }
  );

  context.subscriptions.push(disposable);
}

export function autoIndentPython(code: string): string {
  const lines = code.split("\n");
  let formattedCode = "";
  let currentIndentLevel = 0;
  let lastIndentLevel = 0;
  let lastLine = "";
  let penultimateLine = "";

  const controlKeywords = ["if", "for", "while", "try", "with", "def", "class"];
  const forkKeywords = ["elif", "else", "except", "finally"];
  const mainKeywords = ["def", "class"];

  function adjustIndentation(
    line: string,
    lastLine: string,
    lastIndentLevel: number
  ): number {
    if (forkKeywords.some((keyword) => line.startsWith(keyword))) {
      return Math.max(lastIndentLevel - 1, 0);
    } else if (forkKeywords.some((keyword) => lastLine.startsWith(keyword))) {
      return lastIndentLevel + 1;
    } else if (lastLine.startsWith("#") || lastLine.startsWith("@")) {
      return lastIndentLevel;
    } else if (
      controlKeywords.some(
        (keyword) =>
          lastLine.startsWith(keyword) && lastLine.trim().endsWith(":")
      )
    ) {
      return lastIndentLevel + 1;
    } else if (
      lastLine.startsWith("except") &&
      !forkKeywords.some((keyword) => line.startsWith(keyword))
    ) {
      return lastIndentLevel + 1;
    }
    return lastIndentLevel;
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (lastLine === "" && penultimateLine === "") {
      currentIndentLevel = 0;
    } else if (lastLine === "" && penultimateLine !== "") {
      if (mainKeywords.some((keyword) => line.startsWith(keyword))) {
        currentIndentLevel = 0;
      } else {
        currentIndentLevel = Math.max(lastIndentLevel - 1, 0);
      }
    } else if (line !== "") {
      currentIndentLevel = adjustIndentation(line, lastLine, lastIndentLevel);
    } else {
      currentIndentLevel = lastIndentLevel;
    }

    formattedCode += " ".repeat(currentIndentLevel * 4) + line + "\n";

    lastIndentLevel = currentIndentLevel;
    penultimateLine = lastLine;
    lastLine = line;
  }

  return formattedCode;
}

export function deactivate() {}
