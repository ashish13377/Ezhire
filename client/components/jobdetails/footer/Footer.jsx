import { View, Text, TouchableOpacity, Image, Linking } from "react-native";
import styles from "./footer.style";
import { icons } from "../../../constants";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_ENDPOINT from "../../../utils";

const Footer = ({ url, data, handleLikePress, isLiked, handleUnLikePress }) => {
	const [user, setData] = useState(null);

	useEffect(() => {
		const getData = async () => {
			const DATA_KEY = "@Ezhire:userData";
			const userData = await AsyncStorage.getItem(DATA_KEY);
			setData(JSON.parse(userData));
		};
		getData();
	}, []);

	const handleApplyPress = async () => {
		if (isLiked === true) {
			handleUnLikePress();
		} else {
			if (user) {
				try {
					// Make an API call using Axios to send data to the server
					const response = await axios.post(
						API_ENDPOINT + "wishlist" + "/" + "add",
						{
							userId: user._id,
							job_id: data[0].job_id,
							employer_logo: data[0].employer_logo,
							job_title: data[0].job_title,
							job_employment_type: data[0].job_employment_type,
							data: data,
						}
					);

					if (response.status === 200) {
						handleLikePress();
					}
				} catch (error) {
					console.error("API Error here:", error);
				}
			}
		}
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.likeBtn}
				onPress={() => {
					handleApplyPress();
				}}>
				<Image
					source={isLiked ? icons.heartFilled : icons.heartOutline}
					resizeMode='contain'
					style={styles.likeBtnImage}
				/>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.applyBtn}
				onPress={() => Linking.openURL(url)}>
				<Text style={styles.applyBtnText}>Apply for job</Text>
			</TouchableOpacity>
		</View>
	);
};

export default Footer;
