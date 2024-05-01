import React from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/monokai.css';
import "../PageContentTypes/CodeContentStyle.css";
import delphi from 'highlight.js/lib/languages/delphi';

hljs.registerLanguage('pascal', delphi);
hljs.registerLanguage('csharp', require('highlight.js/lib/languages/csharp'));
hljs.registerLanguage('cpp', require('highlight.js/lib/languages/cpp'));
hljs.registerLanguage('python', require('highlight.js/lib/languages/python'));

const CodeContent = ({ code, language }: { code: string, language: string }) => {
    const codeRef = React.useRef(null);
    React.useEffect(() => {
        if (codeRef.current) {
            hljs.highlightElement(codeRef.current);
        }
    }, [code, language]); 

    return (
      <div className="code-block"> 
      <pre>
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
      </div>
    );
};
  
export default CodeContent;