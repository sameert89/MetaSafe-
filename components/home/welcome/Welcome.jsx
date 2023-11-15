import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

import styles from "./welcome.style";
import { icons, SIZES } from "../../../constants";

const Welcome = () => {
  const router = useRouter();
  return (
    <View style={styles.mainContainer}>
      <Text style={styles.userName}>Hey There!</Text>
      <Text style={styles.welcomeMessage}>Welcome to MetaSafe Capture</Text>

      <View style={styles.menuContainer}>
        <View style={styles.menuWrapper}>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: "#FA003F" }]}
              onPress={() => {
                router.push("/Encode");
              }}
            >
              <Image source={icons.encrypt} style={styles.menuIcon} />
              <Text style={styles.menuText}>Encode{"\n"}Watermark</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: "#17BEBB" }]}
              onPress={() => {
                router.push("/Decode");
              }}
            >
              <Image source={icons.decrypt} style={styles.menuIcon} />
              <Text style={styles.menuText}>Extract{"\n"}Watermark</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: "#FFCF00" }]}
              onPress={() => {
                router.push("/Settings");
              }}
            >
              <Image source={icons.settings} style={styles.menuIcon} />
              <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: "#462255" }]}
              onPress={() => {
                router.push("/Help");
              }}
            >
              <Image source={icons.help} style={styles.menuIcon} />
              <Text style={styles.menuText}>Help</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Text style={styles.footerText}> Crafted with ❤️ in India </Text>
    </View>
  );
};

export default Welcome;
