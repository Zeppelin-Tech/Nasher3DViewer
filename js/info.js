// Define which data from the object JSON to display and which icon shall accompany it
const infoTypes = ["title", "labelText", "people", "classification", "medium", "creditline", "invno", "dimensions"];
const infoNames = new Map([
   ["labelText", "Label"],
   ["classification", "Classification"],
   ["medium", "Medium"],
   ["creditline", "Credit"],
   ["invno", "Object Number"],
   ["dimensions", "Dimensions"]
]);
const infoIcons = new Map([
    ["title", "tag"],
    ["labelText", "scroll"],
    ["classification", "box"],
    ["medium", "hammer"],
    ["dimensions", "ruler-combined"],
    ["creditline", "copyright"],
    ["invno", "archive"]
]);

function initMaterializeCollapsibles() {
    let collapsibleElems = document.querySelectorAll('.collapsible');
    M.Collapsible.init(collapsibleElems, null);
}

function createHeaderWithIcon(iconName) {
    let header = document.createElement("div");
    header.classList.add("collapsible-header");

    let icon = document.createElement("i");
    icon.classList.add("fas");
    icon.classList.add("fa-" + iconName);

    header.appendChild(icon);

    return header;
}

// TODO; Eventually, we will have to load data for the object we are viewing, but for now we cannot request that from the browser.
function loadObjectInfo(id) {
    // Fetch JSON data for object
    let promise = fetch(`models/${id}.json`);

    // Set up async callback for promise
    promise.then(response => response.json())
        .then(data => {
            let obj = data.object;

            // List of collapsibles
            let list = document.getElementById("infolist");

            // Clear old data from list
            list.innerHTML = "";

            // Require special handling for title & author because of how they are shown together
            let title = "Unknown";
            let author = "Unknown";
            for (let type of infoTypes) {

                if (type === "title" && obj.hasOwnProperty("title")) {
                    title = obj[type].value;
                } else if (type === "people" && obj.hasOwnProperty("people")) {
                    author = obj[type].value;
                } else if (obj.hasOwnProperty(type)) {
                    let li = document.createElement("li");

                    let header = createHeaderWithIcon(infoIcons.get(type));

                    let hText = document.createElement("span");
                    hText.innerText = infoNames.get(type);

                    header.appendChild(hText);

                    let body = document.createElement("div");
                    body.classList.add("collapsible-body");
                    body.innerText = obj[type].value;

                    li.appendChild(header);
                    li.appendChild(body);

                    list.appendChild(li);
                }
            }

            // Create title / author header
            let li = document.createElement("li");

            let header = createHeaderWithIcon(infoIcons.get("title"));

            let div = document.createElement("div");

            let titleText = document.createElement("span");
            titleText.innerText = title;

            let authorText = document.createElement("span");
            authorText.id = "artistspan";
            authorText.innerText = "Artist: " + author;

            div.appendChild(titleText);
            div.appendChild(authorText);

            header.appendChild(div);

            li.appendChild(header);

            list.prepend(li);

            // Setup Materialize functionality for collapsibles
            initMaterializeCollapsibles();
        });
}
