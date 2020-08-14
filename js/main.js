"use strict";

// import * as data from 'json/sample.json';
// const {name} = data;

let modalInstance;

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

    // Initialize required materialize things
    initMaterializeComponents();

    // Set up info button press callback
    document.getElementById("info").onclick = pressedInfoDiv;
    document.getElementById("infoclose").onclick = closedInfo;

    window.switchModel = updateModel;
}

function initMaterializeComponents() {
    let elems = document.querySelectorAll('.modal');
    let instances = M.Modal.init(elems, null);

    modalInstance = instances[0];
}

function pressedInfoDiv() {
    let box = document.getElementById("infobox");
    box.style.display = "block";
    box.classList.remove('animate__animated', 'animate__slideOutRight')
    box.classList.add('animate__animated', 'animate__slideInRight');
}

function closedInfo() {
    let box = document.getElementById("infobox");
    box.classList.remove('animate__animated', 'animate__slideInRight')
    box.classList.add('animate__animated', 'animate__slideOutRight');
}

function pressedInfoModal() {
    modalInstance.open();
}

const modelModifier = function () {
    var instance;
    function createInstance() {
        let modelViewer = document.querySelector("model-viewer");
        var modifier = new ModelModifier(modelViewer, data.objects[0].id, data)
        return modifier;
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    }
};

function updateModel(element, index) {
    let modifier = modelModifier().getInstance();
    modifier.updateModel(element, index)
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

class ModelModifier {
    constructor(modelViewer, currentModel, modelData) {
        this.modelViewer = modelViewer;
        this.currentModel = currentModel;
        this.modelData = modelData;
    }
    deleteHotspots() {
        for (let i = 0; i < this.modelViewer.children.length; i++) {
            const child = this.modelViewer.children[i]
            if (child.className === "Hotspot") {
                this.modelViewer.removeChild(child);
                i--;
            }
        }
    }
    drawHotspots(index) {
        let newModel = this.modelData.objects[index];
        if (newModel.hasOwnProperty('hotspots')) {
            for (let i = 0; i < newModel.hotspots.length; i++) {
                this.modelViewer.appendChild(createHotspot(newModel.hotspots[i], "hotspot_" + i));
            }
        }
    }
    updateModel(element, index) {
        let newModel = this.modelData.objects[index]
        this.modelViewer.src = newModel.src;
        const slides = document.querySelectorAll(".slide");
        slides.forEach((element) => { element.classList.remove("selected")});
        element.classList.add("selected");
        this.deleteHotspots();
        this.drawHotspots(index);
    }
}