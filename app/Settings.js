import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  SafeAreaView,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckBox } from "react-native-btr";
import { exifIndexMap } from "../constants/mappings";

const Settings = () => {
  const [enable, setEnable] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userData, setUserData] = useState({
    key: "00000000",
    metaSettings: Array.from({ length: exifIndexMap.length }, () => false),
  });

  useEffect(() => {
    const getData = async () => {
      try {
        const savedData = await AsyncStorage.getItem("userData");

        if (savedData !== null) {
          const parsedData = JSON.parse(savedData);
          setUserData(parsedData);
        }
      } catch (error) {
        console.error("Error retrieving data from AsyncStorage:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    getData();
  }, []);

  const handlePress = async () => {
    if (enable) {
      try {
        console.log("I was called");
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        setEnable(false);
      } catch (error) {
        console.error("Error saving data to AsyncStorage:", error);
      }
    } else {
      setEnable(true);
    }
  };
  return isLoaded ? (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.editButton}>
          {enable ? "Save" : "Change Settings"}
        </Text>
      </TouchableOpacity>
      <Text style={styles.label}>Security Key</Text>
      <TextInput
        style={styles.input}
        editable={enable}
        value={userData.key}
        onChangeText={(newVal) => {
          console.log(newVal);
          setUserData({
            ...userData,
            key: newVal,
          });
        }}
      />
      <Text style={styles.label}>Metadata to be Saved (Max: 8) </Text>
      <View style={styles.metadataList}>
        {exifIndexMap.map((item, index) => (
          <View style={styles.metadataItem} key={index}>
            <Text style={styles.metadataText}>{item}</Text>
            <CheckBox
              disabled={!enable}
              color="#3d5afe"
              checked={userData.metaSettings[index]}
              onPress={() => {
                setUserData((prev) => {
                  const newArray = [...prev.metaSettings];
                  newArray[index] = !newArray[index];
                  return {
                    ...prev,
                    metaSettings: newArray,
                  };
                });
              }}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  ) : (
    <ActivityIndicator />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  editButton: {
    color: "white",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  metadataList: {
    alignItems: "center",
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    width: 350,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
    justifyContent: "space-between",
  },
  metadataText: {
    fontSize: 16,
  },
});

export default Settings;
