import * as tf from '@tensorflow/tfjs'
import {ControllerDataset} from './controller_dataset';
import * as ui from './ui'
import {Webcam} from './webcam'

console.info('Starting');
const NUM_CLASSES = 4;
const controllerDataset = new ControllerDataset(NUM_CLASSES);

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

ui.setExampleHandler(label => {
  tf.tidy(() => {
    const img = webcam.capture();
    controllerDataset.addExample(mobilenet.predict(img), label);

    // Draw the preview thumbnail.
    ui.drawThumb(img, label);
  });
});

async function train() {
  if (controllerDataset.xs == null) {
    throw new Error('Add some examples before training!');
  }

  // Creates a 2-layer fully connected model. By creating a separate model,
  // rather than adding layers to the mobilenet model, we "freeze" the weights
  // of the mobilenet model, and only train weights from the new model.
  model = tf.sequential({
    layers: [
      // Flattens the input to a vector so we can use it in a dense layer. While
      // technically a layer, this only performs a reshape (and has no training
      // parameters).
      tf.layers.flatten({inputShape: [7, 7, 256]}),
      // Layer 1
      tf.layers.dense({
        units: 10, //UNITS  MEEEEEEEE
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        useBias: true
      }),
      // Layer 2. The number of units of the last layer should correspond
      // to the number of classes we want to predict.
      tf.layers.dense({
        units: NUM_CLASSES,
        kernelInitializer: 'varianceScaling',
        useBias: false,
        activation: 'softmax'
      })
    ]
  });

  // Creates the optimizers which drives training of the model.
  const optimizer = tf.train.adam(0.0001); // learningRATE MEEEEEEEE
  // We use categoricalCrossentropy which is the loss function we use for
  // categorical classification which measures the error between our predicted
  // probability distribution over classes (probability that an input is of each
  // class), versus the label (100% probability in the true class)>
  model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy'});

  // We parameterize batch size as a fraction of the entire dataset because the
  // number of examples that are collected depends on how many examples the user
  // collects. This allows us to have a flexible batch size.
  const batchSize =
    Math.floor(controllerDataset.xs.shape[0] * 0.4); //FRACTION VALUE  MEEEEEEEE
  if (!(batchSize > 0)) {
    throw new Error(
      `Batch size is 0 or NaN. Please choose a non-zero fraction.`);
  }

  // Train the model! Model.fit() will shuffle xs & ys so we don't have to.
  model.fit(controllerDataset.xs, controllerDataset.ys, {
    batchSize,
    epochs: 20, //EPOCS
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        //ui.trainStatus('Loss: ' + logs.loss.toFixed(5));
        console.log('Loss: ' + logs.loss.toFixed(5));
      }
    }
  });
}

async function predict() {
 // ui.isPredicting();
  while (isPredicting) {
    const predictedClass = tf.tidy(() => {
      // Capture the frame from the webcam.
      const img = webcam.capture();

      // Make a prediction through mobilenet, getting the internal activation of
      // the mobilenet model.
      const activation = mobilenet.predict(img);

      // Make a prediction through our newly-trained model using the activation
      // from mobilenet as input.
      const predictions = model.predict(activation);

      // Returns the index with the maximum probability. This number corresponds
      // to the class the model thinks is the most probable given the input.
      return predictions.as1D().argMax();
    });

    const classId = (await predictedClass.data())[0];
    predictedClass.dispose();
console.log(classId);
//    ui.predictClass(classId);
    await tf.nextFrame();
  }
  ui.donePredicting();
}


let isPredicting = false;

document.getElementById('train').addEventListener('click', async () => {
//  ui.trainStatus('Training...');
  console.log('training');
  await tf.nextFrame();
  await tf.nextFrame();
  isPredicting = false;
  train();
});

document.getElementById('predict').addEventListener('click', () => {
 // ui.startPacman();
  isPredicting = true;
  predict();
});



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
