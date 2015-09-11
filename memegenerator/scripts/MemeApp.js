// Config
var defaultImage = "style/images/memes/meme-2.png";
var numImages = 23;
// Global vars
var picBlob = null;
var memeGalleryPic = defaultImage;
var rate;

window.addEventListener('load', init);

function init() {
    console.log("--->>> init");

    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth / 1.15;
    canvas.height = window.innerHeight / 1.15;

    // Listeners are here to avoid CSP issues
    document.getElementById("getPictureButton").addEventListener('click', getpicture);
    document.getElementById("shareMemeButton").addEventListener('click', shareMeme);
    document.getElementById("changeText").addEventListener('click', function() {
        window.location.href = "#openFilters";
    });
    document.getElementById("ok-text").addEventListener('click', function() {
        createMeme('');
        window.location.href = "#"
    });
    document.getElementById("saveMemeButton").addEventListener('click', openMemeInGallery);
    document.getElementById("helpButton").addEventListener('click', function() {
        window.location.href = "#help";
    });
    document.getElementById("filterGS").addEventListener("click", function() {
        createMeme('filterGS');
        window.location.href = "#"
    });
    document.getElementById("filterBrightness").addEventListener("click", function() {
        createMeme('filterBrightness');
        window.location.href = "#"
    });
    document.getElementById("filterThreshold").addEventListener("click", function() {
        createMeme('filterThreshold');
        window.location.href = "#"
    });
    document.getElementById("filterCancel").addEventListener("click", function() {
        window.location.href = "#"
    });

    // The only I found out to l10n placeholders...
    document.getElementById("top-line").setAttribute("placeholder", navigator.mozL10n.get("topLinePH"));
    document.getElementById("bottom-line").setAttribute("placeholder", navigator.mozL10n.get("bottomLinePH"));

    var hammertime = Hammer(canvasph).on("hold", function(event) {
        console.log("longtap");
        window.location.href = '#openModal';
    });

    canvas.addEventListener('click', function(event) {
        console.log("tap");
        window.location.href = '#divModalGrid';
    });

    Meme(memeGalleryPic, 'canvas', navigator.mozL10n.get("topLine"), navigator.mozL10n.get("bottomLine"));
    // Preload the images of the pre-defined memes to save time later
    fillImageGrid();

    rate = Object.create(fxosRate);
    rate.init("memes", "1.0", 0, 1, 0, 20, 20, 10);
    setTimeout(function() {
        rate.promptRequired()
    }, 1000);
}

function getpicture(evt) {
    console.log("--->>> getpicture")
    var pick = new MozActivity({
        name: "pick",
        data: {
            type: ["image/png", "image/jpg", "image/jpeg"]
        }
    });
    pick.onsuccess = function() {
        console.log("Picture Picked Successfully")
        window.picBlob = this.result.blob;
        window.memeGalleryPic = null;
        createMeme('');
    }
    pick.onerror = function() {
        console.error("Error while picking picture:", pick.error.name);
    }
}

function createMeme(filter) {
    filter = filter || '';
    console.log("--->>> createMeme with filter? " + filter);
    if (window.memeGalleryPic !== null) {
        createMemeFromGallery(window.memeGalleryPic, filter)
    } else {
        createMemeFromBlob(filter);
    }
}

function createMemeFromBlob(filter) {
    filter = filter || '';
    console.log("--->>> createMemeFromBlob with filter? " + filter);

    var img = document.createElement("img");

    img.src = window.URL.createObjectURL(picBlob);
    Meme(img, 'canvas',
        document.getElementById('top-line').value, document.getElementById('bottom-line').value, filter);
}

function createMemeFromGallery(picture, filter) {
    filter = filter || '';
    console.log("--->>> createMemeFromGallery " + picture + " filter " + filter);
    Meme(picture, 'canvas',
        document.getElementById('top-line').value, document.getElementById('bottom-line').value, filter);

    cv = document.getElementById("canvas");

    cv.toBlob(function(myBlob) {
        //window.picBlob = myBlob;
        console.log("saved picBlob for " + picture)
        window.location.href = '#';
    });
}

function saveMeme() {
    console.log("---> saveMeme")
    var sdcard = navigator.getDeviceStorage("pictures");

    cv = document.getElementById("canvas");
    cv.toBlob(function(myBlob) {
        var d = new Date();
        d = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        var filename = 'meme-' +
            d.toISOString().slice(0, -5).replace(/[:T]/g, '-') +
            '.png';

        var request = sdcard.addNamed(myBlob, filename);

        request.onsuccess = function() {
            var name = this.result.name;
            alert(navigator.mozL10n.get("memeSaved"));
            console.log('File "' + name + '" successfully wrote on the sdcard storage area');
        }

        request.onerror = function() {
            alert(navigator.mozL10n.get("memeSaveFailed") + " (" + fileName + ")");
            console.log("Cannot save meme to SDCARd " + this.error.name);
        }
    })
}

// Share the meme through the Activities
function shareMeme(evt) {
    console.log("--->>> shareMeme")
    rate.logEvent(1);
    cv = document.getElementById("canvas");
    cv.toBlob(function(myBlob) {

        var blobs = [];
        blobs.push(myBlob);

        var share = new MozActivity({
            name: "share",
            data: {
                type: "image/*",
                number: 1,
                blobs: blobs,
                filenames: "meme",
                fullpaths: "meme"
            }
        })

        share.onerror = function(e) {
            alert(navigator.mozL10n.get("memeShareFailed"));
            console.error('share activity error:', share.error.name);
        };
    })
}

// Open the meme in gallery through the Activities
function openMemeInGallery(evt) {
    console.log("--->>> openMemeInGallery")
    cv = document.getElementById("canvas");
    cv.toBlob(function(myBlob) {
        var d = new Date();
        d = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        var filename = 'meme-' +
            d.toISOString().slice(0, -5).replace(/[:T]/g, '-') +
            '.png';

        var open = new MozActivity({
            name: "open",
            data: {
                type: "image/png",
                filename: filename,
                blob: myBlob,
                allowSave: true,
            }
        })

        open.onerror = function(e) {
            //alert(navigator.mozL10n.get("memeShareFailed"));
            console.error('Open activity error:', open.error.name);
            if (this.error.name === 'ActivityCanceled') {
                return;
            } else {
                alert(navigator.mozL10n.get("memeSaveFailed"));
            }
        };
    })
}


function fillImageGrid() {
    console.log("")
    grid = document.getElementById('imageGrid');
    ih = "";
    i = 0;
    for (var i = 0; i < numImages; i++) {
        ih += "<a id='gridimg" + i + "'><img src=\"style/images/previews/preview-" +
            i.toString() + ".png\"></a>";
    }
    grid.innerHTML = ih;

    for (var i = 0; i < numImages; i++) {
        var hr = document.getElementById("gridimg" + i);
        hr.onclick = makeGenerateMemeCallback("style/images/memes/meme-" + i.toString() + ".png");
        console.log("CLOSURE ADDED")
    }

    console.log(ih);
}

// Closure for adding listeners to every gallery item
function makeGenerateMemeCallback(picture) {
    return function() {
        window.memeGalleryPic = picture;
        window.picBlob = null;
        createMemeFromGallery(picture);
    }
}

function helloworld(test) {
    if (asdf)
        alert("kk");
    else
        alert("ppe")
}
