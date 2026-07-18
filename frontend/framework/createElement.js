/*
so when we do <button class="save-btn">Save</button>

I will write it as 
createElement("button", { class: "save-btn" }, "Save")
*/

export function createElement(tag, attrs = {}, ...children) {
return{
    tag,
    attrs: {...attrs},
    children: normalizeChildren(children),
};
}


/*
This function takes an array of children and flattens it
removes any null, undefined, or false values
and converts any numbers to strings
so it just cleans that children array and makes it nice :)
*/
export function normalizeChildren(children) {
return children
.flat(Infinity)
.filter((child) => child !== null && child !== undefined && child !== false)
.map((child) => typeof child === "number" ? String(child) : child);
}