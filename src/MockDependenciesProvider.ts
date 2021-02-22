import * as vscode from 'vscode';
import { IDependencyReader } from './dependencyReader';
import { getConstructorDependencies, getUnitUnderTest, getCurrentFileConstructor, getFileUriFromType, getIndentation, handleParametersNames, getUsingStatements } from './helpers';
import { ICharReplacer } from './helpers/charReplacer';
import { IDependencyTypeHelper } from './helpers/dependencyTypeHelper';
import { addConstructor, getMockMember, getMockName, initializeCtor, initializeMock } from './helpers/textFormatting';
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
    await this.initializeMembers(dependencies, uut, document, range, codeAction.edit);
    await this.insertUsingStatements(usingStatements, document, codeAction.edit);

    return [
      codeAction
    ];
  }

  private async mockDependencies(dependencies: string[], document: vscode.TextDocument, range: vscode.Range, edit: vscode.WorkspaceEdit) {
    dependencies.forEach(dependency => {
      edit.insert(document.uri, range.start.translate(1), `${getIndentation()}${getMockMember(dependency)}`);
    });
  }

  private async initializeMembers(dependencies: string[], uut: UnitUnderTest, document: vscode.TextDocument, range: vscode.Range, edit: vscode.WorkspaceEdit) {
    const constructorName = getCurrentFileConstructor(document);
    var insertRange = range.start.translate(1);
    edit.insert(document.uri, insertRange, addConstructor(constructorName))

    dependencies.forEach(dependency => {
      edit.insert(document.uri, insertRange, initializeMock(dependency));
    })

    edit.insert(document.uri, insertRange, initializeCtor(uut, dependencies.map(getMockName)));

    edit.insert(document.uri, insertRange, `\n${getIndentation()}}`);
  }

  private insertUsingStatements = async (statements: string[], document: vscode.TextDocument, edit: vscode.WorkspaceEdit) => {
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
