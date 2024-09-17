import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router';
import styles from './nearbyjobs.style'
import { COLORS } from '../../../constants';
import NearbyJobCard from '../../common/cards/nearby/NearbyJobCard';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_ENDPOINT from '../../../utils';

const LOCATION_STORAGE_KEY = '@Ezhire:locationData';

const NearbyJobs = () => {
  const router = useRouter();
  const [newCity, setNewCity] = useState(null);
  const [newCountry, setNewCountry] = useState(null);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [numPages, setNumPages] = useState(1);

  useEffect(() => {
    loadLocationData();
  }, []);

  const loadLocationData = async () => {
    setIsLoading(true);
    try {
      const storedLocationData = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);

      if (storedLocationData) {
        const { city, country } = JSON.parse(storedLocationData);
        setLocationData({ city, country });

        const apiOptions = {
          method: 'GET',
          url: API_ENDPOINT + 'search',
          params: {
            query: `Jobs in ${city}, ${country}`,
            num_pages:  numPages.toString(),
          },
        
        };


        try {
          const response = await axios.request(apiOptions);
          setData(response.data.data);
        } catch (error) {
          setError(error);
          setIsLoading(false);
          alert('There is an error');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error loading location data:', error);
      setError(error);
      setIsLoading(false);
    }
  };

  const handleFetchMore = () => {
    setIsLoading(true);
    setNumPages(10);
  };

  useEffect(() => {
    loadLocationData();
  }, [numPages]);

  const [selectedJob, setSelectedJob] = useState();

  const handleCardPress = (item) => {
    setSelectedJob(item.job_id);
    setIsLoading(false);
    setError(null);
    setNewCity(null);
    setNewCountry(null);
    router.push(`/job-details/${item.job_id}`);
  };

 
  return (
    <View style={styles.container} >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Near by jobs</Text>
        <TouchableOpacity onPress={handleFetchMore}>
          <Text style={styles.headerBtn}>Show all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsContainer}>
        {isLoading ? (
          <ActivityIndicator size='large' color={COLORS.primary} />
        ) : error ? (
          <Text>Something went wrong</Text>
        ) : (
          data?.map((job) => (
            <NearbyJobCard
              job={job}
              selectedJob={selectedJob}
              key={`nearby-job-${job?.job_id}`}
              handleNavigate={() => handleCardPress(job)}
            />
          ))
        )}
      </View>
    </View>
  )
}

export default NearbyJobs