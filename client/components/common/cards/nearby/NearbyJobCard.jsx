import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'

import styles from './nearbyjobcard.style'
import { checkImageURL } from '../../../../utils'

const NearbyJobJobCard = ({job, selectedJob, handleNavigate}) => {
  // console.log(itjobem);
  return (
    <TouchableOpacity
      style={styles.container(selectedJob, job)}
      onPress={handleNavigate}
    >
      <TouchableOpacity style={styles.logoContainer(selectedJob, job)}>
        <Image 
          source={{ uri: job?.employer_logo
            ? job?.employer_logo : 'https://res.cloudinary.com/diyncva2v/image/upload/v1703268582/job-seeker_c3zim1.png'
          }} 
          resizeMethod="auto"
          style={styles.logoImage}
        />
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <Text style={styles.jobName(selectedJob, job)} numberOfLines={1}>
          {job?.job_title}
        </Text>
        <Text style={styles.jobType(selectedJob, job)}>{job?.job_employment_type}</Text>
      </View>
    </TouchableOpacity>
  )
}

export default NearbyJobJobCard