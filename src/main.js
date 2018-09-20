import * as tf from '@tensorflow/tfjs'
import * as ui from './ui'
import {Webcam} from './webcam'

console.info('Starting');
const PREDICTIONS = 4;

const webcam = new Webcam(document.getElementById('webcam'))

let mobilenet;
let model;

async function loadMobilenet() {
  const storage = 'https://storage.googleapis.com/tfjs-models/tfjs/';
  const model   = 'mobilenet_v1_0.25_224/model.json';

  const mobilenet = await tf.loadModel(`${storage}${model}`);

  // Return a model that outputs an internal activation.
  const layer = mobilenet.getLayer('conv_pw_13_relu');
  return tf.model({inputs: mobilenet.inputs, outputs: layer.output});
}


async function init() {
  try{
    await webcam.setup();
  }catch(e){
    document.getElementById('no-webcam').style.display = 'block';
  }

  mobilenet = await loadMobilenet();

  tf.tidy(() => mobilenet.predict(webcam.capture()));
  ui.init()
}

// Initialize the application.
init();
