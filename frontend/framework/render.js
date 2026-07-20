import { attachEventsToElement, isEventAttr, getEventName } from "./events.js";

// we remember the container and the last vnode tree we rendered into it,
// so that on the next update we have something to compare the new tree against
let rootContainer = null;
let previousVNode = null;

// this only runs ONCE, to do the very first render of the app
export function render(nodeObject, container) {
    rootContainer = container;
    previousVNode = nodeObject;

    container.innerHTML = "";
    const element = createRealDomeElement(nodeObject);
    container.appendChild(element);
}

// this runs on every state change AFTER the first render
// instead of wiping the container, it patches only what changed
export function update(newVNode) {
    if (!rootContainer || !previousVNode) {
        // update() was called before render() ever ran, so just do a normal render
        render(newVNode, rootContainer);
        return;
    }

    // the root container currently has exactly one real child element,
    // the one that matches previousVNode, sitting at index 0
    patch(rootContainer, previousVNode, newVNode, 0);

    previousVNode = newVNode;
}

// compares oldNode and newNode and applies the minimum changes needed to the real DOM node currently living at parent.childNodes[index]
function patch(parent, oldNode, newNode, index) {
    const existingElement = parent.childNodes[index];

    // if there was nothing here before, just add the new node
    if (oldNode === undefined || oldNode === null) {
        parent.appendChild(createRealDomeElement(newNode));
        return;
    }

    // if the node was removed in the new tree, remove it from the DOM
    if (newNode === undefined || newNode === null) {
        if (existingElement) {
            parent.removeChild(existingElement);
        }
        return;
    }

    //the node type changed completely (different tag, or text vs element)
    //there is no safe way to patch this in place, so we replace it
    if (nodeTypeChanged(oldNode, newNode)) {
        parent.replaceChild(createRealDomeElement(newNode), existingElement);
        return;
    }

    // if both are plain text nodes
    if (typeof newNode === "string") {
        if (newNode !== oldNode) {
            existingElement.textContent = newNode;
        }
        return;
    }

    //same tag as before, so keep the SAME real DOM element
    //just update its attributes/events in place, then diff its children
    updateAttributesAndEvents(existingElement, oldNode.attrs, newNode.attrs);

    const oldChildren = oldNode.children || [];
    const newChildren = newNode.children || [];
    const longestLength = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < longestLength; i++) {
        patch(existingElement, oldChildren[i], newChildren[i], i);
    }
}

//returns true if the two nodes are different enough that we can't patch in place
function nodeTypeChanged(oldNode, newNode) {
    if (typeof oldNode !== typeof newNode) {
        return true;
    }

    if (typeof newNode === "string") {
        //both are strings, and we already handled the equality case above,
        //so as far as "type" goes, this is not a change
        return false;
    }

    return oldNode.tag !== newNode.tag;
}

//updates an existing real element's attributes and event listeners
//to match the new vnode, without recreating the element itself
function updateAttributesAndEvents(element, oldAttrs = {}, newAttrs = {}) {
    //remove old normal attributes that are no longer present in the new vnode
    for (const key in oldAttrs) {
        if (isEventAttr(key)) continue;

        if (!(key in newAttrs)) {
            const domAttrName = key === "className" ? "class" : key;
            element.removeAttribute(domAttrName);
        }
    }

    //remove old event listeners before attaching new ones, otherwise we'd
    //stack up duplicate listeners on the same element every single render
    for (const key in oldAttrs) {
        if (!isEventAttr(key)) continue;
        if (typeof oldAttrs[key] !== "function") continue;

        element.removeEventListener(getEventName(key), oldAttrs[key]);
    }

    //set/update normal attributes for the new vnode
    addAttributesToElement(element, newAttrs);

    //"value" is special: setAttribute only sets the DEFAULT value of an input,
    //it does not update what the input currently shows on screen. For a
    //controlled input (value tied to state, like the nickname input) we also
    //need to set the live DOM property, not just the attribute.
    if ("value" in newAttrs && element.value !== newAttrs.value) {
        element.value = newAttrs.value;
    }

    //attach the new event listeners
    attachEventsToElement(element, newAttrs);
}

//this function turns the framework node into one real DOM node
//(unchanged - still used whenever a brand new node needs to be created)
function createRealDomeElement(nodeObject) {
    //if the nodeObject is a string, create a text node
    if (typeof nodeObject === "string") {
        return document.createTextNode(nodeObject);
    }

    //create the element using the tag name
    const element = document.createElement(nodeObject.tag);

    //add normal attributes to the element
    addAttributesToElement(element, nodeObject.attrs);

    //attach events to the element
    attachEventsToElement(element, nodeObject.attrs);

    //create and append all children
    for (let i = 0; i < nodeObject.children.length; i++) {
        const child = nodeObject.children[i];
        const childElement = createRealDomeElement(child);
        element.appendChild(childElement);
    }
    return element;
}

/*
this function adds normal attributes to the actual HTML element

attrs: {
    id: "todo-input",
    placeholder: "What needs to be done?"
  }

*/
function addAttributesToElement(element, attrs = {}) {
    for (const key in attrs) {
        const value = attrs[key];

        if (key.startsWith("on")) {
            continue;
        }

        if (key === "className") {
            element.setAttribute("class", value);
            continue;
        }

        if (key === "checked" || key === "disabled" || key === "selected") {
            if (value) {
                element.setAttribute(key, "");
            } else {
                element.removeAttribute(key);
            }
            continue;
        }

        element.setAttribute(key, value);
    }
}