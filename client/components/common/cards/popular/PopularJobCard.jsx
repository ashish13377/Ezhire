import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'

import styles from './popularjobcard.style'
import { checkImageURL } from '../../../../utils'

const PopularJobCard = ({item, selectedJob, handleCardPress}) => {
  // console.log(item);
  return (
    <TouchableOpacity
      style={styles.container(selectedJob, item)}
      onPress={()=> handleCardPress(item)}
    >
      <TouchableOpacity style={styles.logoContainer(selectedJob, item)}>
        <Image 
          source={{ uri: item?.employer_logo
            ? item?.employer_logo : 'https://res.cloudinary.com/diyncva2v/image/upload/v1703268582/job-seeker_c3zim1.png'
          }} 
          resizeMethod="auto"
          style={styles.logoImage}
        />
      </TouchableOpacity>
      <Text style={styles.companyName} numberOfLines={1}>{item?.employer_name}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.jobName(selectedJob, item)} numberOfLines={1}>
          {item?.job_title}
        </Text>
        <Text style={styles.location}>{item?.job_country}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default PopularJobCard