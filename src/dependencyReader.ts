import * as vscode from 'vscode';
import { replaceCharacter } from './helpers/charReplacer';
import { getDependencyType } from './helpers/dependencyTypeHelper';

export const getConstructorDependencies = async (constructorName: string, fileUri: vscode.Uri): Promise<string[]> => {
  let constructorParameters = await getConstructorParameters(constructorName, fileUri);
  constructorParameters = replaceCharacter(constructorParameters, ',');

  return getDependencyTypes(constructorParameters);
}

const getConstructorParameters = async (constructorName: string, fileUri: vscode.Uri): Promise<string> => {
  const fileContent = (await vscode.workspace.openTextDocument(fileUri)).getText();

  const constructorStartPosition = fileContent.indexOf(`${constructorName}(`) + 1;
  const startOfConstructor = fileContent.substring(constructorStartPosition + constructorName.length)
  const constructorEndPosition = startOfConstructor.indexOf(')');

  return startOfConstructor.substr(0, constructorEndPosition).trim();
}

const getDependencyTypes = (parameters: string): string[] => {
  return parameters
    .split('-')
    .map(p => {
      const depedency = getDependencyType(p);
      return replaceCharacter(depedency, '-');
    });
}