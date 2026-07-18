export function getCurrentPath() {
    const hash = window.location.hash;

    if (hash === "" || hash === "#") {
        return "#/";
    }

    return hash;
}

export function goToPath(path) {
    window.location.hash = path;
}

export function startRouter(onRouteChange) {
    window.addEventListener("hashchange", function () {
        onRouteChange(getCurrentPath());
    });

    onRouteChange(getCurrentPath());
}