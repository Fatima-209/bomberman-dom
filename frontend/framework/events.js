//attach events to the element
export function attachEventsToElement(element, attrs = {}){
    //attrs: {onClick: handleClick}
    for (const key in attrs) {
        const value = attrs[key];

        //if the key is not an event prop skip it
        if (!isEventAttr(key)) {
            continue;
        }

        //if the value is not a function skip it
        if (typeof value !== "function"){
            continue;
        }

        const eventName = getEventName(key);

        //attach the event listener to the element
        element.addEventListener(eventName, value); 
    }
}

//check if the attrs is an event prop
//onClick, onInput, etc...
export function isEventAttr(key){
    return key.startsWith("on");
}

//convert onClick to click, so it will be a browser event name
export function getEventName(propName) {
    return propName.slice(2).toLowerCase();
}