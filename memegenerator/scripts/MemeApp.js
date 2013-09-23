var picBlob = null;

window.addEventListener('load', init);

function init(){
  console.log("--->>> init");
  // Create example Meme
  Meme("style/images/morfeo.jpg", 'canvas', "What if I told you...", "FirefoxOS is coming?");

  document.getElementById("getPictureButton").addEventListener('click', getpicture);
  document.getElementById("shareMemeButton").addEventListener('click',shareMeme);

  // Generating Meme every time key is pressed seems to crash B2G :(
  document.getElementById("top-line").addEventListener('keyup', createMeme);
  document.getElementById("bottom-line").addEventListener('keyup', createMeme);
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
    Meme("style/images/morfeo.jpg", 'canvas', 
      document.getElementById('top-line').value, document.getElementById('bottom-line').value);
  else
  {
    var img = document.createElement("img");
    img.src = window.URL.createObjectURL(picBlob);
    Meme(img, 'canvas', 
      document.getElementById('top-line').value, document.getElementById('bottom-line').value);
  }
}
