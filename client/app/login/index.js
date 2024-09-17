import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	Pressable,
	Keyboard,
	StatusBar,
	ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONT, icons } from "../../constants";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { Stack, useRouter } from "expo-router";
import { ScreenHeaderBtn } from "../../components";
import Button from "../../components/Button"; // Import Button component
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "../../components/Toast";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import axios from "axios";
import API_ENDPOINT from "../../utils";

const STORAGE_KEY = "@Ezhire:locationData";
const TOKEN_KEY = "@Ezhire:token";
const DATA_KEY = "@Ezhire:userData";

const Login = () => {
	const [isPasswordShown, setIsPasswordShown] = useState(true);
	const [isChecked, setIsChecked] = useState(false);
	const router = useRouter();
	const [newCity, setNewCity] = useState(null);
	const [newCountry, setNewCountry] = useState(null);
	const toastRef = useRef();



	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	// Error states
	const [emailError, setEmailError] = useState(null);
	const [passwordError, setPasswordError] = useState(null);
	const [isLoading, setIsLoading] = useState(false); // Add loading state for the login button

	const validateForm = () => {
		let isValid = true;

		// Email validation using a regular expression
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!formData.email.trim()) {
			setEmailError("Email is required");
			isValid = false;
		} else if (!emailRegex.test(formData.email.trim())) {
			setEmailError("Invalid email format");
			isValid = false;
		} else {
			setEmailError(null);
		}

		if (!formData.password.trim()) {
			setPasswordError("Password is required");
			isValid = false;
		} else {
			setPasswordError(null);
		}

		return isValid;
	};

	const handleLogin = async () => {
		// Validate form fields
		const isValid = validateForm();
		if (!isValid) {
			// Stop login process if there are validation errors
			return;
		}
		// Set loading state to true during login process
		setIsLoading(true);
		Keyboard.dismiss();

		try {
			// Simulate calling an authentication API
			const authApiUrl = API_ENDPOINT + "auth" + "/" + "login"; // Replace with your actual API endpoint

			const response = await axios.post(authApiUrl, {
				email: formData.email,
				password: formData.password,
			});

			if (response.status !== 200) {
				// Handle authentication failure
				toastRef.current.show({
					type: "error",
					text: "Authentication failed. Please check your credentials.",
					duration: 2500,
				});
			}
			// Assuming the API response contains a token and user data
			const { token, userData } = response.data;
			// console.log(token, userData);
			// Save user data to AsyncStorage
			await AsyncStorage.setItem("@Ezhire:token", token);
			await AsyncStorage.setItem("@Ezhire:userData", JSON.stringify(userData));

			ToastAndroid.showWithGravity(
				"Login successful 🎉",
				ToastAndroid.SHORT,
				ToastAndroid.TOP
			);
			// Reset form data after successful login
			setTimeout(() => {
				setFormData({
					email: "",
					password: "",
				});
				// navigation.dispatch(StackActions.replace('Home'));
				router.replace("/home");

				setIsLoading(false);
			}, 2699);
		} catch (error) {
			// console.error('Authentication error:', error);
			const message = `${error.response.data}`.trim();
			ToastAndroid.showWithGravity(
				message,
				ToastAndroid.SHORT,
				ToastAndroid.TOP
			);
			setIsLoading(false);
		}
	};

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
				<Toast ref={toastRef} />
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
				<View style={{ flex: 1, marginHorizontal: 22 }}>
					<View style={{ marginVertical: 22 }}>
						<Text
							style={{
								fontSize: 22,
								fontFamily: FONT.bold,
								marginVertical: 12,
								color: COLORS.secondary,
							}}>
							Hi Welcome Back ! 👋
						</Text>

						<Text
							style={{
								fontSize: 16,
								color: COLORS.secondary,
								fontFamily: FONT.medium,
							}}>
							Hello again you have been missed!
						</Text>
					</View>

					<View style={{ marginBottom: 12 }}>
						<Text
							style={{
								fontSize: 16,
								fontWeight: "400",
								marginVertical: 8,
								fontFamily: FONT.medium,
							}}>
							Email address
						</Text>

						<View
							style={{
								width: "100%",
								height: 48,
								borderColor: COLORS.secondary,
								borderWidth: 1,
								borderRadius: 8,
								alignItems: "center",
								justifyContent: "center",
								paddingLeft: 22,
							}}>
							<TextInput
								placeholder='Enter your email address'
								placeholderTextColor={COLORS.secondary}
								keyboardType='email-address'
								style={{ width: "100%", fontFamily: FONT.regular }}
								value={formData.email}
								onChangeText={(text) => {
									setFormData({ ...formData, email: text });
									setEmailError(null); // Clear error when typing
								}}
								onSubmitEditing={handleLogin} // Call handleLogin when the "Done" key is pressed
							/>
						</View>

						{/* Display error message if email is empty or invalid */}
						{emailError && (
							<Text style={{ color: COLORS.error, fontFamily: FONT.medium }}>
								{emailError}
							</Text>
						)}
					</View>

					<View style={{ marginBottom: 12 }}>
						<Text
							style={{
								fontSize: 16,
								fontWeight: "400",
								marginVertical: 8,
								fontFamily: FONT.medium,
							}}>
							Password
						</Text>

						<View
							style={{
								width: "100%",
								height: 48,
								borderColor: COLORS.secondary,
								borderWidth: 1,
								borderRadius: 8,
								alignItems: "center",
								justifyContent: "center",
								paddingLeft: 22,
							}}>
							<TextInput
								placeholder='Enter your password'
								placeholderTextColor={COLORS.secondary}
								secureTextEntry={isPasswordShown}
								style={{ width: "100%", fontFamily: FONT.regular }}
								value={formData.password}
								onChangeText={(text) => {
									setFormData({ ...formData, password: text });
									setPasswordError(null); // Clear error when typing
								}}
								onSubmitEditing={handleLogin} // Call handleLogin when the "Done" key is pressed
							/>

							<TouchableOpacity
								onPress={() => setIsPasswordShown(!isPasswordShown)}
								style={{ position: "absolute", right: 12 }}>
								{isPasswordShown == true ? (
									<Ionicons
										name='eye-off'
										size={24}
										color={COLORS.secondary}
									/>
								) : (
									<Ionicons
										name='eye'
										size={24}
										color={COLORS.secondary}
									/>
								)}
							</TouchableOpacity>
						</View>

						{/* Display error message if password is empty */}
						{passwordError && (
							<Text style={{ color: COLORS.error, fontFamily: FONT.medium }}>
								{passwordError}
							</Text>
						)}
					</View>

					{/* Login Button */}
					<Button
						title='Login'
						filled
						onPress={handleLogin} // Call handleLogin function on button press
						isLoading={isLoading} // Pass loading state to the Button component
						style={{
							marginTop: 18,
							fontFamily: FONT.regular,
							marginBottom: 4,
						}}
					/>

					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							marginVertical: 20,
						}}>
						<View
							style={{
								flex: 1,
								height: 1,
								backgroundColor: COLORS.secondary,
								marginHorizontal: 10,
							}}
						/>
						<Text style={{ fontSize: 14, fontFamily: FONT.medium }}>
							Or Login with
						</Text>
						<View
							style={{
								flex: 1,
								height: 1,
								backgroundColor: COLORS.secondary,
								marginHorizontal: 10,
							}}
						/>
					</View>

					<View style={{ flexDirection: "row", justifyContent: "center" }}>
						{/* Facebook Button */}
						<TouchableOpacity
							onPress={() => console.log("Pressed")}
							style={{
								flex: 1,
								alignItems: "center",
								justifyContent: "center",
								flexDirection: "row",
								height: 52,
								borderWidth: 1,
								borderColor: COLORS.grey,
								marginRight: 4,
								borderRadius: 10,
							}}>
							<Image
								source={require("../../assets/facebook.png")}
								style={{
									height: 36,
									width: 36,
									marginRight: 8,
								}}
								resizeMode='contain'
							/>
							<Text style={{ fontFamily: FONT.regular }}>Facebook</Text>
						</TouchableOpacity>

						{/* Google Button */}
						<TouchableOpacity
							onPress={() => console.log("Pressed")}
							style={{
								flex: 1,
								alignItems: "center",
								justifyContent: "center",
								flexDirection: "row",
								height: 52,
								borderWidth: 1,
								borderColor: COLORS.grey,
								marginRight: 4,
								borderRadius: 10,
							}}>
							<Image
								source={require("../../assets/google.png")}
								style={{
									height: 36,
									width: 36,
									marginRight: 8,
								}}
								resizeMode='contain'
							/>
							<Text style={{ fontFamily: FONT.regular }}>Google</Text>
						</TouchableOpacity>
					</View>

					<View
						style={{
							flexDirection: "row",
							justifyContent: "center",
							marginVertical: 22,
						}}>
						<Text
							style={{
								fontSize: 16,
								color: COLORS.secondary,
								fontFamily: FONT.medium,
							}}>
							Don't have an account ?
						</Text>
						<Pressable onPress={() => router.push("/signup")}>
							<Text
								style={{
									fontSize: 16,
									color: COLORS.primary,
									marginLeft: 6,
									fontFamily: FONT.bold,
								}}>
								Register
							</Text>
						</Pressable>
					</View>
				</View>
			</SafeAreaView>
		</GestureHandlerRootView>
	);
};

export default Login;
