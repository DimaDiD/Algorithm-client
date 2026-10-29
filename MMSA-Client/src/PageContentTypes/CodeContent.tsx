import { useEffect, useMemo, useRef, useState } from "react";
import { CheckOutlined, CopyOutlined } from "@ant-design/icons";
import hljs from "highlight.js/lib/core";
import csharp from "highlight.js/lib/languages/csharp";
import cpp from "highlight.js/lib/languages/cpp";
import delphi from "highlight.js/lib/languages/delphi";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/atom-one-dark.css";

hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("pascal", delphi);
hljs.registerLanguage("python", python);

const LANGUAGE_LABELS: Record<string, string> = {
  csharp: "C#",
  cpp: "C++",
  pascal: "Pascal",
  python: "Python",
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

type Props = {
  code: string;
  language: string;
  showHeader?: boolean;
};

const CodeContent = ({ code, language, showHeader = true }: Props) => {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimer = useRef<number>();

  const highlighted = useMemo(() => {
    try {
      return hljs.getLanguage(language)
        ? hljs.highlight(code, { language }).value
        : hljs.highlightAuto(code).value;
    } catch {
      return escapeHtml(code);
    }
  }, [code, language]);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setIsCopied(false), 1500);
    } catch {
      setIsCopied(false);
    }
  };

  return (
    <figure className="code-block">
      {showHeader && (
        <figcaption className="code-block__bar">
          <span>{LANGUAGE_LABELS[language] ?? language}</span>
          <button type="button" className="code-block__copy" onClick={copy} aria-live="polite">
            {isCopied ? <CheckOutlined /> : <CopyOutlined />}
            {isCopied ? "Скопійовано" : "Копіювати"}
          </button>
        </figcaption>
      )}
      <pre>
        <code className={`hljs language-${language}`} dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </figure>
  );
};

export default CodeContent;
