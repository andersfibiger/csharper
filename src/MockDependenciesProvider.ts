import * as vscode from 'vscode';
import { getConstructorDependencies, getUnitUnderTest, getCurrentFileConstructor, getFileUriFromType, getIndentation, handleParametersNames } from './helpers';
import { UnitUnderTest } from './models/types';

export class MockDependenciesProvider implements vscode.CodeActionProvider {

  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
  ];

  public async provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): Promise<vscode.CodeAction[]> {
    const codeAction = new vscode.CodeAction('Mock dependencies', vscode.CodeActionKind.QuickFix);
    codeAction.edit = new vscode.WorkspaceEdit();

    const uut = getUnitUnderTest(document, range);
    if (!uut) {
      return [];
    }

    const fileUri = await getFileUriFromType(uut.type);
    if (!fileUri) {
      return [];
    }

    const dependencies = await getConstructorDependencies(fileUri, uut.type);

    await this.mockDependencies(dependencies, document, range, codeAction.edit);
    await this.initializeMocks(dependencies, uut, document, range.start.line + dependencies.length + 1, codeAction.edit);

    return [
      codeAction
    ];
  }

  private async mockDependencies(dependencies: string[], document: vscode.TextDocument, range: vscode.Range, edit: vscode.WorkspaceEdit) {
    dependencies.forEach(dependency => {
      edit.insert(document.uri, range.start.translate(1), `${getIndentation()}${this.getMock(dependency)}`);
    });
  }

  private getMock = (dependency: string) => `private readonly Mock<${dependency}> ${this.getMockName(dependency)};\n`;

  private getMockName = (dependency: string) => {
    const name = handleParametersNames(dependency);
    return `_mock${name.substr(1, name.length)}`;
  } 

  private async initializeMocks(dependencies: string[], uut: UnitUnderTest, document: vscode.TextDocument, startLine: number, edit: vscode.WorkspaceEdit) {
    const constructorName = getCurrentFileConstructor(document);
    edit.insert(document.uri, new vscode.Position(startLine, 0), this.addConstructor(constructorName))

    dependencies.forEach(dependency => {
      edit.insert(document.uri, new vscode.Position(startLine, 0), `${getIndentation()}  ${this.getMockName(dependency)} = new Mock<${dependency}>();\n`);
    })

    edit.insert(document.uri, new vscode.Position(startLine, 0), this.initializeCtor(uut, dependencies.map(this.getMockName)));

    edit.insert(document.uri, new vscode.Position(startLine, 0), `\n${getIndentation()}}`);
  }

  private addConstructor = (constructorName: string) => `${getIndentation()}public ${constructorName}()\n${getIndentation()}{\n`;

  private initializeCtor = (uut: UnitUnderTest, mocks: string[]): string => {
    return `${getIndentation()}  ${uut.name} = new ${uut.type}(${mocks.map(m => `${m}.Object`)});\n`;
  }
}
