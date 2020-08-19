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
    "\t\t\t\t\t\"label\": \"Ceramic Paint\",\n" +
    "\t\t\t\t\t\"position\": \"0.4007812111279194m 0.5728657373429219m 1.097146245737618m\",\n" +
    "\t\t\t\t\t\"normal\": \"0.16744492173726025m 0.8337560844961998m 0.5261302022788354m\",\n" +
    "\t\t\t\t\t\"visibility\": \"visible\"\n" +
    "\t\t\t\t},\n" +
    "\t\t\t\t{\n" +
    "\t\t\t\t\t\"label\": \"Brown Corn\",\n" +
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


var modelUpdater = {
    modelViewer: 0,
    modelData: data,
    currentIndex: 0,
    presentationMode: false,
    deleteHotspots: function () {
        for (let i = 0; i < this.modelViewer.children.length; i++) {
            const child = this.modelViewer.children[i]
            if (child.className === "Hotspot") {
                this.modelViewer.removeChild(child);
                i--;
            }
        }

        // TODO: Fix this whole numbering hotspots thing
        hotspotCounter = 1;
    },
    drawHotspots: function (index) {
        let newModel = this.modelData.objects[index];
        if (newModel.hasOwnProperty('hotspots')) {
            for (let i = 0; i < newModel.hotspots.length; i++) {
                this.modelViewer.appendChild(createHotspot(newModel.hotspots[i], "hotspot_" + i));
            }
        }
    },
    updateModel: function(element, index) {
        this.currentIndex = index;
        let newModel = this.modelData.objects[index]
        this.modelViewer.src = newModel.src;
        const slides = document.querySelectorAll(".slide");
        slides.forEach((element) => { element.classList.remove("selected")});
        element.classList.add("selected");
        if (this.presentationMode) { return; }
        this.deleteHotspots();
        this.drawHotspots(index);
    },
    togglePresentationMode: function() {
        if (this.presentationMode) {
            this.drawHotspots(this.currentIndex)
            this.presentationMode = false;
            return;
        }
        this.presentationMode = true;
        this.deleteHotspots();
    },
    drawScrollBar: function(selectedIndex) {
        let slides = document.getElementById("models")
        for (let i = 0; i < this.modelData.objects.length; i++) {
            slides.appendChild(this.createSlide(i === selectedIndex, i))
        }
    },
    createSlide: function(selected, index) {
        let newSlide = document.createElement("button");

        newSlide.setAttribute("class",  "slide" + (selected ? " selected" : ""));
        newSlide.setAttribute("onclick", "modelUpdater.updateModel(this, " + index + ")");
        newSlide.setAttribute("style", "background-image: url(" + this.modelData.objects[index].poster + ");")

        return newSlide;
    }
}

let scrollBarHidden = false;

function main() {
    // modify page based on URL parameters
    let embedded = getQueryVariable("embed") === "true";
    console.log(embedded);

    if (embedded) {
        let logo = document.getElementById("logo");
        logo.style.display = "none";
    }

    let viewer = document.querySelector("model-viewer")
    modelUpdater.modelViewer = viewer;
    modelUpdater.drawHotspots(0)
    modelUpdater.drawScrollBar(0)

    // Initialize required materialize things
    initMaterializeComponents();

    // Set up info button press callback
    document.getElementById("info").onclick = pressedInfoDiv;
    document.getElementById("infoclose").onclick = closedInfo;

    // Initialize required materialize things
    initMaterializeComponents();

    // Set up info button press callback
    document.getElementById("info").onclick = pressedInfoDiv;
    document.getElementById("infoclose").onclick = closedInfo;

    // Load the information for the object we are viewing
    loadObjectInfo();
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);    // grab parameters from URL
    var vars = query.split("&");

    for (var i = 0; i < vars.length; i++) {

        var pair = vars[i].split("=");

        if (pair[0] === variable) {
            return pair[1];
        }
    }
    return false;
}

