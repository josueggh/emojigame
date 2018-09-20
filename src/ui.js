import * as tf from '@tensorflow/tfjs';

export function init() {
  statusElement.style.display = 'none';
}

const statusElement = document.getElementById('status');

let record_buttons  = document.getElementsByClassName('record_button');

let mouseDown = false;
const totals = {'shame' : 0 }


function handler(){
  mouseDown = true;
  let id = this.id;
  const total = document.getElementById(`${id}-total`);

  while(mouseDown){
    total.innerText = totals[id]++;
    console.log(total.innerText);
    await tf.nextFrame()
  }
}

for(let i=0; i< record_buttons.length; i++){
  record_buttons[i].addEventListener("mousedown", handler)
  record_buttons[i].addEventListener("mouseup", () => mouseDown = false)
}