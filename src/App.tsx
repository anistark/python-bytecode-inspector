import React, { useEffect, useState } from "react";
import { FaGithub, FaPython } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import "./index.css";

declare global {
  interface Window {
    loadPyodide: () => Promise<any>;
  }
}

const PythonIcon = FaPython as React.ElementType;
const GithubIcon = FaGithub as React.ElementType;
const TwitterIcon = FaXTwitter as React.ElementType;

export default function App() {
  const [code, setCode] = useState("x = 10\nfor i in range(x): print(i * 2)");
  const [output, setOutput] = useState("Loading Pyodide...");
  const [pyodide, setPyodide] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    (async () => {
      const pyodide = await window.loadPyodide();
      await pyodide.loadPackage(["micropip"]);

      await pyodide.runPythonAsync(`
import ast, dis
def inspect_code(source_code):
    try:
        tree = ast.parse(source_code)
        ast_dump = ast.dump(tree, indent=4)
    except Exception as e:
        ast_dump = "Error parsing AST: " + str(e)

    try:
        compiled = compile(source_code, "<string>", "exec")
        import io
        import contextlib
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            dis.dis(compiled)
        bytecode = buf.getvalue()
        raw_bytes = compiled.co_code
    except Exception as e:
        bytecode = "Error compiling: " + str(e)
        raw_bytes = b''

    return ast_dump + "\\n\\nBytecode:\\n" + bytecode + "\\n\\nRaw Bytecode:\\n" + str(raw_bytes)
      `);

      setPyodide(pyodide);
      setOutput("Ready! Paste Python and click Inspect.");
    })();
  }, []);

  const runInspection = async () => {
    if (!pyodide) return;
    const inspect = pyodide.globals.get("inspect_code");
    const result = inspect(code);
    setOutput(result);
  };

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <div className={isDarkMode ? "app dark-mode" : "app light-mode"}>
      <nav className={isDarkMode ? "navbar dark-mode" : "navbar light-mode"}>
        <PythonIcon size={24} /> Python Bytecode Inspector
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? "🌞" : "🌙"}
        </button>
      </nav>

      <div className="container">
        <div
          className={
            isDarkMode ? "left-pane dark-mode" : "left-pane light-mode"
          }
        >
          <h2>Code Input</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={
              isDarkMode ? "textarea dark-mode" : "textarea light-mode"
            }
          />
          <button onClick={runInspection} className="button">
            🔍 Inspect
          </button>
        </div>

        <div
          className={
            isDarkMode ? "right-pane dark-mode" : "right-pane light-mode"
          }
        >
          <h2>Analysis Output</h2>
          <pre
            className={isDarkMode ? "output dark-mode" : "output light-mode"}
          >
            {output}
          </pre>
        </div>
      </div>

      <footer className={isDarkMode ? "footer dark-mode" : "footer light-mode"}>
        Built with 💙
        <div className="social-links">
          <a
            href="https://github.com/anistark/python-bytecode-inspector"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubIcon size={24} />
          </a>
          <a
            href="https://x.com/kranirudha"
            target="_blank"
            rel="noopener noreferrer"
          >
            <TwitterIcon size={24} />
          </a>
        </div>
      </footer>
    </div>
  );
}
