import * as tf from "@tensorflow/tfjs";
import * as jpeg from "jpeg-js";
import * as _Jimp from "jimp";
const Jimp = typeof self !== "undefined" ? self.Jimp || _Jimp : _Jimp;

async function encodePng(imageTensor) {
  const [height, width] = imageTensor.shape;
  const buffer = await imageTensor.toInt().data();
  const frameData = new Uint8Array(width * height * 4);

  let offset = 0;
  for (let i = 0; i < frameData.length; i += 4) {
    frameData[i] = buffer[offset];
    frameData[i + 1] = buffer[offset + 1];
    frameData[i + 2] = buffer[offset + 2];
    frameData[i + 3] = 0xff;

    offset += 3;
  }
  const rawImageData = {
    data: frameData,
    width,
    height,
  };
  var base64Data = "";
  try {
    const image = await Jimp.read(rawImageData);
    console.log(image);
    base64Data = await image.getBase64Async(Jimp.MIME_PNG);
  } catch (e) {
    console.log(e);
  }
  if (base64Data === "") console.log("operation unsucessful");
  return base64Data;
}

async function tensorToImageUrl(imageTensor) {
  const [height, width] = imageTensor.shape;
  const buffer = await imageTensor.toInt().data();
  const frameData = new Uint8Array(width * height * 4);

  let offset = 0;
  for (let i = 0; i < frameData.length; i += 4) {
    frameData[i] = buffer[offset];
    frameData[i + 1] = buffer[offset + 1];
    frameData[i + 2] = buffer[offset + 2];
    frameData[i + 3] = 0xff;

    offset += 3;
  }

  const rawImageData = {
    data: frameData,
    width,
    height,
  };
  const jpegImageData = jpeg.encode(rawImageData, 100);
  const base64Encoding = tf.util.decodeString(jpegImageData.data, "base64");
  return base64Encoding;
}

// TODO: Convert JPEG to png lossless format to avoid compression.

const exifIndexMap = [
  "Artist",
  "Model",
  "DateTime",
  "ExifVersion",
  "ExposureTime",
  "FNumber",
  "Make",
  "MaxApertureValue",
  "MeteringMode",
  "DateTimeOriginal",
  "DateTimeDigitized",
  "ColorSpace",
  "ExposureMode",
  "ExposureProgram",
  "ComponentsConfiguration",
  "Flash",
  "GPSLatitude",
  "GPSLongitude",
  "GPSAltitude",
  "ISOSpeedRatings",
  "ShutterSpeedValue",
  "BrightnessValue",
  "FocalLength",
  "ResolutionUnit",
  "WhiteBalance",
  "XResolution",
  "YResolution",
  "GPSProcessingMethod",
  "GPSDateStamp",
  "GPSDateStamp",
  "GPSImgDirection",
  "GPSImgDirectionRef",
  "GPSLatitude",
  "GPSLongitude",
  "GPSAltitude",
  "GPSProcessingMethod",
  "GPSDateStamp",
];
const reverseExifMap = {
  Artist: 0,
  Model: 1,
  DateTime: 2,
  ExifVersion: 3,
  ExposureTime: 4,
  FNumber: 5,
  Make: 6,
  MaxApertureValue: 7,
  MeteringMode: 8,
  DateTimeOriginal: 9,
  DateTimeDigitized: 10,
  ColorSpace: 11,
  ExposureMode: 12,
  ExposureProgram: 13,
  ComponentsConfiguration: 14,
  Flash: 15,
  GPSLatitude: 16,
  GPSLongitude: 17,
  GPSAltitude: 18,
  ISOSpeedRatings: 19,
  ShutterSpeedValue: 20,
  BrightnessValue: 21,
  FocalLength: 22,
  ResolutionUnit: 23,
  WhiteBalance: 24,
  XResolution: 25,
  YResolution: 26,
  GPSProcessingMethod: 27,
  GPSDateStamp: 29,
  GPSImgDirection: 30,
  GPSImgDirectionRef: 31,
};

export { exifIndexMap, reverseExifMap, tensorToImageUrl, encodePng };
