import React, { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import { Highlight } from 'prism-react-renderer';
import copy from 'copy-text-to-clipboard';
import Copy from '../../../static/img/icons/copy.svg';
import rangeParser from 'parse-numeric-range';
import { usePrismTheme, parseCodeBlockTitle } from '@docusaurus/theme-common/internal';
import Translate, { translate } from '@docusaurus/Translate';
import styles from './styles.module.scss';

const highlightLinesRangeRegex = /{([\d,-]+)}/;

const getHighlightDirectiveRegex = (languages = ['js', 'jsBlock', 'jsx', 'python', 'html']) => {
  const comments = {
    js: { start: '\\/\\/', end: '' },
    jsBlock: { start: '\\/\\*', end: '\\*\\/' },
    jsx: { start: '\\{\\s*\\/\\*', end: '\\*\\/\\s*\\}' },
    python: { start: '#', end: '' },
    html: { start: '<!--', end: '-->' },
  };
  const directives = ['highlight-next-line', 'highlight-start', 'highlight-end'].join('|');
  const commentPattern = languages
    .map((lang) => `(?:${comments[lang].start}\\s*(${directives})\\s*${comments[lang].end})`)
    .join('|');
  return new RegExp(`^\\s*(?:${commentPattern})\\s*$`);
};

const highlightDirectiveRegex = (lang) => {
  switch (lang) {
    case 'js':
    case 'javascript':
    case 'ts':
    case 'typescript':
      return getHighlightDirectiveRegex(['js', 'jsBlock']);
    case 'jsx':
    case 'tsx':
      return getHighlightDirectiveRegex(['js', 'jsBlock', 'jsx']);
    case 'html':
      return getHighlightDirectiveRegex(['js', 'jsBlock', 'html']);
    case 'python':
    case 'py':
      return getHighlightDirectiveRegex(['python']);
    default:
      return getHighlightDirectiveRegex();
  }
};

export default function CodeBlock({ children, className: languageClassName, metastring, title, hideCopy }) {
  const prismTheme = usePrismTheme();
  const [showCopied, setShowCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const codeBlockTitle = parseCodeBlockTitle(metastring) || title;
  const button = useRef(null);
  let highlightLines = [];
  const hideButton = hideCopy || false;
  const content = Array.isArray(children) ? children.join('') : children;

  if (metastring && highlightLinesRangeRegex.test(metastring)) {
    const highlightLinesRange = metastring.match(highlightLinesRangeRegex)[1];
    highlightLines = rangeParser(highlightLinesRange).filter((n) => n > 0);
  }

  let language = languageClassName && languageClassName.replace(/language-/, '');
  let code = content ? content.replace(/\n$/, '') : '';

  if (highlightLines.length === 0 && language !== undefined) {
    let range = '';
    const directiveRegex = highlightDirectiveRegex(language);
    const lines = code.split('\n');
    let blockStart;

    for (let index = 0; index < lines.length; ) {
      const line = lines[index];
      const lineNumber = index + 1;
      const match = line.match(directiveRegex);

      if (match !== null) {
        const directive = match.slice(1).reduce((final, item) => final || item, undefined);
        switch (directive) {
          case 'highlight-next-line':
            range += `${lineNumber},`;
            break;
          case 'highlight-start':
            blockStart = lineNumber;
            break;
          case 'highlight-end':
            range += `${blockStart}-${lineNumber - 1},`;
            break;
          default:
            break;
        }
        lines.splice(index, 1);
      } else {
        index += 1;
      }
    }
    highlightLines = rangeParser(range);
    code = lines.join('\n');
  }

  const handleCopyCode = () => {
    copy(code);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <Highlight key={String(mounted)} theme={prismTheme} code={code} language={language || 'text'}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <div className={styles.codeBlockContainer}>
          {codeBlockTitle && (
            <div style={style} className={styles.codeBlockTitle}>
              {codeBlockTitle}
            </div>
          )}
          <div className={clsx(styles.codeBlockContent, language)}>
            <div
              tabIndex={0}
              className={clsx(className, styles.codeBlock, 'thin-scrollbar', {
                [styles.codeBlockWithTitle]: codeBlockTitle,
              })}
            >
              <div className={styles.codeBlockLines} style={style}>
                {tokens.map((line, i) => {
                  if (line.length === 1 && line[0].content === '') {
                    line[0].content = '\n';
                  }
                  const lineProps = getLineProps({ line, key: i });
                  if (highlightLines.includes(i + 1)) {
                    lineProps.className = `${lineProps.className} docusaurus-highlight-code-line`;
                  }
                  return (
                    <div key={i} {...lineProps}>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token, key })} />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
            {!hideButton && (
              <button
                ref={button}
                type="button"
                aria-label={translate({
                  id: 'theme.CodeBlock.copyButtonAriaLabel',
                  message: 'Copy code to clipboard',
                  description: 'The ARIA label for copy code blocks button',
                })}
                className={`copyButton ${clsx(styles.copyButton)}`}
                onClick={handleCopyCode}
              >
                {showCopied ? (
                  <Translate
                    id="theme.CodeBlock.copied"
                    description="The copied button label on code blocks"
                  >
                    Copied
                  </Translate>
                ) : (
                  <Copy />
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </Highlight>
  );
}
