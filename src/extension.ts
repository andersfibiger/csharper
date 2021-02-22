import * as vscode from 'vscode';
import { DependencyReader } from './dependencyReader';
import { CharReplacer } from './helpers/charReplacer';
import { DependencyTypeHelper } from './helpers/dependencyTypeHelper';
import { MockDependenciesProvider } from './MockDependenciesProvider';

export function activate(context: vscode.ExtensionContext) {
  // initialize types
  const charReplacer = new CharReplacer();
  const dependencyTypeHelper = new DependencyTypeHelper();
  const dependencyReader = new DependencyReader(charReplacer, dependencyTypeHelper);
  const codeActionProvider = new MockDependenciesProvider(dependencyReader);

  const disposable = vscode.languages.registerCodeActionsProvider('csharp', codeActionProvider, {
    providedCodeActionKinds: MockDependenciesProvider.providedCodeActionKinds
  });

  context.subscriptions.push(disposable);
}

export function deactivate() { }
