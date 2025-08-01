// ---------- Firebase Setup ----------
const firebaseConfig = {

  apiKey: "AIzaSyCZFDU-WlSmHqjXTs1Ox0nf9xeJU_xbaX0",

  authDomain: "collaborativemashup.firebaseapp.com",

  projectId: "collaborativemashup",

  storageBucket: "collaborativemashup.firebasestorage.app",

  messagingSenderId: "562437984610",

  appId: "1:562437984610:web:9f3711c26e097bc8ef9c3b",

  measurementId: "G-EY9FKD6RQ2"

};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const layoutRef = db.ref("collageLayout");

let images = new Array(24);
let uploaded = new Array(24).fill(false);
let layout = [];

function setup() {
  createCanvas(1200, 900);
  noLoop();

  for (let i = 0; i < 24; i++) {
    const input = document.getElementById(`imgUpload${i + 1}`);
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        loadImage(URL.createObjectURL(file), (img) => {
          images[i] = img;
          uploaded[i] = true;
          redraw();
        });
      }
    });
  }

  layoutRef.on("value", (snapshot) => {
    const data = snapshot.val();
    if (Array.isArray(data)) {
      layout = data;
      redraw();
    }
  });
}

function draw() {
  background(255);

  if (uploaded[0]) {
    image(images[0], 0, 0, width, height);
  }

  for (const item of layout) {
    const src = images[item.imgIndex];
    if (!src || !uploaded[item.imgIndex]) continue;

    const crop = createImage(item.w, item.h);
    crop.copy(src, item.x, item.y, item.w, item.h, 0, 0, item.w, item.h);

    const maskG = createGraphics(item.w, item.h);
    maskG.background(0);
    maskG.noStroke();
    maskG.fill(255);
    maskG.rect(0, 0, item.w, item.h);

    crop.mask(maskG.get());
    image(crop, item.x, item.y);
  }
}

function generateLayout() {
  if (!uploaded[0] || uploaded.slice(1).every(v => !v)) {
    alert("Upload the background and at least one other image.");
    return;
  }

  const newLayout = [];

  // Large rectangles
  for (let i = 0; i < 20; i++) {
    newLayout.push({
      imgIndex: int(random(1, 24)),
      x: int(random(0, width - 300)),
      y: int(random(0, height - 300)),
      w: int(random(180, 300)),
      h: int(random(180, 300))
    });
  }

  // Strips
  for (let i = 0; i < 25; i++) {
    const isVertical = random() < 0.5;
    newLayout.push({
      imgIndex: int(random(1, 24)),
      x: int(random(0, width - 300)),
      y: int(random(0, height - 300)),
      w: isVertical ? int(random(8, 16)) : int(random(150, 300)),
      h: isVertical ? int(random(150, 300)) : int(random(8, 16))
    });
  }

  layoutRef.set(newLayout);
}

function saveCollage() {
  saveCanvas("collage", "png");
}

function resetCollage() {
  db.ref("collageLayout").set([]).then(() => {
    layout = [];
    redraw();
    console.log("Collage reset.");
  }).catch((err) => {
    console.error("Failed to reset collage:", err);
  });
}
