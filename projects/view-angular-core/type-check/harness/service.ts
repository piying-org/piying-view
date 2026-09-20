import * as ts from 'typescript';

export type DiagnosticInfo = {
  line: number;
  start: number;
  message: string;
};

/** 单个用例文件的编译视图 */
export type FileChecker = {
  completionsAt(pos: number): string[];
  diagnostics(): DiagnosticInfo[];
  dispose(): void;
};

/** 从 tsconfig.json 读编译选项, 保证 IDE 与框架用的是同一套配置 */
export function loadOptions(tsconfigPath: string): ts.CompilerOptions {
  const parsed = ts.getParsedCommandLineOfConfigFile(
    tsconfigPath,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (d) => {
        throw new Error(ts.flattenDiagnosticMessageText(d.messageText, '\n'));
      },
    },
  );
  if (!parsed) throw new Error(`无法解析 ${tsconfigPath}`);
  return { ...parsed.options, noEmit: true };
}

/**
 * 为单个用例文件建一个内存 LanguageService。
 * 文件不落盘(内容以传入 text 为准), 但路径仍在仓库内, 保证裸导入可解析。
 */
export function createFileChecker(
  fileName: string,
  text: string,
  options: ts.CompilerOptions,
  currentDir: string,
): FileChecker {
  const norm = (p: string) => p.replace(/\\/g, '/').toLowerCase();
  const key = norm(fileName);

  const host: ts.LanguageServiceHost = {
    getScriptFileNames: () => [fileName],
    getScriptVersion: () => '1',
    getScriptSnapshot: (f) => {
      const content = norm(f) === key ? text : ts.sys.readFile(f);
      return content === undefined ? undefined : ts.ScriptSnapshot.fromString(content);
    },
    getCurrentDirectory: () => currentDir,
    getCompilationSettings: () => options,
    getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
    fileExists: (f) => norm(f) === key || ts.sys.fileExists(f),
    readFile: (f) => (norm(f) === key ? text : ts.sys.readFile(f)),
    readDirectory: (...a) => ts.sys.readDirectory(...a),
    directoryExists: (d) => ts.sys.directoryExists(d),
    getDirectories: (d) => ts.sys.getDirectories(d),
  };

  const service = ts.createLanguageService(host);
  const program = service.getProgram()!;
  const sf = program.getSourceFile(fileName);
  if (!sf) throw new Error(`用例文件未能载入: ${fileName}`);

  return {
    completionsAt: (pos) => {
      const info = service.getCompletionsAtPosition(fileName, pos, {});
      return (info?.entries ?? []).map((e) => e.name).sort();
    },
    diagnostics: () =>
      program
        .getSemanticDiagnostics(sf)
        .map((d) => ({
          start: d.start ?? 0,
          line: sf ? sf.getLineAndCharacterOfPosition(d.start ?? 0).line + 1 : 0,
          message: ts.flattenDiagnosticMessageText(d.messageText, ' '),
        })),
    dispose: () => service.dispose(),
  };
}
