import * as vscode from 'vscode';
import { MockDependenciesProvider } from './providers/MockDependenciesProvider';
import { MockParametersProvider } from './providers/mockParametersProvider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.languages.registerCodeActionsProvider('csharp', new MockDependenciesProvider(), {
    providedCodeActionKinds: MockDependenciesProvider.providedCodeActionKinds
  }));

  context.subscriptions.push(vscode.languages.registerCompletionItemProvider('csharp', new MockParametersProvider(), 'It.', 'Is'));
}

export function deactivate() { }
