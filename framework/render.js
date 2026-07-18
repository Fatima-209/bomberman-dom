import { attachEventsToElement } from "./events.js";

export function render(nodeObject, container) {
    //first clear the container before rendering
    container.innerHTML = "";

    const element = createRealDomeElement(nodeObject);
    container.appendChild(element);
}


//this function turns the framework node into one real DOM node
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
    for (let i=0; i<nodeObject.children.length; i++){
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
    for (const key in attrs){
        const value = attrs[key];

        if (key.startsWith("on")){
            continue;
        }

        if (key === "className"){
            element.setAttribute("class", value);
            continue;
        }

        if (key === "checked" || key === "disabled" || key === "selected") {
            if (value) {
                element.setAttribute(key, "");
            }
            continue;
        }

        element.setAttribute(key, value);
    }
}