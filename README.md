# Flubber Flow Builder

A functional, fluent JavaScript/TypeScript DSL for building [Flubber](https://github.com/bhlangonijr/flubber) call flow JSON scripts.  
Create readable, type-safe logic in code — compile to Flubber-compatible JSON via CLI.

---

## 📁 Project Structure

```bash
src/
├─ index.ts # Flow builder entry
├─ cli.ts # CLI to compile JS/TS files to JSON
└─ actions.ts # Base/native action definitions
```
---

## ⚙️ Dev Environment Setup

1. **Clone this repository**

```bash
git clone https://github.com/bhlangonijr/flubber-flow.git
cd flubber-flow
```

2. **Install dependencies and TypeScript tooling**

```bash
npm install --save-dev typescript ts-node @types/node
```

3. **Install CLI dependencies**

```bash
npm install
```

4. **Compile TypeScript**

```bash
npx tsc
```

5. **Link the CLI tool locally**

```bash
npm link
```

This creates a global CLI command `flubber-flow`.


## 🚀 Usage
### Write a flow file in JS or TS

Make first the local package available as a pseudo-installed module:
```bash

npm link @flubber/flow-builder
```

Example: `my-flow.ts`
```javascript
import { flow } from "@flubber/flow-builder";

export default flow("my-script")
  .node("main", it =>
    it
      .say("Welcome to the system")
      .run("collectInput", { USER: "{{session.user}}" })
      .exit()
  )
  .build();
```

## Generate the JSON

```bash
flubber-flow -i my-flow.ts -o my-script.json
```

##🔌 Extending with Custom Actions
You can override or extend native actions like run, or add your own (e.g. log, httpRequest, etc.)

```javascript
const extendActions = (node, ctx) => ({
  run: (seq, args) => {
    node.sequence.push({
      action: "run",
      args: {
        do: {
          sequence: seq,
          args: { ...args, injected: true }
        }
      }
    });
  },
  log: (text) => {
    node.sequence.push({ action: "log", args: { text } });
  }
});

export default flow("extensible-script", extendActions)
  .node("main", it =>
    it
      .log("Start")
      .run("nextFlow")
      .say("Goodbye!")
  )
  .build();

 ```
 
## 🧪 Testing Your Flow
After building your .json file:

```bash
cat my-script.json
```
Then deploy it to Flubber or simulate via your test setup.

## 🧼 Cleanup
To unlink the local CLI command later:
```bash
npm unlink
```

---

