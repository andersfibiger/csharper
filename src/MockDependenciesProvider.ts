import { worker } from 'cluster';
import * as vscode from 'vscode';

export class MockDependenciesProvider implements vscode.CodeActionProvider {

  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
  ];

  public async provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): Promise<vscode.CodeAction[]> {
    const codeAction = new vscode.CodeAction('Mock dependencies', vscode.CodeActionKind.QuickFix);
    codeAction.edit = new vscode.WorkspaceEdit();

    const dependencies = await this.getDependencies(document, range);
    if (dependencies.length !== 0)
      await this.mockDependencies(dependencies, document, range, codeAction.edit);

    return [
      codeAction
    ];
  }

  private async getDependencies(document: vscode.TextDocument, range: vscode.Range | vscode.Selection) {
    const lineText = document.getText(new vscode.Range(range.start.line, 0, range.start.line, range.start.character));

    let uut = lineText
      .split(' ')
      .reverse()[1];

    if (uut.startsWith('I'))
      uut = uut.substr(1, uut.length);

    const files = await vscode.workspace.findFiles(new vscode.RelativePattern(vscode.workspace.workspaceFolders![0], `**/${uut}.cs`));

    if (files.length === 0)
      return [];


    const fileContent = (await vscode.workspace.openTextDocument(files[0])).getText()


    const constructorPosition = fileContent.indexOf(`${uut}(`) + 1;

    const constructor = fileContent.substring(constructorPosition + uut.length)
    const endPosition = constructor.indexOf(')');

    const constructorParameters = constructor.substr(0, endPosition);

    const dependencies = constructorParameters
      .split(',')
      .map(p => p.split(' ')[0]);

    return dependencies;
  }

  private async mockDependencies(dependencies: string[], document: vscode.TextDocument, range: vscode.Range | vscode.Selection, edit: vscode.WorkspaceEdit) {
    const dependency = dependencies[0];

    edit.insert(document.uri, new vscode.Position(range.start.line + 1, 0), this.getMock(dependency))
  }

  private async importMissingStatements() {
    //TODO: 
  }

  private getMock = (mock: string) => `private readonly Mock<${mock}> _mock${mock.substr(1, mock.length)};`;
}
