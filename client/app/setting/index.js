import React, { useState, useRef } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	TextInput,
	StyleSheet,
	Linking,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT, SIZES, SHADOWS, icons } from "../../constants";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { ScreenHeaderBtn } from "../../components";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import Toast from "../../components/Toast";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const STORAGE_KEY = "@Ezhire:locationData";

const SettingsScreen = () => {
	const [city, setCity] = useState("");
	const [country, setCountry] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const toastRef = useRef();

	const socialLinks = [
		{
			name: "LinkedIn",
			icon: "logo-linkedin",
			color: "#0077B5",
			bacColor: "#0077b529",
			url: "https://www.linkedin.com/in/ashish-kumar-7a5b401ba/",
		},
		{
			name: "GitHub",
			icon: "logo-github",
			color: "#333",
			bacColor: "#33333326",
			url: "https://github.com/ashish13377/",
		},
		{
			name: "Email",
			icon: "mail",
			color: "#FFA500",
			bacColor: "#ffa50024",
			url: "mailto:ashish.worksspace@gmail.com",
		},
		{
			name: "Instagram",
			icon: "logo-instagram",
			color: "#E4405F",
			bacColor: "#e4405f21",
			url: "https://www.instagram.com/ashish_photo.in/",
		}, // Replace with your Instagram profile
	];

	const handleUseCurrentLocation = async () => {
		// Show spinner
		setIsLoading(true);
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();

			if (status === "granted") {
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

				// await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ city, country }));

				setCountry(country);
				setCity(city);

				if (city) {
					setIsLoading(false);
				}
			} else {
				setIsLoading(false);
				console.log("Location permission denied");
				// Handle the scenario where the user denied location permissions
			}
		} catch (error) {
			setIsLoading(false);
			console.error("Error loading location data:", error);
			// Handle the error, show an error message to the user, etc.
		}
	};

	const handleUpdateLocation = async () => {
		try {
			// Get the values from the input fields
			const updatedCity = city || currentLocationData.city;
			const updatedCountry = country || currentLocationData.country;

			// Update the AsyncStorage with the new values and mark as manually updated
			await AsyncStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({
					city: updatedCity,
					country: updatedCountry,
					manualUpdate: true,
				})
			);

			toastRef.current.show({
				type: "success",
				text: `Location updated successfully! 🎉`,
				duration: 2500,
			});

			setTimeout(() => {
				setCountry("");
				setCity("");
			}, 2600);
			// Display a success message or handle further actions if needed
			// console.log('Location updated successfully!');
		} catch (error) {
			console.error("Error updating location:", error);
			// Handle the error, show an error message to the user, etc.
		}
	};

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
							<ScreenHeaderBtn
								iconUrl={icons.left}
								dimension='60%'
								handelPress={() => router.back()}
							/>
						),
						headerTitle: "",
					}}
				/>
				<Toast ref={toastRef} />

				<View style={styles.container}>
					<View style={styles.headerContainer}>
						<Text style={styles.headerText}>App Settings</Text>
						<Text style={styles.subHeaderText}>
							Here you can change your app settings
						</Text>
					</View>

					<KeyboardAvoidingView
						behavior={Platform.OS === "ios" ? "padding" : "height"}
						style={styles.contentContainer}>
						<Text style={styles.label}>Change Nearby Location:</Text>

						<TouchableOpacity
							style={[
								styles.buttons,
								{
									width: "100%",
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "center",
								},
							]}
							onPress={handleUseCurrentLocation}
							disabled={isLoading}>
							{isLoading ? (
								<ActivityIndicator
									size='small'
									color={COLORS.white}
								/>
							) : (
								<>
									<Ionicons
										name='location-sharp'
										size={20}
										color={COLORS.white}
										style={{ marginRight: 8 }}
									/>
									<Text
										style={{
											color: COLORS.white,
											fontFamily: FONT.bold,
											fontSize: 16,
										}}>
										Use Current Location
									</Text>
								</>
							)}
						</TouchableOpacity>

						<TextInput
							style={[styles.input, { borderColor: COLORS.gray }]}
							placeholder='Enter City'
							value={city}
							onChangeText={(text) => setCity(text)}
						/>

						<TextInput
							style={[styles.input, { borderColor: COLORS.gray }]}
							placeholder='Enter Country'
							value={country}
							onChangeText={(text) => setCountry(text)}
						/>

						<TouchableOpacity
							style={[styles.button]}
							onPress={handleUpdateLocation}>
							<Text
								style={{
									color: COLORS.white,
									fontFamily: FONT.bold,
									fontSize: 16,
								}}>
								Update
							</Text>
						</TouchableOpacity>

						<Text style={[styles.label, { textAlign: "center" }]}>
							{" "}
							Developer
						</Text>

						{/* Social Links Rows */}
						<View style={styles.socialLinksContainer}>
							{[...Array(Math.ceil(socialLinks.length / 2))].map(
								(row, rowIndex) => (
									<View
										key={rowIndex}
										style={styles.socialLinksRow}>
										{socialLinks
											.slice(rowIndex * 2, rowIndex * 2 + 2)
											.map((link, index) => (
												<TouchableOpacity
													key={index}
													style={[
														styles.socialLinkButton,
														{
															borderColor: link.color,
															flex: 1,
															backgroundColor: link.bacColor,
														},
													]}
													onPress={() => Linking.openURL(link.url)} // Open the link in the default browser
													accessible={true}
													accessibilityLabel={`Open ${link.name} profile`}>
													{/* Icon component for Expo Ionicons */}
													<Ionicons
														name={link.icon}
														size={SIZES.xLarge}
														color={link.color}
													/>
													<Text
														style={{
															color: link.color,
															marginLeft: 8,
															fontSize: SIZES.large,
															fontFamily: FONT.medium,
														}}>
														{link.name}
													</Text>
												</TouchableOpacity>
											))}
									</View>
								)
							)}
						</View>
					</KeyboardAvoidingView>

					<Text style={[styles.footerText, { color: COLORS.gray }]}>
						Copyright © 2024 Ezhire. All rights reserved.
					</Text>
					<Text
						style={[
							styles.footerText,
							{ color: COLORS.gray, marginBottom: 16 },
						]}>
						Made with ❤️‍🩹 Ashish
					</Text>
				</View>
			</SafeAreaView>
		</GestureHandlerRootView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.lightWhite,
	},
	headerContainer: {
		padding: 16,
	},
	headerText: {
		fontSize: SIZES.xxLarge,
		fontFamily: FONT.bold,
		marginBottom: 8,
		color: COLORS.primary,
	},
	subHeaderText: {
		fontSize: SIZES.medium,
		color: COLORS.gray,
	},
	contentContainer: {
		flex: 1,
		justifyContent: "space-between",
		padding: 16,
	},
	label: {
		fontSize: SIZES.large,
		fontFamily: FONT.medium,
		marginBottom: 8,
		color: COLORS.gray2,
	},
	button: {
		backgroundColor: COLORS.tertiary,
		paddingVertical: SIZES.small,
		paddingHorizontal: SIZES.large,
		alignItems: "center",
		width: "40%",
		borderRadius: 8,
		...SHADOWS.medium,
	},
	buttons: {
		backgroundColor: COLORS.tertiary,
		paddingVertical: SIZES.small,
		paddingHorizontal: SIZES.large,
		alignItems: "center",
		width: "40%",
		borderRadius: 8,
		...SHADOWS.medium,
	},
	input: {
		height: 40,
		borderWidth: 2,
		marginBottom: 16,
		paddingLeft: 8,
		fontSize: SIZES.medium,
		fontFamily: FONT.regular,
		borderRadius: 8,
	},
	socialLinksContainer: {
		flexDirection: "column",
		justifyContent: "space-around",
		marginBottom: 16,
	},
	socialLinksRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 10,
	},
	socialLinkButton: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		margin: 3,
		borderRadius: 8,
		borderWidth: 1,
	},
	footerText: {
		textAlign: "center",
		fontSize: SIZES.small,
		fontFamily: FONT.medium,
	},
});

export default SettingsScreen;