function initMaterializeComponents() {
    let collapsibleElems = document.querySelectorAll('.collapsible');
    let collapsibleInstances = M.Collapsible.init(collapsibleElems, null);
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

// TODO; Eventually, we will have to load data for the object we are viewing, but for now we cannot request that from the browser.
function loadObjectInfo() {
    let req = new XMLHttpRequest();

    // Get elements where we are placing the info
    let titleSpan = document.getElementById("titlespan");
    let labelSpan = document.getElementById("labelspan");
    let artistSpan = document.getElementById("artistspan");
    let classificationSpan = document.getElementById("classificationspan");
    let mediumSpan = document.getElementById("mediumspan");
    let creditSpan = document.getElementById("creditspan");
    let numberSpan = document.getElementById("numberspan");
    let dimensionSpan = document.getElementById("dimensionspan");

    // Set up request callback
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            let obj = JSON.parse(req.responseText).object;

            // Title
            if (obj.hasOwnProperty("title")) {
                titleSpan.innerText = obj.title.value;
            } else {
                titleSpan.parentElement.parentElement.remove();
            }

            // Label
            if (obj.hasOwnProperty("labelText")) {
                labelSpan.innerText = obj.labelText.value;
            } else {
                labelSpan.parentElement.parentElement.remove();
            }

            // Artist
            if (obj.hasOwnProperty("people")) {
                artistSpan.innerText = "Artist: " + obj.people.value;
            } else {
                artistSpan.parentElement.parentElement.remove();
            }

            // Classification
            if (obj.hasOwnProperty("classification")) {
                classificationSpan.innerText = obj.classification.value;
            } else {
                classificationSpan.parentElement.parentElement.remove();
            }

            // Medium
            if (obj.hasOwnProperty("medium")) {
                mediumSpan.innerText = obj.medium.value;
            } else {
                mediumSpan.parentElement.parentElement.remove();
            }

            // Credit
            if (obj.hasOwnProperty("creditline")) {
                creditSpan.innerText = obj.creditline.value;
            } else {
                creditSpan.parentElement.parentElement.remove();
            }

            // Object Number
            if (obj.hasOwnProperty("invno")) {
                numberSpan.innerText = obj.invno.value;
            } else {
                numberSpan.parentElement.parentElement.remove();
            }

            if (obj.hasOwnProperty("dimensions")) {
                dimensionSpan.innerText = obj.dimensions.value;
            } else {
                dimensionSpan.parentElement.parentElement.remove();
            }
        }
    }

    // Form and send async request for JSON data
    req.open("GET", "models/2213.json", true);
    req.send();
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

let hotspotCounter = 1;
function createHotspot(hotspot, slot) {
    let newHotspot = document.createElement("div");

    newHotspot.setAttribute("class", "Hotspot");
    newHotspot.setAttribute("slot", slot);
    newHotspot.setAttribute("data-position", hotspot.position);
    newHotspot.setAttribute("data-visibility-attribute", hotspot.visibility);
    // newHotspot.setAttribute("visible", true)

    let minimized = document.createElement("button")
    let expanded = document.createElement("div")

    let head = document.createElement("div");

    // non absolute div to ensure that head doesn't overlap with top body text
    // need head to stay on top during scroll but don't want it to overlap non scrolled text
    let bookmark = document.createElement("div")

    let body = document.createElement("div");
    let label = document.createElement("div");
    let annotation = document.createElement("div");
    let close = document.createElement("button");
    let closeIcon = document.createElement("i");

    minimized.setAttribute("class", "HotspotMinimized");
    expanded.setAttribute("class", "HotspotExpanded")
    bookmark.setAttribute("class", "HotspotBookmark");
    head.setAttribute("class", "HotspotHead");
    body.setAttribute("class", "HotspotBody");
    label.setAttribute("class", "HotspotLabel");
    annotation.setAttribute("class", "HotspotAnnotation");
    close.setAttribute("class", "HotspotClose");
    closeIcon.setAttribute("class", "HotspotCloseIcon fas fa-times");

    //TODO replace body
    minimized.innerText = hotspotCounter.toString();
    body.innerText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    label.innerText = hotspotCounter.toString();
    annotation.innerText = hotspot.label;

    minimized.onclick = function () {
        minimized.style.display = "none";
        expanded.style.display = "block";
    }

    close.onclick = function () {
        minimized.style.display = "block";
        expanded.style.display = "none";
    }

    head.appendChild(label);
    head.appendChild(annotation);

    close.appendChild(closeIcon);

    expanded.appendChild(head);
    expanded.appendChild(bookmark);
    expanded.appendChild(close)
    expanded.appendChild(body);

    newHotspot.appendChild(minimized);
    newHotspot.appendChild(expanded);

    hotspotCounter++;
    return newHotspot
}


function hideModelScroll() {
    scrollBarHidden = !scrollBarHidden;

    // change arrow direction
    let arrow = document.getElementById("scrollBarIcon");
    let direction = scrollBarHidden ? "up" : "down";
    arrow.setAttribute("class", "fa fa-angle-double-" + direction);

    // animate down scrollBar
    let scrollBar = document.getElementById("scrollBar")
    let animation = scrollBarHidden ? "slideOutDown" : "slideInUp"

    // Hide modelBar
    if (!scrollBarHidden) {
        let modelBar = document.getElementById("models");
        modelBar.hidden = scrollBarHidden;
        scrollBar.style.bottom = "0";
    }

    animateCss(scrollBar, animation, "scrollbar__").then((message) => {
        console.log(message);
        if (scrollBarHidden) {
            let modelBar = document.getElementById("models");
            modelBar.hidden = scrollBarHidden;
            scrollBar.style.bottom = "-10em";
        }
    })
}

// This default to using animate.css built in animations, use your own by changing the prefix
const animateCss = (node, animation, prefix = `animate__`) =>
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;

        node.classList.add(`${prefix}animated`, animationName)

        function handleAnimationEnd() {
            node.classList.remove(`${prefix}animated`, animationName);
            node.removeEventListener('animationend', handleAnimationEnd);

            resolve(`${animationName} ended`);
        }

        node.addEventListener('animationend', handleAnimationEnd);
    })


