import * as vscode from 'vscode';
import { mockDependenciesCommand } from './mockDependenciesCommand';
import { MockDependenciesProvider } from './MockDependenciesProvider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.languages.registerCodeActionsProvider('csharp', new MockDependenciesProvider(), {
    providedCodeActionKinds: MockDependenciesProvider.providedCodeActionKinds
  }));

}

export function deactivate() { }
