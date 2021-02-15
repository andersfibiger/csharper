import * as vscode from 'vscode';
import { UnitUnderTest } from './models/UnitUnderTest';

export const getConstructorDependencies = async (uri: vscode.Uri, constructorName: string): Promise<string[]> => {
  const fileContent = (await vscode.workspace.openTextDocument(uri)).getText()

  const constructorStartPosition = fileContent.indexOf(`${constructorName}(`) + 1;

  const startOfConstructor = fileContent.substring(constructorStartPosition + constructorName.length)
  const constructorEndPosition = startOfConstructor.indexOf(')');

  let constructorParameters = startOfConstructor.substr(0, constructorEndPosition);
  constructorParameters = handleMultiGenerics(constructorParameters, ',');

  const dependencies = constructorParameters
    .split(',')
    .map(p => {
      const param = p.trim().split(' ')[0];
      return handleMultiGenerics(param, '-');
    });

  return dependencies;
}

const handleMultiGenerics = (parameters: string, searchCharacter: searchCharacter) => {
  let expression;
  let replaceValue;
  if (searchCharacter == ',') {
    expression = `${searchCharacter} (?=[^\\<]*>)`;
    replaceValue = '-';
  }
  else {
    expression = `${searchCharacter}(?=[^\\<]*>)`;
    replaceValue = ', ';
  }

  const regex = new RegExp(expression, 'g');
  return parameters.replace(regex, replaceValue);
}

type searchCharacter = ',' | '-';

export const handleParametersNames = (parameters: string) => parameters.replace(/<(.*?)>/g, '');

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

  if (type.startsWith('I') && type.charAt(1) === type.charAt(1).toLowerCase())
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