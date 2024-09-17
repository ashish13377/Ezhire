import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	Image,
	FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { icons, SIZES } from "../../../constants";
const jobTypes = ["Full time", "Part time", "Contractor", "Intern"];

import styles from "./welcome.style";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCATION_STORAGE_KEY = "@Ezhire:locationData";
const DATA_KEY = "@Ezhire:userData";

const Welcome = ({ searchTerm, setSearchTerm, handleClick, user, setData }) => {
	const router = useRouter();
	const [activeJobType, setActiveJobType] = useState("Full time");
	const [locationData, setLocationData] = useState(null);
	const loadLocationData = async () => {
		try {
			const storedLocationData = await AsyncStorage.getItem(
				LOCATION_STORAGE_KEY
			);
			const storedData = await AsyncStorage.getItem(DATA_KEY);

			if (storedLocationData) {
				const { city, country } = JSON.parse(storedLocationData);
				setLocationData({ city, country });
				setData(JSON.parse(storedData));
			}
		} catch (error) {
			console.error("Error loading location data:", error);
			setError(error);
		}
	};

	useEffect(() => {
		// Set up the interval to run the function periodically
		const intervalId = setInterval(loadLocationData, 2000); // 5000 ms = 5 seconds

		// Clean up the interval when the component unmounts
		return () => clearInterval(intervalId);
	}, []);

	return (
		<View>
			<View style={styles.container}>
				<Text style={styles.userName}>Hey, {user?.first_name}</Text>
				<Text style={styles.welcomeMessage}>Find your perfect job</Text>
			</View>

			<View style={styles.searchContainer}>
				<View style={styles.searchWrapper}>
					<TextInput
						style={styles.searchInput}
						value={searchTerm}
						onChangeText={(text) => setSearchTerm(text)}
						placeholder='What are you looking for ?'
					/>
				</View>
				<TouchableOpacity
					style={styles.searchBtn}
					onPress={handleClick}>
					<Image
						source={icons.search}
						resizeMode='contain'
						style={styles.searchBtnImage}
					/>
				</TouchableOpacity>
			</View>

			<View style={styles.tabsContainer}>
				<FlatList
					data={jobTypes}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={styles.tab(activeJobType, item)}
							onPress={() => {
								setActiveJobType(item);
								router.push(`/search-filters/${item}`);
							}}>
							<Text style={styles.tabText(activeJobType, item)}>{item}</Text>
						</TouchableOpacity>
					)}
					keyExtractor={(item) => item}
					contentContainerStyle={{ columnGap: SIZES.small }}
					horizontal
				/>
			</View>
		</View>
	);
};

export default Welcome;
