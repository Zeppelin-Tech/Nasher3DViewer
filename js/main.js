"use strict";

// import * as data from 'json/sample.json';
// const {name} = data;


let data = JSON.parse("{\n" +
    "\t\"title\": \"Some 3D Collection\",\n" +
    "\t\"desc\": \"This is a description of this particular collection of 3D objects.\",\n" +
    "\t\"viewer-settings\": \"some array of additional global model-viewer settings could go here (shadow intensity, autoplay, environment image, etc)\",\n" +
    "\t\"objects\": [{\n" +
    "\t\t\t\"id\": 2213,\n" +
    "\t\t\t\"poster\": \"models/2213.png\",\n" +
    "\t\t\t\"src\": \"models/2213.glb\",\n" +
    "\t\t\t\"ios\": \"models.2213.usdz\",\n" +
    "\t\t\t\"hotspots\": [{\n" +
    "\t\t\t\t\t\"label\": \"Something cool\",\n" +
    "\t\t\t\t\t\"position\": \"0.4007812111279194m 0.5728657373429219m 1.097146245737618m\",\n" +
    "\t\t\t\t\t\"normal\": \"0.16744492173726025m 0.8337560844961998m 0.5261302022788354m\",\n" +
    "\t\t\t\t\t\"visibility\": \"visible\"\n" +
    "\t\t\t\t},\n" +
    "\t\t\t\t{\n" +
    "\t\t\t\t\t\"label\": \"Something else cool\",\n" +
    "\t\t\t\t\t\"position\": \"-0.5732061558897641m 0.5330821278667062m 0.9063000376948391m\",\n" +
    "\t\t\t\t\t\"normal\": \"-0.9294973541164393m -0.05834724631259222m 0.364184386730508m\",\n" +
    "\t\t\t\t\t\"visibility\": \"visible\"\n" +
    "\n" +
    "\t\t\t\t}\n" +
    "\t\t\t]\n" +
    "\t\t},\n" +
    "\t\t{\n" +
    "\t\t\t\"id\": 9671,\n" +
    "\t\t\t\"poster\": \"models/9671.png\",\n" +
    "\t\t\t\"src\": \"models/9671.glb\",\n" +
    "\t\t\t\"ios\": \"models.9671.usdz\"\n" +
    "\t\t}\n" +
    "\t]\n" +
    "}");

function main() {
    let viewer = document.querySelector("model-viewer")

    const firstModel = data.objects[0]
    if (firstModel.hasOwnProperty('hotspots')) {
        for (let i = 0; i < firstModel.hotspots.length; i++) {

            viewer.appendChild(createHotspot(firstModel.hotspots[i], "hotspot_" + i))
        }
    }


    window.switchModel = updateModel;
}

function updateModel(element, index) {
    let modelViewer = document.querySelector("model-viewer");

    let newObject = data.objects[index]

    modelViewer.src = newObject.src;
    const slides = document.querySelectorAll(".slide");
    slides.forEach((element) => { element.classList.remove("selected")});
    element.classList.add("selected");

    for (let i = 0; i < modelViewer.children.length; i++) {
        const child = modelViewer.children[i]
        if (child.className === "Hotspot") {
            modelViewer.removeChild(child);
            i--;
        }
        console.log('test')
        // modelViewer.removeChild()
    }
    if (newObject.hasOwnProperty('hotspots')) {
        for (let i = 0; i < newObject.hotspots.length; i++) {
            modelViewer.appendChild(createHotspot(newObject.hotspots[i], "hotspot_" + i));
        }
    }
}

function createHotspot(hotspot, slot) {
    let newHotspot = document.createElement("button");

    newHotspot.setAttribute("class", "Hotspot");
    newHotspot.setAttribute("slot", slot);
    newHotspot.setAttribute("data-position", hotspot.position);
    newHotspot.setAttribute("data-normal", hotspot.normal);
    newHotspot.setAttribute("data-visibility-attribute", hotspot.visibility);
    // newHotspot.setAttribute("visible", true)

    newHotspot.appendChild(createHotspotAnnotation(hotspot.label))

    return newHotspot
}

function createHotspotAnnotation(label) {
    let annotation = document.createElement("div");
    annotation.setAttribute("class", "HotspotAnnotation");
    annotation.innerText = label
    return annotation
}