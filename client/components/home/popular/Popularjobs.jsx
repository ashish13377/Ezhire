import React, {useState, useEffect} from 'react'
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router';
import axios from 'axios'
import styles from './popularjobs.style'
import { COLORS, SIZES } from '../../../constants';
import PopularJobCard from '../../common/cards/popular/PopularJobCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_ENDPOINT from '../../../utils';

const LOCATION_STORAGE_KEY = '@Ezhire:locationData';

const Popularjobs = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationData, setLocationData] = useState(null);

  useEffect(() => {
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
              query: `Jobs in ${country}`,
              num_pages: '1',
              date_posted: 'month'
            },
          };


          try {
            const response = await axios.request(apiOptions);
            setData(response.data.data);
          } catch (error) {
            console.log(error);
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

    loadLocationData();
  }, []);

  const [selectedJob, setSelectedJob] = useState();

  const handleCardPress = (item) => {
    router.push(`/job-details/${item.job_id}`);
    setSelectedJob(item.job_id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Latest jobs</Text>
          <Text style={styles.headerBtn}>1 month</Text>
      </View>

      <View style={styles.cardsContainer}>
        {isLoading ? (
          <ActivityIndicator size='large' color={COLORS.primary}/>
        ): error ? (
          <Text>Something went wrong</Text>
        ): (
          <FlatList 
              data={data}
              renderItem={({item}) => (
                <PopularJobCard 
                item={item}
                selectedJob={selectedJob}
                handleCardPress={handleCardPress}
                />
              )}
              keyExtractor={item => item?.job_id}
              contentContainerStyle={{columnGap: SIZES.medium}}
              horizontal
          />
        )}
      </View>
    </View>
  )
}

export default Popularjobs