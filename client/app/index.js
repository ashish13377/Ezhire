import {
	View,
	Text,
	TouchableOpacity,
	Image,
	SafeAreaView,
	StatusBar,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../constants";
import Button from "../components/Button";
import { Stack, useRouter } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert, Linking, BackHandler } from "react-native";
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";
import API_ENDPOINT from "../utils";
const STORAGE_KEY = "@Ezhire:locationData";
const TOKEN_KEY = "@Ezhire:token";
const DATA_KEY = "@Ezhire:userData";

const Welcome = () => {
	const router = useRouter();
	const [isLogin, setIsLogin] = useState(false);
	const [newCity, setNewCity] = useState(null);
	const [newCountry, setNewCountry] = useState(null);
	const [redirect, setRedirect] = useState(false);

	// Helper function to check permission
	const checkLocationPermission = async () => {
		const { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission Required",
				"Location permission is required to use this feature. Please enable it in your settings.",
				[
					{
						text: "Cancel",
						style: "cancel",
						onPress: () => BackHandler.exitApp(), // Exit the app on cancel
					},
					{
						text: "Open Settings",
						onPress: () => Linking.openSettings(), // Open settings to allow permission
					},
				]
			);
			return false;
		}
		return true;
	};

	const loadLocationData = async () => {
		// Check location permission first
		const hasPermission = await checkLocationPermission();
		if (!hasPermission) return; // Stop execution if permission is not granted

		try {
			const storedLocationData = await AsyncStorage.getItem(STORAGE_KEY);
			if (storedLocationData) {
				const { city, country } = JSON.parse(storedLocationData);

				setNewCity(city);
				setNewCountry(country);
				handleLogin();
			} else {
				const location = await Location.getCurrentPositionAsync({});
				const { latitude, longitude } = location.coords;
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

				setNewCity(city);
				setNewCountry(country);
				handleLogin();
			}
		} catch (error) {
			console.error("Error loading location data:", error);
			Alert.alert(
				"Error",
				"There was an issue loading the location data. Please try again."
			);
		}
	};

	// Run the location loader on component mount if needed
	// Continuously check location permission in useEffect
	useEffect(() => {
		const checkPermissionAndLoadData = async () => {
			const hasPermission = await checkLocationPermission();
			if (hasPermission) {
				loadLocationData();
			}
		};

		// Set an interval to continuously check every 10 seconds (or any desired interval)
		const interval = setInterval(() => {
			checkPermissionAndLoadData();
		}, 10000); // 10000 ms = 10 seconds

		// Cleanup the interval on component unmount
		return () => clearInterval(interval);
	}, []);

	const bigCircleScale = useSharedValue(0);
	const smallCircleScale = useSharedValue(0);

	bigCircleScale.value = 0;

	useEffect(() => {
		bigCircleScale.value = 0;
		smallCircleScale.value = 0;

		const bigCircleInterval = setInterval(() => {
			bigCircleScale.value = 0;
			bigCircleScale.value = withSpring(30);
		}, 700);

		const smallCircleInterval = setInterval(() => {
			smallCircleScale.value = 0;
			smallCircleScale.value = withSpring(25);
		}, 700);

		return () => {
			clearInterval(bigCircleInterval);
			clearInterval(smallCircleInterval);
		};
	}, []);

	useEffect(() => {
		loadLocationData();
	}, [newCity, newCountry]);

	const handleLogin = async () => {
		if (redirect) return;
		try {
			const tokenData = await AsyncStorage.getItem(TOKEN_KEY);

			if (tokenData) {
				const authApiUrl =
					API_ENDPOINT + "auth" + "/" + "user-data" + `?token=${tokenData}`;
				const response = await axios.get(authApiUrl);
				if (response.status === 200) {
					const { userData } = response.data;
					await AsyncStorage.setItem(
						"@Ezhire:userData",
						JSON.stringify(userData)
					);
					await AsyncStorage.setItem("@Ezhire:token", tokenData);

					setTimeout(() => {
						setRedirect(true);

						router.replace("/home");
					}, 1000);
				} else {
					await AsyncStorage.removeItem(TOKEN_KEY);
					await AsyncStorage.setItem(
						"@Ezhire:profileImage",
						JSON.stringify({})
					);
				}
			}
		} catch (error) {
			console.log(error);
			await AsyncStorage.setItem("@Ezhire:profileImage", JSON.stringify({}));
			setIsLogin(true);
		}
	};

	useEffect(() => {
		handleLogin();
	}, [newCity, newCountry]);

	return (
		<>
			{isLogin ? (
				<SafeAreaView style={{ flex: 1, backgroundColor: "#DD7B29" }}>
					<StatusBar
						barStyle='light-content' // Change icon color to white
					/>
					<Stack.Screen
						options={{
							headerShown: false,
						}}
					/>
					<LinearGradient
						style={{
							flex: 1,
							paddingTop: "13%",
						}}
						colors={[COLORS.secondary, COLORS.primary]}>
						<View style={{ flex: 1 }}>
							<View>
								<Image
									source={require("../assets/hero1.jpg")}
									style={{
										height: 100,
										width: 100,
										borderRadius: 20,
										position: "absolute",
										top: 10,
										transform: [
											{ translateX: 20 },
											{ translateY: 50 },
											{ rotate: "-15deg" },
										],
									}}
								/>

								<Image
									source={require("../assets/hero3.jpg")}
									style={{
										height: 100,
										width: 100,
										borderRadius: 20,
										position: "absolute",
										top: -30,
										left: 100,
										transform: [
											{ translateX: 50 },
											{ translateY: 50 },
											{ rotate: "-5deg" },
										],
									}}
								/>

								<Image
									source={require("../assets/hero3.jpg")}
									style={{
										width: 100,
										height: 100,
										borderRadius: 20,
										position: "absolute",
										top: 130,
										left: -50,
										transform: [
											{ translateX: 50 },
											{ translateY: 50 },
											{ rotate: "15deg" },
										],
									}}
								/>

								<Image
									source={require("../assets/hero2.jpg")}
									style={{
										height: 200,
										width: 200,
										borderRadius: 20,
										position: "absolute",
										top: 110,
										left: 100,
										transform: [
											{ translateX: 50 },
											{ translateY: 50 },
											{ rotate: "-15deg" },
										],
									}}
								/>
							</View>

							<View
								style={{
									paddingHorizontal: 22,
									position: "absolute",
									top: 400,
									width: "100%",
								}}>
								<Text
									style={{
										fontSize: 50,
										fontWeight: 800,
										color: COLORS.white,
										fontFamily: "DMBold",
									}}>
									Let's Get
								</Text>
								<Text
									style={{
										fontSize: 46,
										fontWeight: 800,
										color: COLORS.white,
										fontFamily: "DMBold",
									}}>
									Started
								</Text>

								<View style={{ marginVertical: 22 }}>
									<Text
										style={{
											fontSize: 16,
											color: COLORS.white,
											marginVertical: 4,
											fontFamily: "DMMedium",
										}}>
										Connect securely, interview safely within
									</Text>
									<Text
										style={{
											fontSize: 16,
											color: COLORS.white,
											fontFamily: "DMMedium",
										}}>
										The job-finding app for a private job search.
									</Text>
								</View>

								<Button
									title='Join Now'
									onPress={() => router.push("/signup")}
									style={{
										marginTop: 22,
										width: "100%",
									}}
								/>

								<View
									style={{
										flexDirection: "row",
										marginTop: 12,
										justifyContent: "center",
									}}>
									<Text
										style={{
											fontSize: 16,
											color: COLORS.white,
											fontFamily: "DMMedium",
										}}>
										Already have an account ?
									</Text>
									<TouchableOpacity onPress={() => router.push("/login")}>
										<Text
											style={{
												fontSize: 16,
												color: COLORS.white,
												fontWeight: "bold",
												fontFamily: "DMBold",
												marginLeft: 4,
											}}>
											Login
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</LinearGradient>
				</SafeAreaView>
			) : (
				<SafeAreaView
					style={{
						flex: 1,
						backgroundColor: "#DD7B29",
						justifyContent: "center",
						alignItems: "center",
					}}>
					<Stack.Screen
						options={{
							headerShown: false,
						}}
					/>
					{/* Big Circle 1 */}
					<Animated.View
						style={{
							backgroundColor: "rgba(245, 215, 189, 0.2)",
							padding: bigCircleScale,
							borderRadius: 165,
							justifyContent: "center",
							alignItems: "center",
							marginBottom: 20,
						}}>
						{/* Big Circle 2 */}
						<Animated.View
							style={{
								backgroundColor: "rgba(245, 215, 189, 0.36)",
								padding: smallCircleScale,
								borderRadius: 165,
								justifyContent: "center",
								alignItems: "center",
							}}>
							{/* Image in the center */}
							<Image
								source={require("../assets/new_logo.png")}
								style={{ width: 170, height: 170, borderRadius: 170 / 2 }}
							/>
						</Animated.View>
					</Animated.View>

					<View style={{ position: "absolute", zIndex: 1, top: 670 }}>
						<Image
							source={require("../assets/wirte_logo.png")}
							style={{ width: 200, height: 60 }}
						/>
					</View>
				</SafeAreaView>
			)}
		</>
	);
};

export default Welcome;
