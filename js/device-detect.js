function addWindowResizeListener(dotNetReference) {
    window.addEventListener("resize", function () {
        dotNetReference.invokeMethodAsync("OnWindowResize", window.innerWidth);
    });
}

function getWindowWidth() {
    return window.innerWidth;
}