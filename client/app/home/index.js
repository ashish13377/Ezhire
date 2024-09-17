import {
	View,
	Text,
	ScrollView,
	SafeAreaView,
	BackHandler,
	TouchableOpacity,
	Image,
	StatusBar,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { Stack, useRouter } from "expo-router";
import { COLORS, icon, icons, images, SIZES, SHADOWS } from "../../constants";
import {
	Nearbyjobs,
	Popularjobs,
	ScreenHeaderBtn,
	Welcome,
} from "../../components";

import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@Ezhire:locationData";
const DATA_KEY = "@Ezhire:userData";
const PROFILE_KEY = "@Ezhire:profileImage";

import styles from "../../components/common/header/screenheader.style";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import API_ENDPOINT from "../../utils";
import axios from "axios";

export default function Home() {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [newCity, setNewCity] = useState(null);
	const [newCountry, setNewCountry] = useState(null);
	const [user, setData] = useState(null);
	const [profile, setProfile] = useState(null);
	const [locationData, setLocationData] = useState(null);
	const [userPic, setUserPic] = useState({});
	useEffect(() => {
		const loadLocationData = async () => {
			try {
				const storedLocationData = await AsyncStorage.getItem(STORAGE_KEY);
				const storedData = await AsyncStorage.getItem(DATA_KEY);
				const storData = await AsyncStorage.getItem(PROFILE_KEY);

				if (storedLocationData) {
					const { city, country } = JSON.parse(storedLocationData);
					setNewCity(city);
					setNewCountry(country);
					setData(JSON.parse(storedData));
					setProfile(JSON.parse(storData));
				} else {
					const { status } = await Location.requestForegroundPermissionsAsync();

					if (status === "granted") {
						const location = await Location.getCurrentPositionAsync({});
						const { latitude, longitude } = location.coords;

						fetchLocationData(latitude, longitude);
					} else {
						console.log("Location permission denied");
					}
				}
			} catch (error) {
				console.error("Error loading location data:", error);
			}
		};

		loadLocationData();
	}, [newCity, newCountry]);

	const fetchLocationData = async (latitude, longitude) => {
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
			);
			const data = await response.json();
			const city =
				data.address?.city ||
				data.address?.town ||
				data.address?.village ||
				data.address?.state;
			const country = data.address.country;

			await AsyncStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ city, country })
			);

			setNewCountry(country);
			setNewCity(city);
		} catch (error) {
			console.error("Error:", error);
		}
	};

	const onRefresh = useCallback(async () => {
		// Add logic to refetch data
		try {
			const storedData = await AsyncStorage.getItem(PROFILE_KEY);

			if (storedData) {
				setUserPic(JSON.parse(storedData));
			}
		} catch (error) {
			console.error("Error loading location data:", error);
			setError(error);
		}
	}, []);

	useEffect(() => {
		const intervalId = setInterval(onRefresh, 2000);
		return () => clearInterval(intervalId);
	}, []);

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
				<StatusBar
					barStyle='dark-content' // Change icon color to white
				/>
				<Stack.Screen
					options={{
						headerStyle: { backgroundColor: COLORS.lightWhite },
						headerShadowVisible: false,
						headerLeft: () => (
							<TouchableOpacity
								style={[styles.btnContainer, { ...SHADOWS.small }]}
								onPress={() => router.push("/profile-page")}>
								{user ? (
									<Image
										source={{
											uri: userPic
												? userPic.id === user?.id
													? userPic.image
													: user?.profileimage
												: user?.profileimage,
										}}
										resizeMode='cover'
										style={styles.btnImg("100%")}
									/>
								) : null}
							</TouchableOpacity>
							// new update here add here new new also <ScreenHeaderBtn iconUrl={images.profile} dimension="100%" handelPress={() => router.push('/profile-page')} />
						),
						headerRight: () => (
							<TouchableOpacity
								style={styles.btnContainer}
								onPress={() => router.push("/setting")}>
								<Image
									source={icons.menu}
									resizeMode='cover'
									style={styles.btnImg("60%")}
								/>
							</TouchableOpacity>
							// <ScreenHeaderBtn iconUrl={icons.menu} dimension="60%" handelPress={() => router.push('/setting')} />
						),
						headerTitle: "",
					}}
				/>

				<ScrollView showsVerticalScrollIndicator={false}>
					<View
						style={{
							flex: 1,
							padding: SIZES.medium,
						}}>
						<Welcome
							searchTerm={searchTerm}
							setSearchTerm={setSearchTerm}
							handleClick={() => {
								if (searchTerm) {
									router.push(`/search/${searchTerm}`);
								}
							}}
							user={user}
							setData={setData}
						/>
						<Popularjobs
							newCity={newCity}
							newCountry={newCountry}
						/>
						<Nearbyjobs />
					</View>
				</ScrollView>
			</SafeAreaView>
		</GestureHandlerRootView>
	);
}
