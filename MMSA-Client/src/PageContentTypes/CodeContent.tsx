import { useEffect, useMemo, useRef, useState } from "react";
import { Popover } from "antd";
import { CheckOutlined, CopyOutlined, InfoCircleOutlined } from "@ant-design/icons";
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
  topics?: string[];
};

const CodeContent = ({ code, language, showHeader = true, topics = [] }: Props) => {
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
          <div className="code-block__actions">
            {topics.length > 0 && (
              <Popover
                trigger={["hover", "click"]}
                placement="bottomRight"
                title="Щоб зрозуміти цей код, варто знати:"
                content={
                  <ul className="topics-popover">
                    {topics.map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                }
              >
                <button type="button" className="code-block__copy" aria-label="Які теми потрібно знати для цього коду">
                  <InfoCircleOutlined />
                  <span className="code-block__label">Теми · {topics.length}</span>
                </button>
              </Popover>
            )}
            <button type="button" className="code-block__copy" onClick={copy} aria-live="polite">
              {isCopied ? <CheckOutlined /> : <CopyOutlined />}
              <span className="code-block__label">{isCopied ? "Скопійовано" : "Копіювати"}</span>
            </button>
          </div>
        </figcaption>
      )}
      <pre>
        <code className={`hljs language-${language}`} dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </figure>
  );
};

export default CodeContent;
