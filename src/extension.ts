import * as vscode from 'vscode';
import { MockDependenciesProvider } from './MockDependenciesProvider';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.languages.registerCodeActionsProvider('csharp', new MockDependenciesProvider(), {
    providedCodeActionKinds: MockDependenciesProvider.providedCodeActionKinds
  });

  context.subscriptions.push(disposable);
}

export function deactivate() { }
