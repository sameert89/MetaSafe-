import { StyleSheet } from "react-native";

import { COLORS, FONT, SIZES } from "../../../constants";

const styles = StyleSheet.create({
  mainContainer: {
    height: "80%",
    width: "100%",
  },
  menuContainer: {
    height: "80%",
  },
  userName: {
    fontFamily: FONT.regular,
    fontSize: SIZES.large,
    color: COLORS.secondary,
    textAlign: "center",
    margin: 2,
  },
  welcomeMessage: {
    fontFamily: FONT.bold,
    fontSize: SIZES.xLarge,
    color: COLORS.primary,
    margin: 10,
    marginBottom: 10,
    textAlign: "center",
  },
  menuWrapper: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: COLORS.white,
    marginRight: SIZES.small,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: SIZES.medium,
    // height: "100%",
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: "50%",
  },
  menuItem: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    height: "80%",
    width: "45%",
    borderRadius: SIZES.medium,
    margin: 10,
  },
  menuIcon: {
    flex: 1,
    width: "40%",
    height: "40%",
    resizeMode: "contain",
    alignItems: "center",
    marginBottom: 2,
    tintColor: "white",
  },
  menuText: {
    textAlign: "center",
    color: "white",
    fontSize: SIZES.Small,
  },
  tabsContainer: {
    width: "100%",
    marginTop: SIZES.medium,
  },
  footerText: {
    fontFamily: FONT.regular,
    fontSize: SIZES.xSmall,
    color: COLORS.secondary,
    textAlign: "center",
    marginTop: 100,
  },
  tab: (activeJobType, item) => ({
    paddingVertical: SIZES.small / 2,
    paddingHorizontal: SIZES.small,
    borderRadius: SIZES.medium,
    borderWidth: 1,
    borderColor: activeJobType === item ? COLORS.secondary : COLORS.gray2,
  }),
  tabText: (activeJobType, item) => ({
    fontFamily: FONT.medium,
    color: activeJobType === item ? COLORS.secondary : COLORS.gray2,
  }),
});

export default styles;
