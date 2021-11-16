import "./style.css";

import {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  ComponentPropsWithRef,
  ChangeEventHandler,
  ComponentPropsWithoutRef,
  useCallback
} from "react";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import dark from "react-syntax-highlighter/dist/cjs/styles/prism/vs-dark";

import { injectHTML, injectCSS } from "../../../src/index";

type CodeEditorProps = {
  language: "html" | "css";
  eager?: boolean;
  initial?: string | (() => string);
  onCodeChange?: (code: string) => void;
} & ComponentPropsWithRef<"textarea">;

type CodeEditorRef = {
  getCurrent: () => string;
  update: (formatter: (code: string) => string) => void;
};

const theme = {
  ...dark,
  'pre[class*="language-"]': {
    ...dark['pre[class*="language-"]'],
    margin: "10px",
    padding: "10px",
    overflow: "auto",
    whiteSpace: "nowrap",
    fontFamily: "monospace"
  },
  'code[class*="language-"]': {
    ...dark['code[class*="language-"]'],
    fontFamily: "monospace"
  }
};

const Pre = forwardRef<HTMLPreElement, ComponentPropsWithRef<"pre">>(
  (props, ref) => {
    return <pre {...props} ref={ref} />;
  }
);

const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(
  ({ initial = "", language, eager = false, onCodeChange }, ref) => {
    const [code, setCode] = useState(initial);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLPreElement>(null);

    const tag = useCallback(
      (props: ComponentPropsWithoutRef<"pre">) => (
        <Pre {...props} ref={preRef} />
      ),
      []
    );

    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.value = code;
      }
      onCodeChange?.(code);
    }, []);

    useLayoutEffect(() => {
      synchronizeScroll();
    });

    const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
      if (eager) onCodeChange(e.target.value);

      setCode(e.target.value);
    };

    // syncs scrolls between text area and pre tag from the highlighter
    const synchronizeScroll = () => {
      // nothing to sync scroll
      if (!preRef.current) return;

      if (!textareaRef.current) return;
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    };

    useImperativeHandle(
      ref,
      () => ({
        getCurrent: () => textareaRef.current?.value ?? "",
        update: (formatter) => {
          try {
            if (!textareaRef.current) return;

            const result = formatter(textareaRef.current?.value ?? "");

            textareaRef.current.value = result;

            setCode(result);
          } catch (e) {
            console.warn(e);
          }
        }
      }),
      []
    );

    return (
      <div className="editor-field">
        <textarea
          className="editor"
          onChange={handleChange}
          onScroll={synchronizeScroll}
          autoCorrect="off"
          autoComplete="off"
          spellCheck="false"
          ref={textareaRef}
        />

        <SyntaxHighlighter
          language={language}
          style={theme}
          aria-hidden="true"
          PreTag={tag}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }
);

const Renderer = ({
  html,
  css = "",
  className
}: {
  html: string;
  css?: string;
  className?: string;
  children?: ({ iframe }: { iframe: HTMLIFrameElement | null }) => ReactNode;
}) => {
  const [ref, setRef] = useState<HTMLIFrameElement | null>(null);

  const host = ref?.contentDocument;

  useEffect(() => {
    if (!host) return;

    injectHTML(host, html);
  }, [html]);

  useEffect(() => {
    if (!host) return;

    injectCSS(host, css);
  }, [css]);

  return <iframe ref={setRef} className={className} />;
};

export const Playground = ({
  initialHTML,
  initialCSS
}: {
  initialHTML?: string;
  initialCSS?: string;
}) => {
  const [html, setHtml] = useState("");

  const [css, setCSS] = useState("");

  const htmlRef = useRef<CodeEditorRef>(null);
  const cssRef = useRef<CodeEditorRef>(null);

  const collectUpdates = useCallback(() => {
    setCSS(() => cssRef.current?.getCurrent() ?? "");
    setHtml(() => htmlRef.current?.getCurrent() ?? "");
  }, []);

  const runHandler = () => {
    collectUpdates();
  };

  return (
    <div className="playground">
      <div className="editor-group">
        <CodeEditor language="html" ref={htmlRef} initial={initialHTML} />

        <CodeEditor language="css" ref={cssRef} initial={initialCSS} />

        <div className="controls">
          <button className="run-control" onClick={runHandler}>
            Run
          </button>
        </div>
      </div>

      <Renderer className="renderer" html={html} css={css} />
    </div>
  );
};
