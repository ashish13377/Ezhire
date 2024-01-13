import { StyleSheet } from "react-native";

import { COLORS, FONT, SIZES } from "../../../constants";

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.medium,
    justifyContent: "center",
    alignItems: "center",
  },
  logoBox: {
    width: 90,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderColor: COLORS.secondary,
    borderWidth: 0,
    borderRadius: SIZES.large,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // for Android
  },
  logoImage: {
    width: "85%",
    height: "85%",
    
  },
  jobTitleBox: {
    marginTop: SIZES.small,
  },
  jobTitle: {
    fontSize: SIZES.large,
    color: COLORS.primary,
    fontFamily: FONT.bold,
    textAlign: "center",
  },
  companyInfoBox: {
    marginTop: SIZES.small / 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  companyName: {
    fontSize: SIZES.medium - 2,
    color: COLORS.primary,
    fontFamily: FONT.medium,
  },
  locationBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  locationImage: {
    width: 14,
    height: 14,
    tintColor: COLORS.gray,
  },
  locationName: {
    fontSize: SIZES.medium - 2,
    color: COLORS.gray,
    fontFamily: FONT.regular,
    marginLeft: 2,
  },
});

export default styles;
