/**
 * Cursor IDE Smart RTL/LTR Fix
 *
 * @version 7.0.0
 * @author Emad Helmi <s.emad.helmi@gmail.com>
 * @license MIT
 * @see {@link https://github.com/EmadHelmi GitHub: EmadHelmi}
 * @see {@link https://t.me/EmadHelmi Telegram: EmadHelmi}
 *
 * SPDX-License-Identifier: MIT
 * Copyright (c) 2026 Emad Helmi
 *
 * How to use:
 * 1. Open Cursor.
 * 2. Open Developer Tools from:
 *    Help > Toggle Developer Tools
 * 3. In Developer Tools, open the "Sources" tab.
 * 4. Open "Snippets" from the left sidebar.
 *    If "Snippets" is hidden, open the ">>" overflow menu and select it.
 * 5. Click "New snippet".
 * 6. Give the snippet a name, for example:
 *    cursor-smart-rtl
 * 7. Paste this entire file into the snippet.
 * 8. Save it:
 *    Linux/Windows: Ctrl+S
 *    macOS: Cmd+S
 * 9. Run the snippet:
 *    Right-click inside the snippet and choose "Run",
 *    or use the DevTools "Run" control.
 * 10. The snippet itself remains saved in Developer Tools, but it must be
 *     run again after Cursor is restarted or its window is reloaded unless
 *     you have configured a separate automatic startup mechanism.
 *
 * Notes:
 * - Re-running the snippet is safe; previous runtime observers/listeners
 *   created by this script are cleaned up before the new runtime starts.
 * - Smart direction detection is applied independently to Markdown Preview,
 *   Agent messages, live prompt input, lists, and tables.
 */
