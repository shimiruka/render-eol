import * as vscode from "vscode";

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
  let activeEditor = vscode.window.activeTextEditor;

  let lfCharacterDecorationType: vscode.TextEditorDecorationType;
  let crCharacterDecorationType: vscode.TextEditorDecorationType;
  let crlfCharacterDecorationType: vscode.TextEditorDecorationType;

  function updateDecorationTypes() {
    const config = vscode.workspace.getConfiguration("render-eol");
    const defaultColor = new vscode.ThemeColor("editorWhitespace.foreground");
    // Get color config. If blank, use same color as blank character.
    const lfColorConfig = config.get<string>("lfColor") || "";
    const lfColor = lfColorConfig === "" ? defaultColor : lfColorConfig;
    const crColorConfig = config.get<string>("crColor") || "";
    const crColor = crColorConfig === "" ? defaultColor : crColorConfig;
    const crlfColorConfig = config.get<string>("crlfColor") || "";
    const crlfColor = crlfColorConfig === "" ? defaultColor : crlfColorConfig;
    // Get character config.
    const lfCharacter = config.get<string>("lfCharacter") || "↓";
    const crCharacter = config.get<string>("crCharacter") || "←";
    const crlfCharacter = config.get<string>("crlfCharacter") || "↵";

    lfCharacterDecorationType?.dispose();
    lfCharacterDecorationType = vscode.window.createTextEditorDecorationType({
      after: {
        contentText: lfCharacter,
        color: lfColor,
      },
    });
    crCharacterDecorationType?.dispose();
    crCharacterDecorationType = vscode.window.createTextEditorDecorationType({
      before: {
        contentText: crCharacter,
        color: crColor,
      },
    });
    crlfCharacterDecorationType?.dispose();
    crlfCharacterDecorationType = vscode.window.createTextEditorDecorationType({
      before: {
        contentText: crlfCharacter,
        color: crlfColor,
      },
    });
  }
  updateDecorationTypes();

  function updateDecorations() {
    if (!activeEditor) {
      return;
    }
    const regEx = /\n|\r\n|\r/g;
    const text = activeEditor.document.getText();
    const lfCharacters: vscode.DecorationOptions[] = [];
    const crCharacters: vscode.DecorationOptions[] = [];
    const crlfCharacters: vscode.DecorationOptions[] = [];
    let match;
    while ((match = regEx.exec(text))) {
      const position = activeEditor.document.positionAt(match.index); // Only get startPos of eol character to display smoothly
      const decoration = { range: new vscode.Range(position, position) };
      if (match[0] === "\n") {
        lfCharacters.push(decoration);
      } else if (match[0] === "\r") {
        crCharacters.push(decoration);
      } else if (match[0] === "\r\n") {
        crlfCharacters.push(decoration);
      }
    }
    activeEditor.setDecorations(lfCharacterDecorationType, lfCharacters);
    activeEditor.setDecorations(crCharacterDecorationType, crCharacters);
    activeEditor.setDecorations(crlfCharacterDecorationType, crlfCharacters);
  }

  if (activeEditor) {
    updateDecorations();
  }

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (editor) {
        updateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        updateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeConfiguration(() => {
    updateDecorationTypes();
    updateDecorations();
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
