import * as vscode from 'vscode';
import { getConstructorDependencies, getConstructorName, getFileUriFromConstructor } from './helpers';

export class MockDependenciesProvider implements vscode.CodeActionProvider {

  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
  ];

  public async provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): Promise<vscode.CodeAction[]> {
    const codeAction = new vscode.CodeAction('Mock dependencies', vscode.CodeActionKind.QuickFix);
    codeAction.edit = new vscode.WorkspaceEdit();

    const constructorName = getConstructorName(document, range);

    const fileUri = await getFileUriFromConstructor(constructorName);
    if (!fileUri) {
      return [];
    }

    const dependencies = await getConstructorDependencies(fileUri, constructorName);

    await this.mockDependencies(dependencies, document, range.start.line + 1, codeAction.edit);
    await vscode.commands.executeCommand('editor.action.formatDocument');

    return [
      codeAction
    ];
  }

  private async mockDependencies(dependencies: string[], document: vscode.TextDocument, startLine: number, edit: vscode.WorkspaceEdit) {
    dependencies.forEach(dependency => {
      edit.insert(document.uri, new vscode.Position(startLine, 0), this.getMock(dependency))
    });
  }

  private getMock = (dependency: string) => `private readonly Mock<${dependency}> _mock${dependency.substr(1, dependency.length)};\n`;
}
