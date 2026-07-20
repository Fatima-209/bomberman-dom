# Mini JavaScript Framework

## What is this?

This is a simple JavaScript framework built from scratch (no libraries).

It helps you:
- Create UI using JavaScript
- Handle events (click, typing, etc.)
- Manage state (data)
- Handle routing (URL changes)

Instead of writing HTML directly, you describe your UI using JavaScript.

---

# How it works

The main idea:

**UI = function(state)**

This means:
- The UI depends on the state
- When state changes → UI updates automatically

---

## Flow

User action (click / type)
-> Event runs
-> setState() updates data
-> App runs again
-> UI updates

---

# Getting Started

## HTML

```html
<div id="app"></div>
<script type="module" src="src/main.js"></script>
```

## Import from framework

```js
import {
  createElement,
  render,
  createStore,
  goToPath,
  getCurrentPath,
  startRouter
} from "./framework/index.js";
```

---

# 1. Creating Elements

Use `createElement` to build UI.

## Syntax

```js
createElement(tag, props, ...children)
```

## Example: Simple element

```js
createElement("h1", {}, "Hello World");
```

## Example: With attributes

```js
createElement("input", {
  type: "text",
  placeholder: "Enter name",
  id: "name-input"
});
```

## Example: With event

```js
createElement(
  "button",
  {
    onClick: () => alert("Clicked!")
  },
  "Click Me"
);
```

## Example: Nested elements

```js
createElement(
  "div",
  { className: "container" },
  createElement("h1", {}, "Title"),
  createElement("p", {}, "Paragraph")
);
```

## What this creates

```js
{
  tag: "div",
  props: { className: "container" },
  children: [...]
}
```

This is NOT real DOM yet.

---

# 2. Rendering

`render()` converts virtual elements into real DOM.

## Example

```js
import { render } from "./framework/index.js";

const app = createElement("h1", {}, "Hello");

render(app, document.getElementById("app"));
```

---

## What happens

- Creates real HTML elements
- Adds attributes
- Attaches events
- Renders children

---

# 3. State Management (Store)

The store keeps your app data.

## Create a store

```js
import { createStore } from "./framework/index.js";

const store = createStore({
  count: 0
});
```

## Available functions

```js
store.getState()
store.setState(newState)
store.subscribe(callback)
```

## Example

```js
const store = createStore({
  count: 0
});

console.log(store.getState());

store.setState({
  count: 1
});

store.subscribe(() => {
  console.log("State changed");
});
```

## Important rule

❗ Always use `setState`

Do NOT do:

```js
store.getState().count = 5;
```

Because:
- UI will not update
- Framework will break tracking

---

# 4. Event Handling

Events are written inside elements.

## Example

```js
createElement(
  "button",
  {
    onClick: () => console.log("Clicked")
  },
  "Click"
);
```

---

## Why this works

The framework:
- Detects onClick
- Converts it into a real DOM event
- Attaches it automatically

No need for addEventListener.

---

# 5. Routing

Routing connects the URL with your app state.

## Functions

```js
getCurrentPath()
goToPath(path)
startRouter(callback)
```

## Example

```js
createElement(
  "button",
  {
    onClick: () => goToPath("/active")
  },
  "Active"
);
```

## Flow

Click button
-> goToPath("/active")
-> URL updates
-> router detects change
-> state updates
-> UI re-renders

---

# Full Example

```js
import {
  createElement,
  render,
  createStore
} from "./framework/index.js";

const store = createStore({
  text: "Hello"
});

function App() {
  const state = store.getState();

  return createElement(
    "div",
    {},
    createElement("h1", {}, state.text),
    createElement(
      "button",
      {
        onClick: () => {
          store.setState({ text: "Updated!" });
        }
      },
      "Change Text"
    )
  );
}

function update() {
  render(App(), document.getElementById("app"));
}

store.subscribe(update);
update();
```

---

# Why things work like this

## 1. We don’t touch the DOM directly
We describe UI using objects, not HTML.

## 2. State controls everything
UI always depends on state.

## 3. Automatic updates
When state changes → UI re-renders.

## 4. Separation of concerns
Components → UI  
Store → data  
Router → navigation  

## 5. Framework controls the flow
The framework decides:
- when to render
- when to update

You only describe the UI.

---

# Summary

This framework allows you to:

- Build UI using JavaScript
- Handle events easily
- Manage state globally
- Sync UI with URL

All without using any external libraries.