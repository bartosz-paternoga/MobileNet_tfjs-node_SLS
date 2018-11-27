
const axios = require('axios')
const tf = require('@tensorflow/tfjs')
const mobilenet = require('@tensorflow-models/mobilenet');
require('@tensorflow/tfjs-node')
const jpeg = require('jpeg-js');


let url;
let imgDownloaded;
let mn_model;
let predicted;
const NUMBER_OF_CHANNELS = 3;


const readImage = () => {
  const buf = imgDownloaded;
  const pixels = jpeg.decode(buf, true)
  return pixels
}

const imageByteArray = (image, numChannels) => {
  const pixels = image.data;
  const numPixels = image.width * image.height;
  const values = new Int32Array(numPixels * numChannels);

  for (let i = 0; i < numPixels; i++) {
    for (let channel = 0; channel < numChannels; ++channel) {
      values[i * numChannels + channel] = pixels[i * 4 + channel];
    }
  }

  return values
}

const imageToInput = (image, numChannels) => {
  const values = imageByteArray(image, numChannels)
  const outShape = [image.height, image.width, numChannels];
  const input = tf.tensor3d(values, outShape, 'int32');

  return input
}

const loadModel = async path => {
  const mn = new mobilenet.MobileNet(1, 1);
  mn.path = `file://mobilenet/model.json`
  await mn.load()
  return mn
}


const classify = async () => {
  const image = readImage()
  const input = imageToInput(image, NUMBER_OF_CHANNELS)

  if (!mn_model) {
    mn_model = await loadModel()
    }

    const predictions = await mn_model.classify(input)

    const x = JSON.stringify(predictions);
    const y = x.toString();
    predicted = y.replace(/"|"|{|}|\'/g,'');

    // free memory from TF-internal libraries from input image
    input.dispose()

}


async function downloadImage() {

  try {

    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer'
      })

    imgDownloaded = await response.data;

    } catch (error) {
        console.error(error) 
  } 

}


async function main (params) {

  url  = params.name;
  const execDownloadImage = await downloadImage();
  const execClassify = await classify();

  return { results: predicted }
} 