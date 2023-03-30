/*const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});*/

const { Canvas, createCanvas, Image, ImageData, loadImage } = require('canvas');
const { JSDOM } = require('jsdom');
const { writeFileSync, existsSync, mkdirSync } = require('fs');
(async () => {
  await loadOpenCV();
  const image = await loadImage('rushdi.jpg');
  const src = cv.imread(image);
  await copyFile(src);
  let gray = new cv.Mat();
  console.log('image loaded');
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  console.log('0');
  let faces = new cv.RectVector();
  let eyes = new cv.RectVector();
  console.log('1');

  let faceCascade = new cv.CascadeClassifier();
  let eyeCascade = new cv.CascadeClassifier();
  console.log('2');
  console.log(gray.shape);
  // Load pre-trained classifier files. Notice how we reference local files using relative paths just
  // like we normally would do
  //faceCascade.load('./haarcascade_frontalface_default.xml');
  // eyeCascade.load('./haarcascade_eye.xml');
  console.log(`faceCascade`);
  //console.log(faceCascade.empty());

  //let mSize = new cv.Size(0, 0);
  /*faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, mSize, mSize);
  for (let i = 0; i < faces.size(); ++i) {
    let roiGray = gray.roi(faces.get(i));
    let roiSrc = src.roi(faces.get(i));
    let point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
    let point2 = new cv.Point(faces.get(i).x + faces.get(i).width, faces.get(i).y + faces.get(i).height);
    cv.rectangle(src, point1, point2, [255, 0, 0, 255]);
    roiGray.delete();
    roiSrc.delete();
  }
  const canvas = createCanvas(image.width, image.height);
  cv.imshow(canvas, src);
  writeFileSync('output3.jpg', canvas.toBuffer('image/jpeg'));
  src.delete(); gray.delete(); faceCascade.delete(); eyeCascade.delete(); faces.delete(); eyes.delete()*/
})();
/**
 * Loads opencv.js.
 *
 * Installs HTML Canvas emulation to support `cv.imread()` and `cv.imshow`
 *
 * Mounts given local folder `localRootDir` in emscripten filesystem folder `rootDir`. By default it will mount the local current directory in emscripten `/work` directory. This means that `/work/foo.txt` will be resolved to the local file `./foo.txt`
 * @param {string} rootDir The directory in emscripten filesystem in which the local filesystem will be mount.
 * @param {string} localRootDir The local directory to mount in emscripten filesystem.
 * @returns {Promise} resolved when the library is ready to use.
 */
function loadOpenCV(rootDir = '/work', localRootDir = process.cwd()) {
  if (global.Module && global.Module.onRuntimeInitialized && global.cv && global.cv.imread) {
    return Promise.resolve()
  }
  return new Promise(resolve => {
    installDOM()
    global.Module = {
      onRuntimeInitialized() {
        // We change emscripten current work directory to 'rootDir' so relative paths are resolved
        // relative to the current local folder, as expected
        cv.FS.chdir(rootDir)
        resolve()
      },
      preRun() {
        console.log('pre run')
        // preRun() is another callback like onRuntimeInitialized() but is called just before the
        // library code runs. Here we mount a local folder in emscripten filesystem and we want to
        // do this before the library is executed so the filesystem is accessible from the start
        const FS = global.Module.FS
        // create rootDir if it doesn't exists
        if (!FS.analyzePath(rootDir).exists) {
          FS.mkdir(rootDir);
        }
        // create localRootFolder if it doesn't exists
        if (!existsSync(localRootDir)) {
          mkdirSync(localRootDir, { recursive: true });
        }
        // FS.mount() is similar to Linux/POSIX mount operation. It basically mounts an external
        // filesystem with given format, in given current filesystem directory.
        FS.mount(FS.filesystems.NODEFS, { root: localRootDir }, rootDir);
      }
    };
    global.cv = require('./opencv.js')
  });
}
function installDOM() {
  const dom = new JSDOM();
  global.document = dom.window.document;
  global.Image = Image;
  global.HTMLCanvasElement = Canvas;
  global.ImageData = ImageData;
  global.HTMLImageElement = Image;
  console.log('install dom')
}

async function copyFile(src) {
  console.log(`copyFile`);
  console.log(src)
  //copyFile(`copyFile`)
  console.log(src.shape)
  const dst = new cv.Mat();
  const M = cv.Mat.ones(5, 5, cv.CV_8U);
  const anchor = new cv.Point(-1, -1);
  cv.dilate(src, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
  // we create an object compatible HTMLCanvasElement
  const canvas = createCanvas(300, 300);
  cv.imshow(canvas, dst);
  writeFileSync('outputPath.jpg', canvas.toBuffer('image/jpeg'));
  src.delete();
  dst.delete();
}
