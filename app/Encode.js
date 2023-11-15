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
import * as ImagePicker from "expo-image-picker";
import * as rs from "../reedSolomon.js";
import * as tf from "@tensorflow/tfjs";
import { useRouter } from "expo-router";
import { bundleResourceIO } from "tfjs-react-native-para-patch";
import { exifIndexMap, reverseExifMap } from "../constants/mappings.js";
import { AES } from "crypto-js";
const modelJSON = require("../assets/neuralnets/encoder/model.json");
const modelWeights = require("../assets/neuralnets/encoder/group1-shard1of1.bin");

function RS(messageLength, errorCorrectionLength) {
  var dataLength = messageLength - errorCorrectionLength;
  var encoder = new rs.ReedSolomonEncoder(rs.GenericGF.AZTEC_DATA_8());
  var decoder = new rs.ReedSolomonDecoder(rs.GenericGF.AZTEC_DATA_8());
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

//TODO: Read the image from the user -> convert to 128x128x3 -> read userData-> read metaData and
//filter according to settings and store in a js object -> stringify the object
//-> apply aes 128 using the key -> apply msgpack compression -> apply reed
//solomon -> conver to 32x32 image -> encode into cover -> save

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

  const embedMark = async (exifData) => {
    try {
      // Read the userData
      const savedData = await AsyncStorage.getItem("userData");
      // filter the provided exifData
      const finalExifData = {};
      for (const key in exifData) {
        if (savedData.metaSettings[reverseExifMap[key]])
          finalExifData[key] = exifDatap[key];
      }
      // stringify
      finalExifData = JSON.stringify(finalExifData);
      // apply aes 128
    } catch (e) {
      alert(e);
    }

    const dummy = {
      1: 2500,
      2: 4500,
      3: 1.11023,
      4: "SameerTrivedi",
      5: 1.123123,
      13: 123123,
    };
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
      embedMark();
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
      embedMark();
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View>
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
