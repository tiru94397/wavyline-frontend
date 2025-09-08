import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Bold, Italic, Code, Link, Type, Strikethrough } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string, formatted: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface FormatAction {
  type: 'bold' | 'italic' | 'code' | 'strikethrough';
  symbol: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function RichTextEditor({ value, onChange, placeholder, disabled }: RichTextEditorProps) {
  const [showFormatting, setShowFormatting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  const formatActions: FormatAction[] = [
    { type: 'bold', symbol: '*', icon: Bold },
    { type: 'italic', symbol: '_', icon: Italic },
    { type: 'code', symbol: '`', icon: Code },
    { type: 'strikethrough', symbol: '~', icon: Strikethrough },
  ];

  const handleSelectionChange = () => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart);
      setSelectionEnd(textareaRef.current.selectionEnd);
    }
  };

  const applyFormat = (action: FormatAction) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = selectionStart;
    const end = selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText: string;
    let newCursorPos: number;

    if (selectedText) {
      // Format selected text
      const formatted = `${action.symbol}${selectedText}${action.symbol}`;
      newText = value.substring(0, start) + formatted + value.substring(end);
      newCursorPos = start + formatted.length;
    } else {
      // Insert formatting symbols at cursor
      const formatted = `${action.symbol}${action.symbol}`;
      newText = value.substring(0, start) + formatted + value.substring(end);
      newCursorPos = start + action.symbol.length;
    }

    onChange(newText, convertToHTML(newText));

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const convertToHTML = (text: string): string => {
    let html = text;
    
    // Bold: *text* -> <strong>text</strong>
    html = html.replace(/\*([^\*]+)\*/g, '<strong>$1</strong>');
    
    // Italic: _text_ -> <em>text</em>
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Code: `text` -> <code>text</code>
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Strikethrough: ~text~ -> <del>text</del>
    html = html.replace(/~([^~]+)~/g, '<del>$1</del>');
    
    return html;
  };

  const getPreviewText = (): JSX.Element[] => {
    const parts = [];
    let remainingText = value;
    let key = 0;

    // Process bold text
    remainingText = remainingText.replace(/\*([^\*]+)\*/g, (match, content) => {
      parts.push(
        <span key={key++} className="font-bold text-slate-800 dark:text-slate-200">
          {content}
        </span>
      );
      return `__PLACEHOLDER_${parts.length - 1}__`;
    });

    // Process italic text
    remainingText = remainingText.replace(/_([^_]+)_/g, (match, content) => {
      parts.push(
        <span key={key++} className="italic text-slate-700 dark:text-slate-300">
          {content}
        </span>
      );
      return `__PLACEHOLDER_${parts.length - 1}__`;
    });

    // Process code text
    remainingText = remainingText.replace(/`([^`]+)`/g, (match, content) => {
      parts.push(
        <code key={key++} className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-sm font-mono text-slate-800 dark:text-slate-200">
          {content}
        </code>
      );
      return `__PLACEHOLDER_${parts.length - 1}__`;
    });

    // Process strikethrough text
    remainingText = remainingText.replace(/~([^~]+)~/g, (match, content) => {
      parts.push(
        <span key={key++} className="line-through text-slate-600 dark:text-slate-400">
          {content}
        </span>
      );
      return `__PLACEHOLDER_${parts.length - 1}__`;
    });

    // Split by placeholders and rebuild
    const segments = remainingText.split(/(__PLACEHOLDER_\d+__)/);
    const result: JSX.Element[] = [];

    segments.forEach((segment, index) => {
      const placeholderMatch = segment.match(/^__PLACEHOLDER_(\d+)__$/);
      if (placeholderMatch) {
        const partIndex = parseInt(placeholderMatch[1]);
        result.push(parts[partIndex]);
      } else if (segment) {
        result.push(
          <span key={`text-${index}`} className="text-slate-700 dark:text-slate-300">
            {segment}
          </span>
        );
      }
    });

    return result;
  };

  return (
    <div className="relative">
      {/* Formatting Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ 
          opacity: showFormatting ? 1 : 0, 
          y: showFormatting ? 0 : -10,
          height: showFormatting ? 'auto' : 0
        }}
        className="overflow-hidden border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-t-lg"
      >
        <div className="flex items-center space-x-1 p-2">
          {formatActions.map((action) => (
            <Button
              key={action.type}
              variant="ghost"
              size="sm"
              onClick={() => applyFormat(action)}
              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
              title={`${action.type} (${action.symbol}text${action.symbol})`}
            >
              <action.icon className="h-4 w-4" />
            </Button>
          ))}
          
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-2" />
          
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Use *bold*, _italic_, `code`, ~strike~
          </span>
        </div>
      </motion.div>

      {/* Text Input */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value, convertToHTML(e.target.value))}
          onSelect={handleSelectionChange}
          onFocus={() => setShowFormatting(true)}
          onBlur={() => setTimeout(() => setShowFormatting(false), 200)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full p-3 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all ${
            showFormatting ? 'rounded-b-lg' : 'rounded-lg'
          }`}
          rows={3}
        />

        {/* Format Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFormatting(!showFormatting)}
          className="absolute top-2 right-2 h-6 w-6 p-0 text-slate-400 hover:text-blue-500"
        >
          <Type className="h-3 w-3" />
        </Button>
      </div>

      {/* Preview */}
      {value && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600"
        >
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            Preview:
          </div>
          <div className="text-sm leading-relaxed">
            {getPreviewText()}
          </div>
        </motion.div>
      )}
    </div>
  );
}