import { useEffect, useCallback, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND,
    UNDO_COMMAND, REDO_COMMAND, type EditorState, type LexicalEditor,
} from 'lexical';
import {
    $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode,
} from '@lexical/rich-text';
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { ListNode, ListItemNode } from '@lexical/list';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list';
import { $setBlocksType } from '@lexical/selection';
import { $createParagraphNode } from 'lexical';
import {
    FiBold, FiItalic, FiUnderline, FiList,
    FiRotateCcw, FiRotateCw,
} from 'react-icons/fi';
import { LuHeading1, LuHeading2, LuListOrdered, LuQuote } from 'react-icons/lu';

// ── Toolbar ────────────────────────────────────────────────────────────────
function Toolbar() {
    const [editor] = useLexicalComposerContext();

    const formatHeading = (level: 'h1' | 'h2') => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(level));
            }
        });
    };

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode());
            }
        });
    };

    const formatParagraph = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode());
            }
        });
    };

    const btn = 'p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-40';
    const sep = 'w-px h-5 bg-gray-200 mx-1';

    return (
        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-white flex-wrap">
            <button className={btn} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} title="Deshacer">
                <FiRotateCcw className="w-3.5 h-3.5" />
            </button>
            <button className={btn} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} title="Rehacer">
                <FiRotateCw className="w-3.5 h-3.5" />
            </button>
            <div className={sep} />
            <button className={btn} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} title="Negrita">
                <FiBold className="w-3.5 h-3.5" />
            </button>
            <button className={btn} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} title="Cursiva">
                <FiItalic className="w-3.5 h-3.5" />
            </button>
            <button className={btn} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} title="Subrayado">
                <FiUnderline className="w-3.5 h-3.5" />
            </button>
            <div className={sep} />
            <button className={btn} onClick={() => formatHeading('h1')} title="Título 1">
                <LuHeading1 className="w-3.5 h-3.5" />
            </button>
            <button className={btn} onClick={() => formatHeading('h2')} title="Título 2">
                <LuHeading2 className="w-3.5 h-3.5" />
            </button>
            <button className={btn} onClick={formatParagraph} title="Párrafo normal">
                <span className="text-xs font-medium">¶</span>
            </button>
            <div className={sep} />
            <button className={btn} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} title="Lista">
                <FiList className="w-3.5 h-3.5" />
            </button>
            <button className={btn} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} title="Lista numerada">
                <LuListOrdered className="w-3.5 h-3.5" />
            </button>
            <button className={btn} onClick={formatQuote} title="Cita">
                <LuQuote className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

// ── InitialStatePlugin: carga el estado guardado o convierte markdown ─────
function InitialStatePlugin({ lexicalState, initialMarkdown }: { lexicalState?: string; initialMarkdown?: string }) {
    const [editor] = useLexicalComposerContext();
    const loaded = useRef(false);

    useEffect(() => {
        if (loaded.current) return;
        loaded.current = true;

        if (lexicalState) {
            try {
                const state = editor.parseEditorState(lexicalState);
                editor.setEditorState(state);
                return;
            } catch {
                // JSON inválido — continúa con el fallback de markdown
            }
        }

        // Fallback: convertir markdown existente a nodos Lexical
        if (initialMarkdown?.trim()) {
            editor.update(() => {
                $convertFromMarkdownString(initialMarkdown, TRANSFORMERS);
            });
        }
    }, [editor, lexicalState, initialMarkdown]);

    return null;
}

// ── RichTextEditor ─────────────────────────────────────────────────────────
interface RichTextEditorProps {
    /** Estado Lexical serializado (JSON string) para cargar contenido inicial */
    lexicalState?: string;
    /** Markdown a convertir si no hay lexicalState */
    initialMarkdown?: string;
    /** Callback con debounce para persistir cambios */
    onSave?: (lexicalState: string, plainText: string) => void;
    /** Debounce en ms (default 1500) */
    debounceMs?: number;
    placeholder?: string;
    autoFocus?: boolean;
}

const THEME = {
    paragraph: 'mb-1',
    heading: { h1: 'text-2xl font-bold mb-2 mt-4', h2: 'text-xl font-bold mb-2 mt-3' },
    text: { bold: 'font-bold', italic: 'italic', underline: 'underline' },
    list: {
        ul: 'list-disc list-inside mb-2 ml-4',
        ol: 'list-decimal list-inside mb-2 ml-4',
        listitem: 'mb-0.5',
    },
    quote: 'border-l-4 border-gray-300 pl-4 italic text-gray-600 my-3',
};

export default function RichTextEditor({
    lexicalState,
    initialMarkdown,
    onSave,
    debounceMs = 1500,
    placeholder = 'Comienza a escribir...',
    autoFocus = true,
}: RichTextEditorProps) {
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const handleChange = useCallback((state: EditorState, editor: LexicalEditor) => {
        if (!onSave) return;
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const json = JSON.stringify(state);
            let markdown = '';
            state.read(() => {
                markdown = $convertToMarkdownString(TRANSFORMERS);
            });
            if (editor.isEditable()) onSave(json, markdown);
        }, debounceMs);
    }, [onSave, debounceMs]);

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const initialConfig = {
        namespace: 'RichTextEditor',
        theme: THEME,
        nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
        onError: (err: Error) => console.error('Lexical error:', err),
        editable: true,
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="flex flex-col h-full">
                <Toolbar />
                <div className="relative flex-1 overflow-y-auto">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                className="outline-none min-h-full px-8 py-6 text-gray-800 text-base leading-relaxed prose prose-sm max-w-none"
                            />
                        }
                        placeholder={
                            <div className="absolute top-6 left-8 pointer-events-none text-gray-400 select-none">
                                {placeholder}
                            </div>
                        }
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin />
                    <ListPlugin />
                    {autoFocus && <AutoFocusPlugin />}
                    <InitialStatePlugin lexicalState={lexicalState} initialMarkdown={initialMarkdown} />
                    <OnChangePlugin onChange={handleChange} ignoreSelectionChange />
                </div>
            </div>
        </LexicalComposer>
    );
}
