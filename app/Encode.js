import React, { useState, useEffect } from "react";
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as tf from "@tensorflow/tfjs";
import { useRouter } from "expo-router";
import { bundleResourceIO, decodeJpeg } from "tfjs-react-native-para-patch";
import {
  reverseExifMap,
  tensorToImageUrl,
  encodePng,
} from "../constants/mappings.js";
import { AES } from "crypto-js";
const {
  ReedSolomonDecoder,
  ReedSolomonEncoder,
  GenericGF,
} = require("../reedSolomon.js");
const msgpack = require("msgpack-lite");
const modelJSON = require("../assets/neuralnets/encoder/model.json");
const modelWeights = require("../assets/neuralnets/encoder/group1-shard1of1.bin");

const eccBytes = 16;

function RS(messageLength, errorCorrectionLength) {
  var dataLength = messageLength - errorCorrectionLength;
  var encoder = new ReedSolomonEncoder(GenericGF.AZTEC_DATA_8());
  var decoder = new ReedSolomonDecoder(GenericGF.AZTEC_DATA_8());
  return {
    dataLength: dataLength,
    messageLength: messageLength,
    errorCorrectionLength: errorCorrectionLength,

    encode: function (message) {
      encoder.encode(message, errorCorrectionLength);
    },

    decode: function (message) {
      decoder.decode(message, errorCorrectionLength);
    },
  };
}

export default function Encoder() {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await tf.loadLayersModel(
          bundleResourceIO(modelJSON, modelWeights)
        );
        setModel(loadedModel);
        setIsLoading(false);
      } catch (e) {
        alert(e);
        router.push("/");
      }
    };

    loadModel();
  }, []);

  const embedMark = async (result) => {
    try {
      if (!result) console.log("fucked");
      const exifData = result.exif;
      let coverURI = result.uri;
      const cropSize = {
        x: 0,
        y: 0,
        height: result.height,
        width: result.width,
      };
      console.log("read-successful", exifData, coverURI);
      //=> Read the userData
      const savedData = JSON.parse(await AsyncStorage.getItem("userData"));
      console.log("userData loaded", savedData);
      //=> filter the provided exifData
      const finalExifData = {};
      for (const key in exifData) {
        if (
          reverseExifMap.hasOwnProperty(key) &&
          savedData &&
          savedData.metaSettings &&
          savedData.metaSettings[reverseExifMap[key]]
        ) {
          finalExifData[reverseExifMap[key]] = exifData[key];
        }
      }
      console.log("filter successful", finalExifData);
      //=> stringify
      const exifString = JSON.stringify(finalExifData);
      console.log("stringify done");
      //=> apply aes 128
      const encryptedString = AES.encrypt(exifString, savedData.key).toString();
      console.log("encryption done", encryptedString);
      //=> apply msgpack compression
      const compressedBuffer = msgpack.encode(encryptedString);
      console.log("buffer", compressedBuffer);
      //=> convert the buffer to uint8 array
      let msgpackArray = new Uint8Array(
        Object.keys(compressedBuffer).length + eccBytes
      ).fill(0);
      let i = 0;
      for (const key in compressedBuffer) {
        msgpackArray[i] = compressedBuffer[key];
        i++;
      }
      //=> apply reed solomon redundancy
      var ec = RS(msgpackArray.length, eccBytes);
      ec.encode(msgpackArray);
      console.log("ECC done", msgpackArray);
      console.log("Total Bits: ", msgpackArray.length * 8);
      //=> convert into binary array
      const binaryArray = [];
      for (let i = 0; i < msgpackArray.length; i++) {
        for (let j = 0; j < 8; j++) {
          binaryArray.push((msgpackArray[i] >> j) & 1);
        }
      }
      //=> pad zeroes at the end
      while (binaryArray.length < 1024) binaryArray.push(0);
      let watermarkTensor = tf.tensor3d(binaryArray, [32, 32, 1]);
      watermarkTensor = tf.expandDims(watermarkTensor, 0);
      console.log("markTensorReady!", watermarkTensor);
      //=> process the cover image using photoManip
      const processedCover = await ImageManipulator.manipulateAsync(
        coverURI,
        [
          {
            resize: {
              height: 128,
              width: 128,
            },
          },
        ],
        {
          base64: true,
          compress: 1, // No compression
        }
      );
      coverURI = processedCover.uri;
      //=> load the cover image as tensor
      const response = processedCover.base64;
      const imgBuffer = tf.util.encodeString(response, "base64").buffer;
      const raw = new Uint8Array(imgBuffer);
      let coverTensor = decodeJpeg(raw);
      coverTensor = tf.div(coverTensor, 255.0);
      coverTensor = tf.expandDims(coverTensor, 0);

      //=> apply the encoder model
      let watermarkedTensor = await model.predict([
        watermarkTensor,
        coverTensor,
      ]);

      //=> convert it back to image
      watermarkedTensor = tf.squeeze(watermarkedTensor, 0);
      watermarkedTensor = tf.mul(watermarkedTensor, 255.0);
      watermarkedTensor = tf.cast(watermarkedTensor, "int32");
      watermarkedTensor = tf.clipByValue(watermarkedTensor, 0, 255);

      console.log("Encoding Complete", watermarkedTensor);

      console.log("These are the pixels", watermarkedTensor);
      const res = await encodePng(watermarkedTensor);
      console.log("base64 done");
      // const imageUri = "data:image/jpeg;base64," + res;
      console.log(res);
      setImage(res);
      // const x = tf.util.encodeString(res, "base64").buffer;
      // const y = new Uint8Array(x);
      // console.log("hi");
      // const z = decodeJpeg(y);
    } catch (e) {
      alert(e);
    } finally {
      coverTensor.dispose();
      watermarkTensor.dispose();
      watermarkedTensor.dispose();
      z.dispose();
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      exif: true,
      quality: 1,
    });

    if (!result.canceled) {
      console.log(result);
      embedMark(result);
    }
  };
  const captureImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      exif: true,
      quality: 1,
    });

    if (!result.canceled) {
      embedMark(result);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View style={styles.container}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Select from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={captureImage}>
            <Text style={styles.buttonText}>Take a Photo</Text>
          </TouchableOpacity>
          {image && (
            <Image
              source={{ uri: image }}
              style={{ width: 200, height: 200 }}
            />
          )}
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#222",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    width: 250,
    margin: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 20,
  },
});
