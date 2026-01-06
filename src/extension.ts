import * as vscode from 'vscode';

class CheatsheetPanel {
    public static currentPanel: CheatsheetPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel) {
        this._panel = panel;
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public static createOrShow() {
        if (CheatsheetPanel.currentPanel) {
            CheatsheetPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'markdownCheatsheet',
            'Markdown Cheatsheet',
            vscode.ViewColumn.Beside || vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        CheatsheetPanel.currentPanel = new CheatsheetPanel(panel);
    }

    private _update() {
        this._panel.webview.html = this._getHtmlForWebview();
    }

    private _getHtmlForWebview() {
        return `
            <!DOCTYPE html>
            <html lang="ja">
            <head>
                <meta charset="UTF-8">
                <style>
                    :root { --border-radius: 8px; }
                    body {
                        font-family: var(--vscode-font-family);
                        padding: 20px;
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                    }
                    .search-container {
                        margin-bottom: 24px;
                        position: sticky;
                        top: 0;
                        background-color: var(--vscode-editor-background);
                        padding: 10px 0;
                        z-index: 100;
                    }
                    #search {
                        width: 100%;
                        padding: 10px;
                        border: 1px solid var(--vscode-input-border);
                        background-color: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border-radius: var(--border-radius);
                        outline: none;
                    }
                    .category h2 {
                        font-size: 1.1em;
                        border-bottom: 2px solid var(--vscode-textSeparator-foreground);
                        color: var(--vscode-symbolIcon-classForeground);
                    }
                    .item {
                        padding: 12px;
                        margin-bottom: 10px;
                        background-color: var(--vscode-sideBar-background);
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: var(--border-radius);
                        cursor: pointer;
                        transition: transform 0.1s;
                    }
                    .item:hover {
                        background-color: var(--vscode-list-hoverBackground);
                        transform: translateY(-2px);
                    }
                    .syntax-box {
                        display: block;
                        background-color: var(--vscode-textCodeBlock-background);
                        padding: 5px 10px;
                        margin-top: 5px;
                        border-radius: 4px;
                        font-family: var(--vscode-editor-font-family);
                        font-size: 0.9em;
                        color: var(--vscode-textPreformat-foreground);
                    }
                    .toast {
                        position: fixed;
                        bottom: 20px;
                        left: 50%;
                        transform: translateX(-50%);
                        background-color: var(--vscode-notifications-background);
                        padding: 8px 16px;
                        border-radius: 20px;
                        display: none;
                    }
                </style>
            </head>
            <body>
                <div class="search-container"><input type="text" id="search" placeholder="検索..." autofocus></div>
                <div id="content">
                    <div class="category">
                        <h2>基本</h2>
                        <div class="item" data-search="見出し h1" onclick="copyTo('# ')">
                            <div>見出し 1</div>
                            <div class="syntax-box"># 見出し</div>
                        </div>
                        <div class="item" data-search="太字 bold" onclick="copyTo('**テキスト**')">
                            <div>太字</div>
                            <div class="syntax-box">**テキスト**</div>
                        </div>
                    </div>
                    <div class="category">
                        <h2>リンク & コード</h2>
                        <div class="item" data-search="リンク link" onclick="copyTo('[タイトル](url)')">
                            <div>リンク</div>
                            <div class="syntax-box">[説明](url)</div>
                        </div>
                        <div class="item" data-search="コード code" onclick="copyTo('\\\`\\\`\\\`\\n\\n\\\`\\\`\\\` ')">
                            <div>コードブロック</div>
                            <div class="syntax-box">\`\`\`言語名\\n...\`\`\`</div>
                        </div>
                    </div>
                </div>
                <div id="toast" class="toast">コピーしました</div>
                <script>
                    const search = document.getElementById('search');
                    const categories = document.querySelectorAll('.category');
                    function copyTo(text) {
                        navigator.clipboard.writeText(text).then(() => {
                            const t = document.getElementById('toast');
                            t.style.display = 'block';
                            setTimeout(() => t.style.display = 'none', 1500);
                        });
                    }
                    search.addEventListener('input', (e) => {
                        const q = e.target.value.toLowerCase();
                        categories.forEach(c => {
                            let has = false;
                            c.querySelectorAll('.item').forEach(i => {
                                const match = i.getAttribute('data-search').includes(q);
                                i.style.display = match ? 'block' : 'none';
                                if(match) has = true;
                            });
                            c.style.display = has ? 'block' : 'none';
                        });
                    });
                </script>
            </body>
            </html>
        `;
    }

    public dispose() {
        CheatsheetPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) { x.dispose(); }
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Markdown Cheatsheet activated');
    // 起動確認用の通知（動作確認後に削除可能）
    vscode.window.showInformationMessage('Markdown Cheatsheet ready!');

    const disposable = vscode.commands.registerCommand('markdown-cheatsheet.show', () => {
        CheatsheetPanel.createOrShow();
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