(function () {
  const id = "cursor-rtl-fix-style";
  let style = document.getElementById(id);
  if (style) style.remove();

  /* =====================================================
    SMART DIRECTION RUNTIME / TEST CLEANUP
  ===================================================== */
  const SMART_RUNTIME_KEY = "__cursorSmartDirectionRuntime";
  const LEGACY_PREVIEW_OBSERVER_KEY = "__cursorSmartPreviewObserver";

  /*
    Re-running v7 should never leave duplicate observers/listeners.
  */
  if (window[SMART_RUNTIME_KEY]?.cleanup) {
    window[SMART_RUNTIME_KEY].cleanup();
    delete window[SMART_RUNTIME_KEY];
  }

  /*
    Cleanup the v5 Smart Preview observer.
  */
  if (window[LEGACY_PREVIEW_OBSERVER_KEY]) {
    window[LEGACY_PREVIEW_OBSERVER_KEY].disconnect();
    delete window[LEGACY_PREVIEW_OBSERVER_KEY];
  }

  /*
    Cleanup all console experiments used while building Smart Preview
    and Smart Agent behavior.
  */
  [
    "__cursorSmartAgentCoreTestV2",
    "__cursorSmartLivePromptStableTest",
    "__cursorSmartAgentTablesTest",
  ].forEach((runtimeKey) => {
    if (window[runtimeKey]?.cleanup) {
      window[runtimeKey].cleanup();
    }
    delete window[runtimeKey];
  });

  [
    "cursor-smart-preview-lists-test",
    "cursor-smart-preview-tables-test",
    "cursor-smart-preview-dynamic-test",
    "cursor-smart-agent-messages-test",
    "cursor-smart-agent-core-test-v2",
    "cursor-smart-live-prompt-stable-test",
    "cursor-smart-agent-lists-test",
    "cursor-smart-agent-tables-test",
  ].forEach((styleId) => {
    document.getElementById(styleId)?.remove();
  });

  /*
    Remove data attributes left by older experiments.
    v7 will immediately calculate and re-apply its own state.
  */
  document
    .querySelectorAll("[data-cursor-smart-stable-input-direction]")
    .forEach((element) => {
      delete element.dataset.cursorSmartStableInputDirection;
    });

  document
    .querySelectorAll("[data-cursor-smart-agent-table-direction]")
    .forEach((element) => {
      delete element.dataset.cursorSmartAgentTableDirection;
    });

  style = document.createElement("style");
  style.id = id;
  style.textContent = `
      /* =====================================================
        1. GENERAL AI RESPONSES (RIGHT TO LEFT)
      ===================================================== */
      .markdown-root,
      .anysphere-markdown-container-root,
      .markdown-section {
        direction: rtl !important;
        text-align: right !important;
        font-family: 'Vazirmatn', sans-serif !important;
      }

      /*
        Agent/AI body text gets a fixed readable size.
        Headings are deliberately excluded so Cursor keeps
        its own H1-H6 size hierarchy.
      */
      .markdown-root p,
      .markdown-root li,
      .markdown-root blockquote,
      .markdown-root th,
      .markdown-root td,

      .anysphere-markdown-container-root p,
      .anysphere-markdown-container-root li,
      .anysphere-markdown-container-root blockquote,
      .anysphere-markdown-container-root th,
      .anysphere-markdown-container-root td,

      .markdown-section p,
      .markdown-section li,
      .markdown-section blockquote,
      .markdown-section th,
      .markdown-section td {
        font-family: 'Vazirmatn', sans-serif !important;
        font-size: 18px !important;
      }

      /*
        Force only the heading font family, never the heading size.
      */
      .markdown-root h1,
      .markdown-root h2,
      .markdown-root h3,
      .markdown-root h4,
      .markdown-root h5,
      .markdown-root h6,

      .anysphere-markdown-container-root h1,
      .anysphere-markdown-container-root h2,
      .anysphere-markdown-container-root h3,
      .anysphere-markdown-container-root h4,
      .anysphere-markdown-container-root h5,
      .anysphere-markdown-container-root h6,

      .markdown-section h1,
      .markdown-section h2,
      .markdown-section h3,
      .markdown-section h4,
      .markdown-section h5,
      .markdown-section h6 {
        font-family: 'Vazirmatn', sans-serif !important;
      }

      /*
        Keep the broader layout selectors RTL, but do not apply
        typography to them because they can wrap unrelated UI.
      */
      .composer-message-group,
      .space-y-4 {
        direction: rtl !important;
        text-align: right !important;
      }


      /* =====================================================
        1A. SMART AGENT MESSAGE DIRECTION
        Direction is detected independently for each message
      ===================================================== */

      /* Assistant message: RTL */
      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="rtl"],

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="rtl"]
      .anysphere-markdown-container-root,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="rtl"]
      .markdown-section,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="rtl"]
      .space-y-4 {
        direction: rtl !important;
        text-align: right !important;
      }

      /* Assistant message: LTR */
      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="ltr"],

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="ltr"]
      .anysphere-markdown-container-root,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="ltr"]
      .markdown-section,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="ltr"]
      .space-y-4 {
        direction: ltr !important;
        text-align: left !important;
      }

      /* =====================================================
        2. USER INPUT & HISTORY (LEXICAL EDITOR)
      ===================================================== */
      .aislash-editor-input,
      .aislash-editor-input-readonly,
      .composer-human-message,
      .composer-human-message-container,
      .human-message-with-todos-wrapper {
        direction: rtl !important;
        text-align: right !important;
        font-family: 'Vazirmatn', sans-serif !important;
        font-size: 18px !important;
      }

      /* =====================================================
        3. INPUT PLACEHOLDER FIX
      ===================================================== */
      .aislash-editor-placeholder,
      [data-placeholder] {
        direction: rtl !important;
        text-align: right !important;
        font-family: 'Vazirmatn', sans-serif !important;
        font-size: 18px !important;
        right: 15px !important;
        left: auto !important;
      }


      /* =====================================================
        3A. SMART USER HISTORY & LIVE PROMPT
        Live prompt uses stable tie handling while typing
      ===================================================== */

      /* Sent user messages */
      .composer-human-message[data-cursor-smart-agent-direction="rtl"] {
        direction: rtl !important;
        text-align: right !important;
      }

      .composer-human-message[data-cursor-smart-agent-direction="ltr"] {
        direction: ltr !important;
        text-align: left !important;
      }

      /* Live composer: RTL */
      .aislash-editor-input[data-cursor-smart-input-direction="rtl"],
      .aislash-editor-input[data-cursor-smart-input-direction="rtl"] p {
        direction: rtl !important;
        text-align: right !important;
      }

      /* Live composer: LTR */
      .aislash-editor-input[data-cursor-smart-input-direction="ltr"],
      .aislash-editor-input[data-cursor-smart-input-direction="ltr"] p {
        direction: ltr !important;
        text-align: left !important;
      }

      /* =====================================================
        3B. MARKDOWN PREVIEW TYPOGRAPHY
        Scoped ONLY to Markdown Preview
      ===================================================== */
      .markdown-editor-react {
        --cursor-rtl-preview-font-family: 'Vazirmatn', sans-serif;
        --cursor-rtl-preview-font-size: 20px;

        font-family: var(--cursor-rtl-preview-font-family) !important;
      }

      /*
        Actual editable/rendered Markdown document root.
        Direction is assigned dynamically using
        data-cursor-smart-direction.
      */
      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror {
        font-family: var(--cursor-rtl-preview-font-family) !important;
        font-size: var(--cursor-rtl-preview-font-size) !important;
      }

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror[data-cursor-smart-direction="rtl"] {
        direction: rtl !important;
        text-align: right !important;
      }

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror[data-cursor-smart-direction="ltr"] {
        direction: ltr !important;
        text-align: left !important;
      }

      /*
        Preview body text.
        Headings are deliberately excluded from font-size.
      */
      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror p,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror li,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror blockquote,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror td,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror th {
        font-family: var(--cursor-rtl-preview-font-family) !important;
        font-size: var(--cursor-rtl-preview-font-size) !important;
      }

      /*
        Preview headings use Vazirmatn but preserve Cursor's
        native heading sizes.
      */
      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror h1,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror h2,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror h3,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror h4,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror h5,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror h6 {
        font-family: var(--cursor-rtl-preview-font-family) !important;
      }

      /* =====================================================
        4. FIX LIST BULLETS
      ===================================================== */
      .markdown-root ul,
      .markdown-root ol,
      .markdown-section ul,
      .markdown-section ol {
        padding-right: 20px !important;
        padding-left: 0 !important;
        direction: rtl !important;
        text-align: right !important;
      }

      /*
        These utility/Streamdown list selectors may exist outside
        the markdown roots above, so keep typography scoped here.
      */
      .list-disc,
      .list-inside,
      [data-streamdown="unordered-list"],
      [data-streamdown="ordered-list"] {
        padding-right: 20px !important;
        padding-left: 0 !important;
        direction: rtl !important;
        text-align: right !important;
        font-family: 'Vazirmatn', sans-serif !important;
        font-size: 18px !important;
      }

      /* =====================================================
        4A. SMART MARKDOWN PREVIEW LISTS
        Scoped ONLY to Markdown Preview
      ===================================================== */

      /* RTL document lists */
      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror[data-cursor-smart-direction="rtl"] ul,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror[data-cursor-smart-direction="rtl"] ol {
        direction: rtl !important;
        text-align: right !important;
        padding-right: 1.6em !important;
        padding-left: 0 !important;
        margin-left: 0 !important;
      }

      /* LTR document lists */
      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror[data-cursor-smart-direction="ltr"] ul,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror[data-cursor-smart-direction="ltr"] ol {
        direction: ltr !important;
        text-align: left !important;
        padding-left: 1.6em !important;
        padding-right: 0 !important;
        margin-right: 0 !important;
      }

      /* List items and their direct paragraphs */
      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror[data-cursor-smart-direction="rtl"] li,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror[data-cursor-smart-direction="rtl"] li > p {
        direction: rtl !important;
        text-align: right !important;
      }

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror[data-cursor-smart-direction="ltr"] li,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror[data-cursor-smart-direction="ltr"] li > p {
        direction: ltr !important;
        text-align: left !important;
      }

      /* Nested lists */
      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror[data-cursor-smart-direction="rtl"] li > ul,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror[data-cursor-smart-direction="rtl"] li > ol {
        padding-right: 1.6em !important;
        padding-left: 0 !important;
      }

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror[data-cursor-smart-direction="ltr"] li > ul,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror[data-cursor-smart-direction="ltr"] li > ol {
        padding-left: 1.6em !important;
        padding-right: 0 !important;
      }


      /* =====================================================
        4B. SMART AGENT LISTS
        Lists follow the direction of their Assistant message
      ===================================================== */

      /* RTL lists */
      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="rtl"] ul,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="rtl"] ol,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="rtl"] .list-disc,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="rtl"] .list-inside,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="rtl"]
      [data-streamdown="unordered-list"],

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="rtl"]
      [data-streamdown="ordered-list"] {
        direction: rtl !important;
        text-align: right !important;
        padding-right: 20px !important;
        padding-left: 0 !important;
      }

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="rtl"] li,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="rtl"] li > p {
        direction: rtl !important;
        text-align: right !important;
      }

      /* LTR lists */
      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="ltr"] ul,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="ltr"] ol,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="ltr"] .list-disc,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="ltr"] .list-inside,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="ltr"]
      [data-streamdown="unordered-list"],

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="ltr"]
      [data-streamdown="ordered-list"] {
        direction: ltr !important;
        text-align: left !important;
        padding-left: 20px !important;
        padding-right: 0 !important;
      }

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="ltr"] li,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="ltr"] li > p {
        direction: ltr !important;
        text-align: left !important;
      }

      /* Nested lists */
      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="rtl"] li > ul,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="rtl"] li > ol {
        padding-right: 20px !important;
        padding-left: 0 !important;
      }

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="ltr"] li > ul,

      [data-message-kind="assistant"]
      .markdown-root[data-cursor-smart-agent-direction="ltr"] li > ol {
        padding-left: 20px !important;
        padding-right: 0 !important;
      }

      /* =====================================================
        5. TABLE FIXES
      ===================================================== */
      .markdown-table-container {
        direction: ltr !important;
        overflow-x: auto !important;
        max-width: 100% !important;
        display: block !important;
        border-radius: 4px;
      }

      table.markdown-table {
        direction: rtl !important;
        width: max-content !important;
        min-width: 100% !important;
        border-collapse: collapse !important;
        font-family: 'Vazirmatn', sans-serif !important;
      }

      .markdown-table th,
      .markdown-table td {
        text-align: right !important;
        font-family: 'Vazirmatn', sans-serif !important;
        font-size: 18px !important;
        border: 1px solid var(--vscode-textSeparator-foreground) !important;
        padding: 6px 10px !important;
      }

      /* =====================================================
        5A. SMART MARKDOWN PREVIEW TABLES
        Scoped ONLY to Markdown Preview
      ===================================================== */

      /*
        Keep the wrapper responsible only for scrolling.
        Each table gets its own detected direction.
      */
      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror
      .tableWrapper {
        overflow-x: auto !important;
        max-width: 100% !important;
      }

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror
      .tableWrapper > table {
        border-collapse: collapse !important;
      }

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror
      .tableWrapper > table[data-cursor-smart-direction="rtl"] {
        direction: rtl !important;
      }

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror
      .tableWrapper > table[data-cursor-smart-direction="ltr"] {
        direction: ltr !important;
      }

      /* RTL table cells */
      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror
      .tableWrapper > table[data-cursor-smart-direction="rtl"] th,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror
      .tableWrapper > table[data-cursor-smart-direction="rtl"] td,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror
      .tableWrapper > table[data-cursor-smart-direction="rtl"] th > p,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror
      .tableWrapper > table[data-cursor-smart-direction="rtl"] td > p {
        direction: rtl !important;
        text-align: right !important;
      }

      /* LTR table cells */
      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror
      .tableWrapper > table[data-cursor-smart-direction="ltr"] th,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror
      .tableWrapper > table[data-cursor-smart-direction="ltr"] td,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror
      .tableWrapper > table[data-cursor-smart-direction="ltr"] th > p,

      .markdown-editor-react
      .markdown-editor-react__richtext-content
      .tiptap.ProseMirror
      .tableWrapper > table[data-cursor-smart-direction="ltr"] td > p {
        direction: ltr !important;
        text-align: left !important;
      }


      /* =====================================================
        5B. SMART AGENT TABLES
        Each table is detected independently from its message
      ===================================================== */

      [data-message-kind="assistant"]
      .markdown-root
      table.markdown-table[data-cursor-smart-table-direction="rtl"] {
        direction: rtl !important;
      }

      [data-message-kind="assistant"]
      .markdown-root
      table.markdown-table[data-cursor-smart-table-direction="ltr"] {
        direction: ltr !important;
      }

      [data-message-kind="assistant"]
      .markdown-root
      table.markdown-table[data-cursor-smart-table-direction="rtl"] th,

      [data-message-kind="assistant"]
      .markdown-root
      table.markdown-table[data-cursor-smart-table-direction="rtl"] td {
        direction: rtl !important;
        text-align: right !important;
      }

      [data-message-kind="assistant"]
      .markdown-root
      table.markdown-table[data-cursor-smart-table-direction="ltr"] th,

      [data-message-kind="assistant"]
      .markdown-root
      table.markdown-table[data-cursor-smart-table-direction="ltr"] td {
        direction: ltr !important;
        text-align: left !important;
      }

      /* =====================================================
        6. CODE BLOCKS LTR (STRICT OVERRIDE)
      ===================================================== */
      code,
      pre,
      .markdown-code-outer-container,
      .cursor-code-block-content,
      .composer-code-block-content,
      .monaco-editor,
      .ui-code-block,
      .ui-default-code,
      .composer-message-codeblock {
        direction: ltr !important;
        text-align: left !important;
        unicode-bidi: plaintext !important;
        font-family: var(--vscode-editor-font-family, monospace) !important;
      }

      .markdown-root code,
      .markdown-section code {
        display: inline-block;
      }

      /* =====================================================
        7. TO-DO LIST (NEW UI STRUCTURE: ui-todo-*)
      ===================================================== */

      /*
        Typography is grouped once for the known todo text nodes.
        Indicator/icon containers are intentionally excluded.
      */
      .todo-list-container,
      .todo-list-header,
      .todo-list-header-left,
      .todo-list-header-right,
      .ui-todo-list,
      .todo-list,
      .ui-todo-item,
      .ui-todo-item__label,
      .ui-todo-item__content,
      .todo-label,
      .todo-content {
        font-family: 'Vazirmatn', sans-serif !important;
        font-size: 18px !important;
      }

      .todo-list-container {
        direction: rtl !important;
        text-align: right !important;
      }

      .todo-list-header,
      .todo-list-header-left,
      .todo-list-header-right {
        direction: rtl !important;
        display: flex !important;
        flex-direction: row !important;
      }

      /* New todo item structure */
      .ui-todo-list,
      .todo-list {
        direction: rtl !important;
        padding-right: 20px !important;
        padding-left: 0 !important;
      }

      .ui-todo-item,
      .ui-todo-item__label {
        direction: rtl !important;
        text-align: right !important;
        display: flex !important;
        align-items: flex-start !important;
      }

      .ui-todo-item__indicator {
        margin-left: 8px !important;
        margin-right: 0 !important;
        margin-top: 2px !important;
      }

      .ui-todo-item__content {
        text-align: right !important;
        unicode-bidi: plaintext !important;
      }

      /* Legacy todo classes (fallback) */
      .todo-label,
      .todo-content {
        direction: rtl !important;
        text-align: right !important;
      }

      .todo-indicator-container {
        margin-left: 8px !important;
        margin-right: 0 !important;
      }

      /* =====================================================
        8. PLAN MODE / QUESTIONNAIRE
      ===================================================== */
      #composer-toolbar-section,
      .composer-questionnaire-toolbar,
      .composer-questionnaire-toolbar-header,
      .composer-questionnaire-toolbar-question-label,
      .composer-questionnaire-toolbar-option,
      .composer-questionnaire-toolbar-freeform-input,
      .composer-questionnaire-toolbar-actions {
        direction: rtl !important;
        text-align: right !important;
        font-family: 'Vazirmatn', sans-serif !important;
        font-size: 18px !important;
      }

      .composer-questionnaire-toolbar-option-label {
        margin-right: 8px !important;
        margin-left: 0 !important;
      }

      /* =====================================================
        9. STEP HEADERS, COLLAPSIBLE
      ===================================================== */

      /*
        Shared typography for both step-header groups.
      */
      .ui-step-group-header,
      .ui-collapsible-header,
      .composer-tool-former-message,
      .tool-summary-hover-target,
      .truncate-one-line {
        font-family: 'Vazirmatn', sans-serif !important;
        font-size: 18px !important;
      }

      .ui-step-group-header,
      .ui-collapsible-header,
      .composer-tool-former-message {
        direction: rtl !important;
        text-align: right !important;
      }

      .tool-summary-hover-target,
      .truncate-one-line {
        direction: rtl !important;
        text-align: right !important;
      }

      /* =====================================================
        10. COMPOSER PANE CONTROLS
      ===================================================== */
      .composer-pane-controls-feedback {
        direction: rtl !important;
        font-family: 'Vazirmatn', sans-serif !important;
        font-size: 18px !important;
      }
    `;

  document.head.appendChild(style);

  /* =====================================================
    11. SMART DIRECTION RUNTIME
    One observer for Preview + Agent + live composer
  ===================================================== */

  const PREVIEW_SELECTOR =
    ".markdown-editor-react " +
    ".markdown-editor-react__richtext-content " +
    ".tiptap.ProseMirror";

  const ASSISTANT_SELECTOR = '[data-message-kind="assistant"] .markdown-root';

  const USER_HISTORY_SELECTOR = ".composer-human-message";

  const LIVE_INPUT_SELECTOR = ".aislash-editor-input";

  const NATURAL_TEXT_EXCLUDE_SELECTOR = [
    "code",
    "pre",
    "kbd",
    "samp",
    "svg",
    ".node-mermaid",
    ".markdown-code-outer-container",
    ".cursor-code-block-content",
    ".composer-code-block-content",
    ".ui-code-block",
  ].join(",");

  /* =====================================================
    11A. LANGUAGE HELPERS
  ===================================================== */

  function getNaturalText(element) {
    const clone = element.cloneNode(true);

    clone
      .querySelectorAll(NATURAL_TEXT_EXCLUDE_SELECTOR)
      .forEach((node) => node.remove());

    return (clone.textContent || "").trim();
  }

  function getScriptScores(text) {
    return {
      rtl: (text.match(/\p{Script=Arabic}+/gu) || []).length,
      ltr: (text.match(/\p{Script=Latin}+/gu) || []).length,
    };
  }

  function classifyText(text) {
    const scores = getScriptScores(text);

    if (scores.rtl > scores.ltr) return "rtl";
    if (scores.ltr > scores.rtl) return "ltr";

    return null;
  }

  function detectMessageDirection(element) {
    const scores = getScriptScores(getNaturalText(element));

    if (scores.rtl === 0 && scores.ltr === 0) {
      return null;
    }

    /*
      Keep the already-tested Agent behavior:
      a non-empty exact tie falls back to LTR.
    */
    return scores.rtl > scores.ltr ? "rtl" : "ltr";
  }

  /* =====================================================
    11B. TABLE DIRECTION
    Headers > body > container fallback
  ===================================================== */

  function detectTableDirection(table, fallbackDirection) {
    const headers = [...table.querySelectorAll("th")];

    let rtlHeaders = 0;
    let ltrHeaders = 0;

    for (const header of headers) {
      const direction = classifyText(getNaturalText(header));

      if (direction === "rtl") rtlHeaders++;
      if (direction === "ltr") ltrHeaders++;
    }

    if (rtlHeaders > ltrHeaders) return "rtl";
    if (ltrHeaders > rtlHeaders) return "ltr";

    const cells = [...table.querySelectorAll("td")].slice(0, 80);

    let rtlBody = 0;
    let ltrBody = 0;

    for (const cell of cells) {
      const direction = classifyText(getNaturalText(cell));

      if (direction === "rtl") rtlBody++;
      if (direction === "ltr") ltrBody++;
    }

    if (rtlBody > ltrBody) return "rtl";
    if (ltrBody > rtlBody) return "ltr";

    return fallbackDirection;
  }

  /* =====================================================
    11C. MARKDOWN PREVIEW
  ===================================================== */

  function updateSmartPreview(root) {
    if (!(root instanceof Element)) return;

    const documentDirection = classifyText(getNaturalText(root)) || "ltr";

    root.dataset.cursorSmartDirection = documentDirection;

    /*
      Remove inline properties left by the earliest console test.
    */
    root.style.removeProperty("direction");
    root.style.removeProperty("text-align");

    root.querySelectorAll(".tableWrapper > table").forEach((table) => {
      table.dataset.cursorSmartDirection = detectTableDirection(
        table,
        documentDirection,
      );
    });
  }

  function updateAllSmartPreviews() {
    document.querySelectorAll(PREVIEW_SELECTOR).forEach(updateSmartPreview);
  }

  /* =====================================================
    11D. AGENT MESSAGE HISTORY
  ===================================================== */

  function updateAssistantMessage(root) {
    const direction = detectMessageDirection(root);

    if (!direction) {
      delete root.dataset.cursorSmartAgentDirection;
      return;
    }

    root.dataset.cursorSmartAgentDirection = direction;

    /*
      Agent tables are independent from the language of the
      surrounding response.
    */
    root.querySelectorAll("table.markdown-table").forEach((table) => {
      table.dataset.cursorSmartTableDirection = detectTableDirection(
        table,
        direction,
      );
    });
  }

  function updateAllAssistantMessages() {
    document
      .querySelectorAll(ASSISTANT_SELECTOR)
      .forEach(updateAssistantMessage);
  }

  function updateUserHistoryMessage(root) {
    const direction = detectMessageDirection(root);

    if (!direction) {
      delete root.dataset.cursorSmartAgentDirection;
      return;
    }

    root.dataset.cursorSmartAgentDirection = direction;
  }

  function updateAllUserHistoryMessages() {
    document
      .querySelectorAll(USER_HISTORY_SELECTOR)
      .forEach(updateUserHistoryMessage);
  }

  /* =====================================================
    11E. LIVE PROMPT
    Stable ties prevent direction jumping while typing
  ===================================================== */

  function detectLiveInputDirection(input) {
    const text = (input.textContent || "").trim();
    const scores = getScriptScores(text);

    if (scores.rtl === 0 && scores.ltr === 0) {
      return null;
    }

    if (scores.rtl > scores.ltr) return "rtl";
    if (scores.ltr > scores.rtl) return "ltr";

    /*
      Exact tie: preserve the current live direction.
    */
    const previous = input.dataset.cursorSmartInputDirection;

    if (previous === "rtl" || previous === "ltr") {
      return previous;
    }

    /*
      First decision is tied: use the first strong script.
    */
    const firstStrong = text.match(/[\p{Script=Arabic}\p{Script=Latin}]/u);

    if (!firstStrong) return null;

    return /\p{Script=Arabic}/u.test(firstStrong[0]) ? "rtl" : "ltr";
  }

  function updateLiveInput(input) {
    const direction = detectLiveInputDirection(input);

    if (!direction) {
      delete input.dataset.cursorSmartInputDirection;
      return;
    }

    input.dataset.cursorSmartInputDirection = direction;
  }

  function updateAllLiveInputs() {
    document.querySelectorAll(LIVE_INPUT_SELECTOR).forEach(updateLiveInput);
  }

  function handleLiveInputEvent(event) {
    const target =
      event.target instanceof Element
        ? event.target
        : event.target.parentElement;

    const input = target?.closest(LIVE_INPUT_SELECTOR);

    if (!input) return;

    updateLiveInput(input);
  }

  /* =====================================================
    11F. UNIFIED UPDATE + MUTATION OBSERVER
  ===================================================== */

  function updateAllSmartDirection() {
    /*
      Order matters:
      message direction is assigned before Agent table fallback.
    */
    updateAllSmartPreviews();
    updateAllAssistantMessages();
    updateAllUserHistoryMessages();
    updateAllLiveInputs();
  }

  let smartUpdateTimer = null;

  function scheduleSmartUpdate() {
    clearTimeout(smartUpdateTimer);

    smartUpdateTimer = setTimeout(() => {
      updateAllSmartDirection();
    }, 80);
  }

  const smartObserver = new MutationObserver((mutations) => {
    let relevant = false;

    for (const mutation of mutations) {
      const target =
        mutation.target instanceof Element
          ? mutation.target
          : mutation.target.parentElement;

      /*
        Existing Preview, Agent response/history, or composer changed.
      */
      if (
        target?.closest(
          [
            ".markdown-editor-react",
            '[data-message-kind="assistant"]',
            USER_HISTORY_SELECTOR,
            LIVE_INPUT_SELECTOR,
          ].join(","),
        )
      ) {
        relevant = true;
        break;
      }

      /*
        A new relevant subtree was mounted.
      */
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;

          const relevantSelector = [
            ".markdown-editor-react",
            '[data-message-kind="assistant"]',
            USER_HISTORY_SELECTOR,
            LIVE_INPUT_SELECTOR,
          ].join(",");

          if (
            node.matches?.(relevantSelector) ||
            node.querySelector?.(relevantSelector)
          ) {
            relevant = true;
            break;
          }
        }
      }

      if (relevant) break;
    }

    if (relevant) {
      scheduleSmartUpdate();
    }
  });

  smartObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  /*
    Input events make live typing react immediately instead of
    waiting for the observer debounce.
  */
  document.addEventListener("input", handleLiveInputEvent, true);
  document.addEventListener("compositionend", handleLiveInputEvent, true);

  updateAllSmartDirection();

  /* =====================================================
    11G. RUNTIME CLEANUP HANDLE
  ===================================================== */

  window[SMART_RUNTIME_KEY] = {
    cleanup() {
      smartObserver.disconnect();
      clearTimeout(smartUpdateTimer);

      document.removeEventListener("input", handleLiveInputEvent, true);

      document.removeEventListener(
        "compositionend",
        handleLiveInputEvent,
        true,
      );
    },
  };

  console.warn(
    "%c RTL Fix + Smart Preview + Smart Agent Applied ",
    "background: #9c27b0; color: #fff; font-size: 14px; padding: 4px; border-radius: 4px;",
  );
})();
