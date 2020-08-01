"use strict";

function main() {
    let viewer = document.getElementById("viewer");

    let newHotspot = document.createElement("button");
    newHotspot.setAttribute("class", "Hotspot");
    newHotspot.setAttribute("slot", "hotspot_1");
    newHotspot.setAttribute("data-position", "-0.5732061558897641m 0.5330821278667062m 0.9063000376948391m");
    newHotspot.setAttribute("data-normal", "-0.9294973541164393m -0.05834724631259222m 0.364184386730508m");
    newHotspot.setAttribute("data-visibility-attribute", "visible");

    let annotation = document.createElement("div");
    annotation.setAttribute("class", "HotspotAnnotation");
    annotation.innerText = "Something else";

    newHotspot.appendChild(annotation);
    viewer.appendChild(newHotspot);
}