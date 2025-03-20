export function autoIndentPython(code: string): string {
  const lines = code.split("\n");
  let formattedCode = "";
  let currentIndentLevel = 0;
  let lastIndentLevel = 0;
  let lastLine = "";
  let penultimateLine = "";
  let lastLineWasBlank = false;

  const controlKeywords = ["if", "for", "while", "try", "with", "def", "class"];
  const forkKeywords = ["elif", "else", "except", "finally"];
  const mainKeywords = ["def", "class"];

  function adjustIndentation(
    line: string,
    lastLine: string,
    lastIndentLevel: number
  ): number {
    // If it's a fork (elif, else, except, finally), place it at the level of the previous block
    if (forkKeywords.some((keyword) => line.startsWith(keyword))) {
      return Math.max(lastIndentLevel - 1, 0);
    }
    // If the previous line was a fork, increase indentation
    else if (forkKeywords.some((keyword) => lastLine.startsWith(keyword))) {
      return lastIndentLevel + 1;
    }
    // If the previous line was a comment, maintain indentation
    else if (lastLine.startsWith("#") || lastLine.startsWith("@")) {
      return lastIndentLevel;
    }
    // If the previous line was a control structure, increase indentation
    else if (
      controlKeywords.some(
        (keyword) =>
          lastLine.startsWith(keyword) && lastLine.trim().endsWith(":")
      )
    ) {
      return lastIndentLevel + 1;
    }
    // If the previous line was `except`, and this line is not another `except`, `else`, etc., increase indentation
    else if (
      lastLine.startsWith("except") &&
      !forkKeywords.some((keyword) => line.startsWith(keyword))
    ) {
      return lastIndentLevel + 1;
    }
    // Default case: maintain the previous indentation
    return lastIndentLevel;
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // If there are two consecutive blank lines, reset indentation
    if (lastLine === "" && penultimateLine === "") {
      currentIndentLevel = 0;
    }
    // If the previous line is blank but not the one before
    else if (lastLine === "" && penultimateLine !== "") {
      // Reset indentation for function and class declarations
      if (mainKeywords.some((keyword) => line.startsWith(keyword))) {
        currentIndentLevel = 0;
      }
      // Decrease indentation for everything else
      else {
        currentIndentLevel = Math.max(lastIndentLevel - 1, 0);
      }
    }
    // If the current line is not empty
    else if (line !== "") {
      currentIndentLevel = adjustIndentation(line, lastLine, lastIndentLevel);
    }
    // Default case: maintain previous indentation
    else {
      currentIndentLevel = lastIndentLevel;
    }

    formattedCode += " ".repeat(currentIndentLevel * 4) + line + "\n";

    lastLineWasBlank = line === "";
    lastIndentLevel = currentIndentLevel;
    penultimateLine = lastLine;
    lastLine = line;
  }

  return formattedCode;
}
