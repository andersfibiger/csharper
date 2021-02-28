import * as vscode from 'vscode';
import { UnitUnderTest } from './models/types';

export const handleParametersNames = (parameters: string) => {
  const index = parameters.indexOf('<');
  if (index !== -1) {
    return parameters.substring(0, index)
  }

  return parameters;
}

export const getUnitUnderTest = (document: vscode.TextDocument, range: vscode.Range | vscode.Selection): UnitUnderTest | undefined => {
  if (document.fileName.indexOf('Test') === -1) {
    return;
  }

  const line = document.lineAt(range.start.line);
  if (line.isEmptyOrWhitespace) {
    return;
  }

  let uut = line.text.split(' ').splice(-2);
  let type = uut[0];

  if (type.startsWith('I') && type.charAt(1) === type.charAt(1).toUpperCase())
    type = type.substr(1, type.length);

  return {
    type: type,
    name: uut[1].slice(0, -1)
  };
}

export const getCurrentFileConstructor = (document: vscode.TextDocument) => {
  const text = document.getText();
  const classNameStartIndex = text.indexOf('class') + 6;
  return text.substr(classNameStartIndex).split(' ')[0].trimEnd();
}

export const getFileUriFromType = async (constructorName: string): Promise<vscode.Uri | undefined> => {
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

export const getIndentation = () => {
  const tabSize = vscode.window.activeTextEditor?.options.tabSize;
  if (!tabSize || typeof (tabSize) === 'string') {
    return Array(5).join(' ');
  }

  return Array((tabSize * 2) + 1).join(' ');
}

const formatFileNames = (fileUri: vscode.Uri): string => {
  const startIndexOfFileNames = fileUri.path.lastIndexOf(vscode.workspace.workspaceFolders![0].name);
  return fileUri.path.substr(startIndexOfFileNames);
}

export const getUsingStatements = async (uri: vscode.Uri) => {
  var text = (await vscode.workspace.openTextDocument(uri)).getText();

  const index = text.indexOf('namespace');
  text = text.substring(0, index).trim();

  const usingStatements = text.split('\n')
  usingStatements.forEach((statement, index, statements) => statements[index] = statement.trimEnd());

  return usingStatements;
}