"use strict";

const defaultCollection = '367'
// import * as data from 'json/sample.json';
// const {name} = data;

// use shift + left/right to swap models
function keydown(e) {
	if (e.shiftKey) {
		switch (e.keyCode) {
			case 37:
				modelUpdater.leftModelPressed();
				break;
			case 39:
				modelUpdater.rightModelPressed();
				break;
			default:
				break;
		}
	}
}

var modelUpdater = {
    modelViewer: 0,
    modelData: {}, 
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
        this.modelViewer.iosSrc = newModel.ios;
        const slides = document.querySelectorAll(".slide");
        slides.forEach((element) => { element.classList.remove("selected")});
        element.classList.add("selected");
        if (this.presentationMode) { return; }

        // Redo hotspots for new model
        this.deleteHotspots();
        this.drawHotspots(index);

        // Load info for new model
        loadObjectInfo(newModel.id);
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
        newSlide.setAttribute("onclick", `clickSwitch(this, ${index});`);
        newSlide.setAttribute("style", "background-image: url(" + this.modelData.objects[index].poster + ");")

        return newSlide;
    },
	rightModelPressed: function() {
		if (this.currentIndex < this.modelData.objects.length - 1) {
			this.currentIndex++;
		}
		else {
		    this.currentIndex = 0;
        }
        let slides = document.getElementsByClassName("slide");
        this.updateModel(slides[this.currentIndex], this.currentIndex)
	},
	leftModelPressed: function() {
		if (this.currentIndex > 0) {
			this.currentIndex--;
		}
		else {
		    this.currentIndex = this.modelData.objects.length - 1;
        }
        let slides = document.getElementsByClassName("slide");
        this.updateModel(slides[this.currentIndex], this.currentIndex)
	}
}

let scrollBarHidden = false;

function main() {
    // modify page based on URL parameters
    let urlParams = processUrl();

    if (urlParams.has('embedded')) {
        let logo = document.getElementById("logo");
        logo.style.display = "none";
    }

	let dataFile = defaultCollection
	if (urlParams.has('collection')) {
		dataFile = urlParams.get('collection');
	}
	initModelData(dataFile);



    // Set up info button press callback
    document.getElementById("info").onclick = pressedInfoDiv;
    document.getElementById("infoclose").onclick = closedInfo;

    // Load the information for first object
}

function processUrl() {
    let url = window.location.search;

	const urlParams = new parseUrlParams(url);
    return urlParams; 
}

function parseUrlParams(url) {
	if (url.charAt(0) == '?') {
		url = url.substring(1);
	}
	url = url.split('&');

	let params = {
		has: function(property) {
			return this.hasOwnProperty(property);
		},
		get: function(property) {
			return this[property];
		}
	};
	for (let i = 0; i < url.length; i++) {
		let vals = url[i].split('=');
		if (vals.length == 1) {
			params[vals[0]] = 'true';
		}
		else {
			params[vals[0]] = vals[1];
		}
	}
	return params;
}

function initModelData(fileName) {
	let promise = fetch(`json/${fileName}.JSON`);

	promise.then(response => {
			if (!response.ok) { initModelData(defaultCollection); }
			else { return response.json(); }
		})
		.then(data => {
			modelUpdater.modelData = data;
			loadModelData();
		})
}

