import React from "react";
import { View, Text, Image } from "react-native";

import styles from "./company.style";
import { icons } from "../../../constants";
// import { checkImageURL } from "../../../utils";

const Company = ({ companyLogo, jobTitle, companyName, location }) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Image
          source={{
            uri: companyLogo
              ? companyLogo
              : "https://res.cloudinary.com/diyncva2v/image/upload/v1703268582/job-seeker_c3zim1.png",
          }}
          style={styles.logoImage}
        />
      </View>

      <View style={styles.jobTitleBox}>
        <Text style={styles.jobTitle}>{jobTitle? jobTitle : null}</Text>
      </View>

      <View style={styles.companyInfoBox}>
        <Text style={styles.companyName}>{companyName? companyName : null} / </Text>
        <View style={styles.locationBox}>
          <Image
            source={icons.location}
            resizeMode='contain'
            style={styles.locationImage}
          />
          <Text style={styles.locationName}>{location? location : 'IN'}</Text>
        </View>
      </View>
    </View>
  );
};

export default Company;