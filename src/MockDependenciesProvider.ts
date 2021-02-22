import * as vscode from 'vscode';
import { IDependencyReader } from './dependencyReader';
import { getConstructorDependencies, getUnitUnderTest, getCurrentFileConstructor, getFileUriFromType, getIndentation, handleParametersNames, getUsingStatements } from './helpers';
import { ICharReplacer } from './helpers/charReplacer';
import { IDependencyTypeHelper } from './helpers/dependencyTypeHelper';
import { UnitUnderTest } from './models/types';

export class MockDependenciesProvider implements vscode.CodeActionProvider {
  constructor(
    private dependencyReader: IDependencyReader) {
  }

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

    const dependencies = await this.dependencyReader.getConstructorDependencies(uut.type, fileUri);
    const usingStatements = await getUsingStatements(fileUri);

    await this.mockDependencies(dependencies, document, range, codeAction.edit);
    await this.initializeMocks(dependencies, uut, document, range, codeAction.edit);
    await this.insertStatements(usingStatements, document, codeAction.edit);

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

  private async initializeMocks(dependencies: string[], uut: UnitUnderTest, document: vscode.TextDocument, range: vscode.Range, edit: vscode.WorkspaceEdit) {
    const constructorName = getCurrentFileConstructor(document);
    var insertRange = range.start.translate(1);
    edit.insert(document.uri, insertRange, this.addConstructor(constructorName))

    dependencies.forEach(dependency => {
      edit.insert(document.uri, insertRange, `${getIndentation()}  ${this.getMockName(dependency)} = new Mock<${dependency}>();\n`);
    })

    edit.insert(document.uri, insertRange, this.initializeCtor(uut, dependencies.map(this.getMockName)));

    edit.insert(document.uri, insertRange, `\n${getIndentation()}}`);
  }

  private addConstructor = (constructorName: string) => `\n${getIndentation()}public ${constructorName}()\n${getIndentation()}{\n`;

  private initializeCtor = (uut: UnitUnderTest, mocks: string[]): string => {
    return `${getIndentation()}  ${uut.name} = new ${uut.type}(${mocks.map(m => `${m}.Object`)});`;
  }

  private insertStatements = async (statements: string[], document: vscode.TextDocument, edit: vscode.WorkspaceEdit) => {
    const existingUsingStatements = await getUsingStatements(document.uri);
    const insertAtLine = existingUsingStatements.length;

    statements.push('using Xunit;');
    statements.push('using Moq;');

    statements.forEach(usingStatement => {
      if (!existingUsingStatements.includes(usingStatement)) {
        edit.insert(document.uri, new vscode.Position(insertAtLine, 0), `${usingStatement}\n`);
      }
    });
  }
}
