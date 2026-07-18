/*
the cycle is:

user action
 state changes
-> listeners run
-> app rerenders
-> UI updates

*/

export function createStore(startingState = {}){
    let currentState = startingState;
    let listeners = [];

    function getState(){
        return currentState;
    }

    function setState(newStateOrFunction){
        if (typeof newStateOrFunction === "function"){
            currentState = newStateOrFunction(currentState);
        }else{
            currentState = {
                ...currentState,
                ...newStateOrFunction,
            };
        }

        for (let i=0; i<listeners.length; i++){
            listeners[i](currentState);
        }
    }

    function subscribe(listenerFunction) {
        listeners.push(listenerFunction);
    }

    return {
        getState,
        setState,
        subscribe
    };
}