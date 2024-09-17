import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Image, StatusBar, TouchableOpacity, View } from 'react-native'
import { Stack, useRouter, useLocalSearchParams } from 'expo-router'
import { Text, SafeAreaView } from 'react-native'
import axios from 'axios'

import { ScreenHeaderBtn, NearbyJobCard } from '../../components'
import { COLORS, icons, SIZES } from '../../constants'
import styles from '../../styles/search'
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_ENDPOINT from '../../utils'

const LOCATION_STORAGE_KEY = '@Ezhire:locationData';

const JobSearchFilters = () => {
    const params = useLocalSearchParams();
    const router = useRouter()

    const [locationData, setLocationData] = useState(null);

    useEffect(() => {
      const loadLocationData = async () => {
        try {
          const storedLocationData = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
  
          if (storedLocationData) {
            const { city, country } = JSON.parse(storedLocationData);
            setLocationData({ city, country });
          }
        } catch (error) {
          console.error('Error loading location data:', error);
          setError(error);
        }
      };
  
      loadLocationData();
    }, []);
    
    const [searchResult, setSearchResult] = useState([]);
    const [searchLoader, setSearchLoader] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [page, setPage] = useState(1);

    const handleSearch = async () => {
        setSearchLoader(true);
        setSearchResult([])

        try {
            const options = {
                method: "GET",
                url: API_ENDPOINT + "search",
                params: {
                    query: `Jobs in India`,
                    employment_types:  params.id.toUpperCase().replace(/\s/g, ''),
                    country: 'in'
                },
            };

            const response = await axios.request(options);
            setSearchResult(response.data.data);
        } catch (error) {
            setSearchError(error);
            console.log(error);
        } finally {
            setSearchLoader(false);
        }
    };

    const handlePagination = (direction) => {
        if (direction === 'left' && page > 1) {
            setPage(page - 1)
            handleSearch()
        } else if (direction === 'right') {
            setPage(page + 1)
            handleSearch()
        }
    }

    useEffect(() => {
        handleSearch()
    }, [])

    return (
			<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
				<StatusBar
					barStyle='dark-content' // Change icon color to white
				/>
				<Stack.Screen
					options={{
						headerStyle: { backgroundColor: COLORS.lightWhite },
						headerShadowVisible: false,
						headerLeft: () => (
							<ScreenHeaderBtn
								iconUrl={icons.left}
								dimension='60%'
								handelPress={() => router.back()}
							/>
						),
						headerTitle: "",
					}}
				/>

				<FlatList
					data={searchResult}
					renderItem={({ item }) => (
						<NearbyJobCard
							job={item}
							handleNavigate={() => router.push(`/job-details/${item.job_id}`)}
						/>
					)}
					keyExtractor={(item) => item.job_id}
					contentContainerStyle={{
						padding: SIZES.medium,
						rowGap: SIZES.medium,
					}}
					ListHeaderComponent={() => (
						<>
							<View style={styles.container}>
								<Text style={styles.searchTitle}>{params.id}</Text>
								<Text style={styles.noOfSearchedJobs}>Job Opportunities</Text>
							</View>
							<View
								style={[
									styles.loaderContainer,
									{
										marginVertical: "80%",
										justifyContent: "center",
										alignItems: "center",
									},
								]}>
								{searchLoader ? (
									<ActivityIndicator
										size='large'
										color={COLORS.primary}
									/>
								) : (
									searchError && <Text>Oops, something went wrong</Text>
								)}
							</View>
						</>
					)}
					ListFooterComponent={() => (
						<View style={styles.footerContainer}>
							<TouchableOpacity
								style={styles.paginationButton}
								onPress={() => handlePagination("left")}>
								<Image
									source={icons.chevronLeft}
									style={styles.paginationImage}
									resizeMode='contain'
								/>
							</TouchableOpacity>
							<View style={styles.paginationTextBox}>
								<Text style={styles.paginationText}>{page}</Text>
							</View>
							<TouchableOpacity
								style={styles.paginationButton}
								onPress={() => handlePagination("right")}>
								<Image
									source={icons.chevronRight}
									style={styles.paginationImage}
									resizeMode='contain'
								/>
							</TouchableOpacity>
						</View>
					)}
				/>
			</SafeAreaView>
		);
}



export default JobSearchFilters