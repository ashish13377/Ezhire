import { StyleSheet } from "react-native";

import { COLORS, SHADOWS, SIZES } from "../../../../constants";

const styles = StyleSheet.create({
  container: (selectedJob, item) => ({
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    padding: SIZES.medium,
    borderRadius: SIZES.small,
    backgroundColor: selectedJob === item?.job_id ? COLORS.primary : "#FFF",
    ...SHADOWS.medium,
    shadowColor: COLORS.white,
  }),
  logoContainer: (selectedJob, item) => ({
    width: 50,
    height: 50,
    backgroundColor: selectedJob === item?.job_id ? "#FFF" : COLORS.white,
    borderRadius: SIZES.medium,
    justifyContent: "center",
    alignItems: "center",
  }),
  logoImage: {
    width: "70%",
    height: "70%",
  },
  textContainer: {
    flex: 1,
    marginHorizontal: SIZES.medium,
  },
  jobName: (selectedJob, item) => ({
    fontSize: SIZES.medium,
    fontFamily: "DMBold",
    color: selectedJob === item.job_id ? COLORS.white : COLORS.primary,
  }),
  jobType: (selectedJob, item) => ({
    fontSize: SIZES.small + 2,
    fontFamily: "DMRegular",
    color: selectedJob === item.job_id ? COLORS.white : COLORS.gray,
    marginTop: 3,
    textTransform: "capitalize",
  }),
});

export default styles;
