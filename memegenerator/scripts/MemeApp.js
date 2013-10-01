var picBlob = null;
var memeGalleryPic = null;

window.addEventListener('load', init);

function init(){
  console.log("--->>> init");
  // Create example Meme
  Meme("style/images/memes/meme-2.png", 'canvas', "Tap on image to view gallery", "long tap to change text");

  document.getElementById("getPictureButton").addEventListener('click', getpicture);
  document.getElementById("shareMemeButton").addEventListener('click',shareMeme);

  // Generating Meme every time key is pressed seems to crash B2G :(
  //document.getElementById("top-line").addEventListener('keyup', updateMeme);
  //document.getElementById("bottom-line").addEventListener('keyup', updateMeme);

  var canvas = document.getElementById('canvas');
    var hammertime = Hammer(canvas).on("hold", function(event) {
        window.location.href = '#openModal';
    });

  canvas.addEventListener('click', function(event) {
        console.log("tap");
        window.location.href = '#divModalGrid';
    });

  fillImageGrid();
}

function getpicture(evt)
{
  console.log("--->>> getpicture")
  var pick = new MozActivity({
    name: "pick",
    data: {type: ["image/png", "image/jpg", "image/jpeg"]}
  });
  pick.onsuccess = function (){
    console.log("Picture Picked Successfully")
    window.picBlob = this.result.blob;
    createMeme();
  }
  pick.onerror = function(){
    console.error("Error while picking picture:", pick.error.name);
  }
};

function shareMeme(evt)
{
  console.log("--->>> shareMeme")
  createMeme(); // just in case
  cv = document.getElementById("canvas");
  cv.toBlob(function(myBlob) {

    // just in case this is required
    var blobs = [];
    blobs.push(myBlob);

    var share = new MozActivity({
      name:"share",
      data:{
        type: "image/*",
          number: 1,
          blobs: blobs,
          filenames: "meme",
          fullpaths: "meme"
        }
      })

    share.onerror = function(e) {
      console.error('share activity error:', share.error.name);};
  })
}

function createMeme()
{
  console.log("--->>> createMeme"); 
  if (picBlob == null)
    Meme("style/images/memes/meme-2.png", 'canvas', 
      document.getElementById('top-line').value, document.getElementById('bottom-line').value);
  else
  {
    var img = document.createElement("img");
    img.src = window.URL.createObjectURL(picBlob);
    Meme(img, 'canvas', 
      document.getElementById('top-line').value, document.getElementById('bottom-line').value);
  }
  memeGalleryPic = null;
}

function createMemeFromGallery(picture)
{ 
  console.log("--->>> createMemeFromGallery"); 
  window.memeGalleryPic = picture;
  Meme(picture, 'canvas',
    document.getElementById('top-line').value, document.getElementById('bottom-line').value);

  cv = document.getElementById("canvas");
  cv.toBlob(function(myBlob) {
      window.picBlob = myBlob;
      window.location.href = '#';
  });
}

  function updateAndClose()
  {
    if(window.memeGalleryPic == null)
      createMeme();
    else
      createMemeFromGallery(window.memeGalleryPic);
    window.location.href = "#close";
  }

  function fillImageGrid()
  {
    grid = document.getElementById('imageGrid');
    //ih = "<a href='#closeGrid' title='Close' class='closeGrid'>Cancel</a>";
    ih="";
    for (var i = 0; i < 16; i++)
      ih += "<a href='javascript:createMemeFromGallery(\"style/images/memes/meme-" +
            i.toString() + ".png\")'><img src=\"style/images/previews/preview-" + 
            i.toString() + ".png\"></a>";
    grid.innerHTML = ih;
    console.log(ih);
  }



