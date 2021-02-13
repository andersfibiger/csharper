import * as vscode from 'vscode';

export const getConstructorDependencies = async (uri: vscode.Uri, constructorName: string): Promise<string[]> => {
  const fileContent = (await vscode.workspace.openTextDocument(uri)).getText()

  const constructorStartPosition = fileContent.indexOf(`${constructorName}(`) + 1;

  const startOfConstructor = fileContent.substring(constructorStartPosition + constructorName.length)
  const constructorEndPosition = startOfConstructor.indexOf(')');

  const constructorParameters = startOfConstructor.substr(0, constructorEndPosition);

  const dependencies = constructorParameters
    .split(',')
    .map(p => p.trim().split(' ')[0]);

  return dependencies;
}

export const getConstructorName = (document: vscode.TextDocument, range: vscode.Range | vscode.Selection): string => {
  const lineText = document.getText(new vscode.Range(range.start.line, 0, range.start.line, range.start.character));

  let name = lineText.split(' ').splice(-2)[0];

  if (name.startsWith('I'))
    name = name.substr(1, name.length);

  return name;
}

export const getFileUriFromConstructor = async (constructorName: string): Promise<vscode.Uri | undefined> => {
  const files = await vscode.workspace.findFiles(new vscode.RelativePattern(vscode.workspace.workspaceFolders![0], `**/${constructorName}.cs`));

  if (files.length === 0)
    return;
  
  let chosenFile: vscode.Uri;
  if (files.length > 1) {
    const fileNames = files.map(formatFileNames);

    const chosenFileName = await vscode.window.showQuickPick(fileNames, { canPickMany: false });
    if (!chosenFileName)
      return;

    chosenFile = files.find(x => x.path.indexOf(chosenFileName) !== -1)!;
  }
  else {
    chosenFile = files[0];
  }

  return chosenFile;
}

const formatFileNames = (fileUri: vscode.Uri): string => {
  const startIndexOfFileNames = fileUri.path.lastIndexOf(vscode.workspace.workspaceFolders![0].name);
  return fileUri.path.substr(startIndexOfFileNames);
}