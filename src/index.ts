export type SequenceArgs = Record<string, any>;
export type RunDo = { sequence: string; args?: SequenceArgs };
export type MenuOption = {
  code: string;
  similar?: string[];
  do: RunDo;
};

type Node = { id: string; sequence: any[] };
type Script = {
  id: string;
  author?: { name: string; "e‑mail": string };
  _comment?: string;
  flow: Node[];
  hooks: any[];
  exceptionally?: any;
};

type ActionFactory = (
  node: Node,
  ctx: Record<string, any>
) => Record<string, (...args: any[]) => any>;

export function flow(scriptId: string, extendActions?: ActionFactory) {
  const script: Script = {
    id: scriptId,
    flow: [],
    hooks: [],
    exceptionally: undefined,
  };

  const api: any = {
    build: () => script,
  };

  api.meta = (author: { name: string; "e‑mail": string }) => {
    script.author = author;
    return api;
  };
  api.comment = (c: string) => {
    script._comment = c;
    return api;
  };

  api.node = (name: string, fn: (it: any) => void) => {
    const node: Node = { id: name, sequence: [] };
    script.flow.push(node);

    const ctx: Record<string, any> = {};

    const baseActions = {
      answer: (alias: string) => node.sequence.push({ id: alias, action: "answer" }),
      say: (text: string) => node.sequence.push({ action: "say", args: { text } }),
      exit: () => node.sequence.push({ action: "exit" }),
      run: (seq: string, args?: SequenceArgs) =>
        node.sequence.push({ action: "run", args: { do: { sequence: seq, args } } }),
      expression: (text: string, set?: string) =>
        node.sequence.push({ action: "expression", args: { text, ...(set ? { set } : {}) } }),
      decision: (
        condition: string,
        doSeq: string,
        doArgs?: SequenceArgs,
        elseSeq?: string,
        elseArgs?: SequenceArgs
      ) =>
        node.sequence.push({
          decision: "expression",
          args: {
            condition,
            do: { sequence: doSeq, args: doArgs },
            ...(elseSeq ? { else: { sequence: elseSeq, args: elseArgs } } : {}),
          },
        }),
      rest: (
        method: string,
        url: string,
        body?: any,
        headers?: any,
        set?: string
      ) =>
        node.sequence.push({
          action: "rest",
          args: { method, url, ...(body ? { body } : {}), ...(headers ? { headers } : {}), ...(set ? { set } : {}) },
        }),
      json: (text: string, set?: string, spec?: any) =>
        node.sequence.push({
          action: "json",
          args: { text, ...(set ? { set } : {}), ...(spec ? { spec } : {}) },
        }),
      waitOnDigits: (
        length: number,
        timeout: number,
        set: string,
        isAsync = false
      ) =>
        node.sequence.push({
          action: "waitOnDigits",
          args: { length, timeout, set, async: isAsync },
        }),
      forEach: (
        iterateOver: string,
        setElement: string,
        doSeq: string,
        isParallel = false,
        setResult?: string
      ) =>
        node.sequence.push({
          action: "forEach",
          args: {
            iterateOver,
            setElement,
            do: { sequence: doSeq },
            ...(isParallel ? { isParallel } : {}),
            ...(setResult ? { set: setResult } : {}),
          },
        }),
      menu: (text: string, options: MenuOption[], elseDo: RunDo) =>
        node.sequence.push({ action: "menu", args: { text, options, else: elseDo } }),
      hangup: (reference: string) =>
        node.sequence.push({ action: "hangup", args: { reference } }),
    };

    const combinedActions = {
      ...baseActions,
      ...(extendActions ? extendActions(node, ctx) : {}),
    };

  for (const [key, fnAction] of Object.entries(combinedActions)) {
    ctx[key] = (...args: any[]) => {
      (fnAction as (...args: any[]) => void)(...args);
      return ctx;
    };
  }

    fn(ctx);
    return api;
  };

  api.onEvent = (evt: string, seq: string, args?: SequenceArgs) => {
    script.hooks.push({ event: evt, args: { do: { sequence: seq, args } } });
    return api;
  };

  api.onException = (seq: string, args?: SequenceArgs) => {
    script.exceptionally = { action: "run", args: { do: { sequence: seq, args } } };
    return api;
  };

  return api;
}
