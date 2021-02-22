import * as vscode from 'vscode';
import { ICharReplacer } from './helpers/charReplacer';
import { IDependencyTypeHelper } from './helpers/dependencyTypeHelper';

export interface IDependencyReader {
  getConstructorDependencies(constructorName: string, fileUri: vscode.Uri): Promise<string[]>;
}

export class DependencyReader {
  private _fileContent: string | undefined;

  public constructor(
    private charReplacer: ICharReplacer,
    private dependencyTypeHelper: IDependencyTypeHelper) { }

  public async getConstructorDependencies(constructorName: string, fileUri: vscode.Uri): Promise<string[]> {
    let constructorParameters = await this._getConstructorParameters(constructorName, fileUri);
    constructorParameters = this.charReplacer.replaceCharacter(constructorParameters, ',');

    return this._getDependencyTypes(constructorParameters);
  }

  private async _getConstructorParameters(constructorName: string, fileUri: vscode.Uri): Promise<string> {
    this._fileContent = (await vscode.workspace.openTextDocument(fileUri)).getText();

    const constructorStartPosition = this._fileContent.indexOf(`${constructorName}(`) + 1;
    const startOfConstructor = this._fileContent.substring(constructorStartPosition + constructorName.length)
    const constructorEndPosition = startOfConstructor.indexOf(')');

    return startOfConstructor.substr(0, constructorEndPosition).trim();
  }

  private _getDependencyTypes(parameters: string): string[] {
    return parameters
      .split('-')
      .map(p => {
        const depedency = this.dependencyTypeHelper.get(p);
        return this.charReplacer.replaceCharacter(depedency, '-');
      });
  }
}