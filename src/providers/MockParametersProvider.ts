import * as vscode from 'vscode';

export class MockParametersProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    if (document.fileName.indexOf('Test') === -1) {
      return;
    }

    var anyStringItem = new vscode.CompletionItem('IsAnyString');
    anyStringItem.insertText = 'It.IsAny<string>()';

    var anyIntItem = new vscode.CompletionItem('IsAnyInt');
    anyIntItem.insertText = 'It.IsAny<int>()';

    var anyBoolItem = new vscode.CompletionItem('IsAnyBool');
    anyBoolItem.insertText = 'It.IsAny<bool>()';

    var anyCharItem = new vscode.CompletionItem('IsAnyChar');
    anyCharItem.insertText = 'It.IsAny<char>()';

    var anyDecimalItem = new vscode.CompletionItem('IsAnyDecimal');
    anyDecimalItem.insertText = 'It.IsAny<decimal>()';

    var anyDoubleItem = new vscode.CompletionItem('IsAnyDouble');
    anyDoubleItem.insertText = 'It.IsAny<double>()';

    var anyTypeItem = new vscode.CompletionItem('IsAnyType');
    anyTypeItem.insertText = 'It.IsAny<T>()';

    return [
      anyStringItem,
      anyIntItem,
      anyBoolItem,
      anyCharItem,
      anyDecimalItem,
      anyDoubleItem,
      anyTypeItem
    ];
  }
}