function loadModelData() {
    let viewer = document.querySelector("model-viewer")
	viewer.src = modelUpdater.modelData.objects[0].src;
	viewer.iosSrc = modelUpdater.modelData.objects[0].ios;
    modelUpdater.modelViewer = viewer;
    modelUpdater.drawHotspots(0);
    modelUpdater.drawScrollBar(0);
    loadObjectInfo(modelUpdater.modelData.objects[0].id);
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
    let body = document.createElement("div");
    let label = document.createElement("div");
    let annotation = document.createElement("div");
    let minLabel = document.createElement("div");
    let prevAnnotation = document.createElement("div");
    let close = document.createElement("button");
    let closeIcon = document.createElement("i");

    minimized.setAttribute("class", "HotspotMinimized pulse");
    expanded.setAttribute("class", "HotspotExpanded");
    head.setAttribute("class", "HotspotHead");
    body.setAttribute("class", "HotspotBody");
    label.setAttribute("class", "HotspotLabel");
    annotation.setAttribute("class", "HotspotAnnotation");

    minLabel.setAttribute("class", "HotspotMinLabel")
    prevAnnotation.setAttribute("class", "HotspotPrevAnnotation");

    close.setAttribute("class", "HotspotClose");
    closeIcon.setAttribute("class", "HotspotCloseIcon fas fa-times");

    body.innerText = hotspot.body;
    label.innerText = hotspotCounter.toString();
    minLabel.innerText = hotspotCounter.toString();
    annotation.innerText = hotspot.label;
    prevAnnotation.innerText = hotspot.label;

    minimized.onmouseover = function () {
        minimized.classList.remove("pulse");
        minimized.classList.replace("HotspotMinimized", "HotspotPreview");
        minLabel.classList.replace("HotspotMinLabel" , "HotspotPrevLabel");
    }

    minimized.onmouseout = function () {
        minimized.classList.add("pulse");
        minimized.classList.replace("HotspotPreview", "HotspotMinimized");
        minLabel.classList.replace("HotspotPrevLabel" , "HotspotMinLabel");
    }

    close.appendChild(closeIcon);

    head.appendChild(label);
    head.appendChild(annotation);
    head.appendChild(close);

    minimized.appendChild(minLabel);
    minimized.appendChild(prevAnnotation);

    expanded.appendChild(head);
    expanded.appendChild(body);

    newHotspot.appendChild(minimized);
    newHotspot.appendChild(expanded);

    // Create cloned element for mobile fullscreen display
    let mobileExpanded = expanded.cloneNode(true);

    // Apply classes to distinguish between the two hotspots
    mobileExpanded.classList.add("HotspotMobile");
    expanded.classList.add("HotspotDesktop");

    document.body.appendChild(mobileExpanded);

    minimized.onclick = function () {
        minimized.style.display = "none";
        expanded.style.display = "block";
        mobileExpanded.style.display = "block";

        // Apply indicator class to everything we want to hide when we are viewing a mobile hotspot
        document.getElementById("buttonbox").classList.add("ViewingHotspot");
        document.getElementById("infobox").classList.add("ViewingHotspot");
        document.getElementById("logo").classList.add("ViewingHotspot");
        document.getElementById("scrollBar").classList.add("ViewingHotspot");
    }

    // Same basic callback used in both desktop & mobile hotspots
    let closeCallback = function() {
        minimized.style.display = "block";
        expanded.style.display = "none";
        mobileExpanded.style.display = "none";

        // Remove hotspot viewing indicator class
        document.getElementById("buttonbox").classList.remove("ViewingHotspot");
        document.getElementById("infobox").classList.remove("ViewingHotspot");
        document.getElementById("logo").classList.remove("ViewingHotspot");
        document.getElementById("scrollBar").classList.remove("ViewingHotspot");
    }

    close.onclick = closeCallback;
    mobileExpanded.childNodes[0].childNodes[2].onclick = closeCallback;

    hotspotCounter++;
    return newHotspot
}

function hideModelScroll() {
    scrollBarHidden = !scrollBarHidden;

    // change arrow direction
    let arrow = document.getElementById("scrollBarIcon");
    let direction = scrollBarHidden ? "up" : "down";
    arrow.setAttribute("class", `fa fa-angle-double-${direction} fa-lg`);

    // animate down scrollBar
    let scrollBar = document.getElementById("scrollBar")
    let animation = scrollBarHidden ? "slideOutDown" : "slideInUp"

    // Show scrollbar if its currently hidden 
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


