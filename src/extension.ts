import * as vscode from 'vscode';

/**
 * チートシートの Webview パネルを管理するクラス
 */
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
		// すでにパネルがある場合は表示する
		if (CheatsheetPanel.currentPanel) {
			CheatsheetPanel.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
			return;
		}

		// 新しいパネルを作成する
		const panel = vscode.window.createWebviewPanel(
			'markdownCheatsheet',
			'Markdown Cheatsheet',
			vscode.ViewColumn.Beside,
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
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Markdown Cheatsheet</title>
                <style>
                    :root {
                        --container-padding: 20px;
                        --border-radius: 8px;
                        --transition-speed: 0.2s;
                    }
                    body {
                        font-family: var(--vscode-font-family);
                        padding: var(--container-padding);
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                        line-height: 1.6;
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
                        padding: 10px 12px;
                        border: 1px solid var(--vscode-input-border);
                        background-color: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border-radius: var(--border-radius);
                        outline: none;
                        font-size: 14px;
                    }
                    #search:focus {
                        border-color: var(--vscode-focusBorder);
                    }
                    .category {
                        margin-bottom: 32px;
                    }
                    .category h2 {
                        font-size: 1.2em;
                        font-weight: 600;
                        margin-bottom: 12px;
                        padding-bottom: 4px;
                        border-bottom: 2px solid var(--vscode-textSeparator-foreground);
                        color: var(--vscode-symbolIcon-classForeground);
                    }
                    .grid {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    .item {
                        display: flex;
                        flex-direction: column;
                        padding: 12px;
                        background-color: var(--vscode-sideBar-background);
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: var(--border-radius);
                        cursor: pointer;
                        transition: all var(--transition-speed);
                        position: relative;
                        overflow: hidden;
                    }
                    .item:hover {
                        background-color: var(--vscode-list-hoverBackground);
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }
                    .item:active {
                        transform: translateY(0);
                    }
                    .item-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    }
                    .label {
                        font-weight: 500;
                        font-size: 13px;
                    }
                    .syntax-box {
                        display: flex;
                        align-items: center;
                        background-color: var(--vscode-textCodeBlock-background);
                        padding: 6px 10px;
                        border-radius: 4px;
                        font-family: var(--vscode-editor-font-family);
                        font-size: 12px;
                        color: var(--vscode-textPreformat-foreground);
                    }
                    .copy-hint {
                        position: absolute;
                        right: 8px;
                        bottom: 8px;
                        font-size: 10px;
                        opacity: 0;
                        transition: opacity var(--transition-speed);
                        color: var(--vscode-descriptionForeground);
                    }
                    .item:hover .copy-hint {
                        opacity: 0.8;
                    }
                    .toast {
                        position: fixed;
                        bottom: 20px;
                        left: 50%;
                        transform: translateX(-50%);
                        background-color: var(--vscode-notifications-background);
                        color: var(--vscode-notifications-foreground);
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-size: 12px;
                        display: none;
                        z-index: 1000;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    }
                </style>
            </head>
            <body>
                <div class="search-container">
                    <input type="text" id="search" placeholder="チートシートを検索..." autofocus>
                </div>
                <div id="content">
                    <div class="category">
                        <h2>基本構文</h2>
                        <div class="grid">
                            <div class="item" data-search="見出し h1 h2 h3" onclick="copyToClipboard('# ')">
                                <div class="item-header"><span class="label">見出し</span></div>
                                <div class="syntax-box"># 見出し1 / ## 見出し2</div>
                                <span class="copy-hint">Click to copy '#'</span>
                            </div>
                            <div class="item" data-search="太字 bold" onclick="copyToClipboard('**テキスト**')">
                                <div class="item-header"><span class="label">太字</span></div>
                                <div class="syntax-box">**テキスト**</div>
                                <span class="copy-hint">Click to copy</span>
                            </div>
                            <div class="item" data-search="斜体 italic" onclick="copyToClipboard('*テキスト*')">
                                <div class="item-header"><span class="label">斜体</span></div>
                                <div class="syntax-box">*テキスト*</div>
                                <span class="copy-hint">Click to copy</span>
                            </div>
                        </div>
                    </div>
                    <div class="category">
                        <h2>リスト & リンク</h2>
                        <div class="grid">
                            <div class="item" data-search="箇条書き リスト list" onclick="copyToClipboard('- ')">
                                <div class="item-header"><span class="label">箇条書きリスト</span></div>
                                <div class="syntax-box">- 項目</div>
                                <span class="copy-hint">Click to copy '- '</span>
                            </div>
                            <div class="item" data-search="番号付きリスト list" onclick="copyToClipboard('1. ')">
                                <div class="item-header"><span class="label">番号付きリスト</span></div>
                                <div class="syntax-box">1. 項目</div>
                                <span class="copy-hint">Click to copy '1. '</span>
                            </div>
                            <div class="item" data-search="リンク link url" onclick="copyToClipboard('[タイトル](url)')">
                                <div class="item-header"><span class="label">リンク</span></div>
                                <div class="syntax-box">[タイトル](url)</div>
                                <span class="copy-hint">Click to copy</span>
                            </div>
                        </div>
                    </div>
                    <div class="category">
                        <h2>その他</h2>
                        <div class="grid">
                            <div class="item" data-search="コードブロック code" onclick="copyToClipboard('\\\`\\\`\\\`\\n\\n\\\`\\\`\\\` ')">
                                <div class="item-header"><span class="label">コードブロック</span></div>
                                <div class="syntax-box">\`\`\`言語名\\n...\`\`\`</div>
                                <span class="copy-hint">Click to copy</span>
                            </div>
                            <div class="item" data-search="引用 quote" onclick="copyToClipboard('> ')">
                                <div class="item-header"><span class="label">引用</span></div>
                                <div class="syntax-box">> 引用文</div>
                                <span class="copy-hint">Click to copy '> '</span>
                            </div>
                            <div class="item" data-search="水平線 hr" onclick="copyToClipboard('---')">
                                <div class="item-header"><span class="label">水平線</span></div>
                                <div class="syntax-box">---</div>
                                <span class="copy-hint">Click to copy</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="toast" class="toast">コピーしました！</div>
                <script>
                    const searchInput = document.getElementById('search');
                    const categories = document.querySelectorAll('.category');
                    const toast = document.getElementById('toast');

                    function copyToClipboard(text) {
                        navigator.clipboard.writeText(text).then(() => {
                            showToast();
                        });
                    }

                    function showToast() {
                        toast.style.display = 'block';
                        setTimeout(() => {
                            toast.style.display = 'none';
                        }, 2000);
                    }

                    searchInput.addEventListener('input', (e) => {
                        const query = e.target.value.toLowerCase();
                        
                        categories.forEach(category => {
                            let hasVisibleItem = false;
                            const catItems = category.querySelectorAll('.item');
                            
                            catItems.forEach(item => {
                                const searchText = item.getAttribute('data-search').toLowerCase();
                                if (searchText.includes(query)) {
                                    item.style.display = 'flex';
                                    hasVisibleItem = true;
                                } else {
                                    item.style.display = 'none';
                                }
                            });

                            category.style.display = hasVisibleItem ? 'block' : 'none';
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
			if (x) {
				x.dispose();
			}
		}
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Markdown Cheatsheet is now active!');

	const disposable = vscode.commands.registerCommand('markdown-cheatsheet.show', () => {
		CheatsheetPanel.createOrShow();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }

