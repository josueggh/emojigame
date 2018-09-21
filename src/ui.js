import * as tf from '@tensorflow/tfjs';

export function init() {
  statusElement.style.display = 'none';
}

const statusElement = document.getElementById('status');
let record_buttons  = document.getElementsByClassName('record_button');

let mouseDown = false;

const totals = {}
const thumbDisplayed = {};

export let addExampleHandler;
export function setExampleHandler(handler) {
  addExampleHandler = handler;
}

export function drawThumb(img, label) {
  if (thumbDisplayed[label] == null) {
    const thumbCanvas = document.getElementById(label + '-thumb');
    draw(img, thumbCanvas);
  }
}

async function handler(){
  mouseDown = true;
  let id = this.id;
  const total = document.getElementById(`${id}-total`);

  if(~totals[id] < 0){
    totals[id] = 0;
  }

  while(mouseDown){
    addExampleHandler(id);
    total.innerText = totals[id]++;
    await tf.nextFrame()
  }
}

for(let i=0; i< record_buttons.length; i++){
  record_buttons[i].addEventListener("mousedown", handler)
  record_buttons[i].addEventListener("mouseup", () => mouseDown = false)
}

export function draw(image, canvas) {
  const [width, height] = [224, 224];
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(width, height);
  const data = image.dataSync();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
    imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
    imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}