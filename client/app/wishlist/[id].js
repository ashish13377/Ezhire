import React, { useEffect, useState, useRef } from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	StatusBar,
	TouchableOpacity,
	View,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Text, SafeAreaView } from "react-native";
import axios from "axios";
import { ScreenHeaderBtn, NearbyJobCard } from "../../components";
import { COLORS, icons, SIZES } from "../../constants";
import styles from "../../styles/search";
import API_ENDPOINT from "../../utils";

const JobSearch = () => {
	const params = useLocalSearchParams();
	const router = useRouter();
	const [searchResult, setSearchResult] = useState([]);
	const [searchLoader, setSearchLoader] = useState(false);
	const [searchError, setSearchError] = useState(null);
	const [page, setPage] = useState(1);
	const handleSearch = async () => {
		setSearchLoader(true);
		setSearchResult([]);

		try {
			const options = {
				method: "GET",
				url: API_ENDPOINT + "wishlist" + "/" + "all" + `?userId=${params.id}`,
			};

			const response = await axios.request(options);

			setSearchResult(
				response.data.wishlistItems == null ? [] : response.data.wishlistItems
			);
		} catch (error) {
			setSearchError(error);
			console.log(error);
		} finally {
			setSearchLoader(false);
		}
	};

	useEffect(() => {
		handleSearch();
	}, [params]);

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
						{searchResult?.length === 0 ? (
							<View
								style={{
									flex: 1,
									alignItems: "center",
									justifyContent: "center",
								}}>
								<Text style={styles.searchTitle}>No Data found</Text>
								<Text style={styles.noOfSearchedJobs}>
									Find a new opportunities go to home
								</Text>
							</View>
						) : (
							<View style={styles.container}>
								<Text style={styles.searchTitle}>Wishlist Jobs</Text>
								<Text style={styles.noOfSearchedJobs}>Opportunities</Text>
							</View>
						)}

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
			/>
		</SafeAreaView>
	);
};

export default JobSearch;
