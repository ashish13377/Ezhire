import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl, Image, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import CountryPicker from "react-native-country-picker-modal";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons'; // Import the desired icon library
import styles from "../../components/jobdetails/company/company.style";
import { Stack, useRouter, } from 'expo-router';
import { COLORS, icons, SIZES, images, FONT, SHADOWS } from "../../constants";
import { ScreenHeaderBtn } from '../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Toast from '../../components/Toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const DATA_KEY = '@Ezhire:userData';
const PROFILE_KEY = '@Ezhire:profileImage';


const profilePage = () => {
  const router = useRouter();
  const toastRef = useRef();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const error = false;
  const [showPicker, setShowPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    countryCode: 'IN',
    phone: '',
    gender: '',
    dateOfBirth: '',
  });
  const [user, setData] = useState(null);
  const [userPic, setUserPic] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (fieldName, text) => {
    setIsTyping(true);
    setFormData((prevData) => ({ ...prevData, [fieldName]: text }));
  };

  useEffect(() => {
    const loadLocationData = async () => {
      const storedData = await AsyncStorage.getItem(DATA_KEY);
      const storData = await AsyncStorage.getItem(PROFILE_KEY);

      if (storedData) {
        setData(JSON.parse(storedData));
        setUserPic(JSON.parse(storData));

      }


    };

    // if (!isTyping && user) {
    //   setFormData({
    //     firstName: user?.firstName,
    //     lastName: user?.lastName,
    //     phone: user?.phone,
    //     countryCode: 'IN',
    //     gender: user?.gender,
    //     dateOfBirth: user?.dateOfBirth,
    //   })
    // }
    loadLocationData();
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Add logic to refetch data
    const TOKEN_KEY = '@Ezhire:token';
    const tokenData = await AsyncStorage.getItem(TOKEN_KEY);
    if (tokenData) {
      // Replace this URL with your actual authentication API endpoint
      const authApiUrl = 'https://ezhire.onrender.com/auth/getUserData';

      // Simulate calling an authentication API
      const response = await axios.post(authApiUrl, {
        token: tokenData,
      });

      // console.log(response);
      if (response.status === 200) {
        const { userData } = response.data;
        // console.log(userData);
        AsyncStorage.setItem('@Ezhire:userData', JSON.stringify(userData));

        setRefreshing(false);
        setIsTyping(false);

      }
    }

  }, []);

  const handleCountryCodeChange = (countryCode) => {
    setFormData((prevData) => ({
      ...prevData,
      countryCode,
    }));
  };

  const handleDateChange = (event, date) => {
    if (date !== undefined) {
      setFormData((prevData) => ({ ...prevData, dateOfBirth: date }));
    }
  };

  const handlePinIconClick = async () => {

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      console.log('Permission to access media library denied');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      // Use the assets array instead of uri
      const selectedImage = result.assets[0];
      const userSchema = {
        id: user._id,
        image: selectedImage.uri
      }
      await AsyncStorage.setItem('@Ezhire:profileImage', JSON.stringify(userSchema));
      Newupdate();
    };

  }

  const Newupdate = async () => {
    const storedData = await AsyncStorage.getItem(PROFILE_KEY);

    if (storedData) {
      setUserPic(JSON.parse(storedData));
    }
    setTimeout(() => {
      toastRef.current.show({
        type: 'success',
        text: `User profile updated successfully 🎉`,
        duration: 2500,
      });
    }, 500);
  }




  const handleSignUp = async () => {

    setRefreshing(true);

    setIsLoading(true);

    try {
      // Simulate calling an authentication API
      const authApiUrl = `https://ezhire.onrender.com/user/update-profile/?userId=${user._id}`; // Replace with your actual API endpoint

      const response = await axios.put(authApiUrl, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
      })

      if (response.status !== 200) {
        // Handle authentication failure
        toastRef.current.show({
          type: 'error',
          text: 'Something went wrong!',
          duration: 2500,
        });

        return
      }

      // Authentication successful
      toastRef.current.show({
        type: 'success',
        text: `${response.data.message} 🎉`,
        duration: 2500,
      });


      // Add logic to refetch data
      const TOKEN_KEY = '@Ezhire:token';
      const tokenData = await AsyncStorage.getItem(TOKEN_KEY);
      if (tokenData) {
        // Replace this URL with your actual authentication API endpoint
        const authApiUrl = 'https://ezhire.onrender.com/auth/getUserData';

        // Simulate calling an authentication API
        const response = await axios.post(authApiUrl, {
          token: tokenData,
        });

        // console.log(response);
        if (response.status === 200) {
          const { userData } = response.data;
          setData(userData)
          // console.log(userData);
          AsyncStorage.setItem('@Ezhire:userData', JSON.stringify(userData));

        }
        // Reset form data after successful login
        setTimeout(() => {
          setIsLoading(false);
          setRefreshing(false);
          setIsTyping(false);
        }, 2699);
      }
    } catch (error) {
      // console.error('Authentication error:', error);
      // Display error message to the user
      toastRef.current.show({
        type: 'error',
        text: error.response.data.message,
        duration: 2500,
      });
    } finally {
      // Set loading state back to false after login process completes
      setIsLoading(false);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.lightWhite }}>
        <Stack.Screen
          options={{
            headerStyle: { backgroundColor: COLORS.lightWhite },
            headerShadowVisible: false,
            headerBackVisible: false,
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

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {user ? (
            <View style={{ padding: SIZES.medium, paddingBottom: 100 }}>
              <View style={styles.container}>
                <TouchableOpacity style={styles.logoBox} onPress={handlePinIconClick}>
                  <Image
                    source={{
                      uri: userPic ? userPic.id === user?._id ? userPic.image : user?.profileimage : user?.profileimage
                    }}
                    style={[styles.logoImage, { borderRadius: SIZES.medium }]}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    marginTop : 10,
                    backgroundColor: COLORS.tertiary,
                    paddingVertical: 5,
                    paddingHorizontal: SIZES.small,
                    alignItems: 'center',
                    width: '30%',
                    borderRadius: 8,
                    ...SHADOWS.medium,
                  }}
                  onPress={()=>{router.push(`/wishlist/${user._id}`)}}
                >

                  <Text style={{ color: COLORS.white, fontFamily: FONT.bold, fontSize: 16 }}>Wishlist</Text>

                </TouchableOpacity>
                <View style={styles.jobTitleBox}>
                  <Text style={styles.jobTitle}>{user?.firstName + ' ' + user?.lastName}</Text>
                </View>

                <View style={styles.companyInfoBox}>
                  <Text style={styles.companyName}> {user?.email} </Text>
                </View>
              </View>
              <Text style={{ fontSize: 16, fontFamily: FONT.medium, marginTop: 10, color: COLORS.secondary, marginBottom: 0 }}>
                Update your profile
              </Text>
              <Text style={{ fontSize: 12, fontFamily: FONT.medium, marginTop: 2, color: COLORS.secondary, marginBottom: 20 }}>
                Please include all information.
              </Text>

              <View style={{ marginBottom: 20 }}>
                <View
                  style={{
                    width: '100%',
                    height: 48,
                    borderColor: COLORS.secondary,
                    borderWidth: 1,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: 22,
                  }}
                >
                  <TextInput
                    placeholder={`What's your first name?`}
                    placeholderTextColor={COLORS.secondary}
                    value={formData.firstName ? formData.firstName : isTyping ? formData.firstName : user?.firstName}
                    style={{ width: '100%', fontFamily: FONT.regular }}
                    onChangeText={(text) => handleInputChange('firstName', text)}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 20 }}>
                <View
                  style={{
                    width: '100%',
                    height: 48,
                    borderColor: COLORS.secondary,
                    borderWidth: 1,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: 22,
                  }}
                >
                  <TextInput
                    placeholder={`And your last name?`}
                    value={formData.lastName ? formData.lastName : isTyping ? formData.lastName : user?.lastName}
                    placeholderTextColor={COLORS.secondary}
                    style={{ width: '100%', fontFamily: FONT.regular }}
                    onChangeText={(text) => handleInputChange('lastName', text)}

                  />
                </View>
              </View>

              {/* Phone Input */}
              <View style={{ marginBottom: 20 }}>
                <View
                  style={{
                    width: '100%',
                    height: 48,
                    borderColor: COLORS.secondary,
                    borderWidth: 1,
                    borderRadius: 8,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingLeft: 22,
                  }}
                >
                  <CountryPicker
                    countryCode={formData.countryCode}
                    withFlagButton
                    withFilter
                    style={{ height: 48, width: '20%', fontFamily: FONT.bold }}
                    onSelect={(country) => handleCountryCodeChange(country.cca2)}
                  />

                  <TextInput
                    placeholder='Phone number'
                    placeholderTextColor={COLORS.secondary}
                    keyboardType='numeric'
                    style={{ width: '90%', fontFamily: FONT.regular }}
                    value={formData.phone ? formData.phone : isTyping ? formData.phone : user?.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}

                  />
                </View>
              </View>

              {/* Gender Input */}
              <View style={{ marginBottom: 20 }}>
                <View
                  style={{
                    width: '100%',
                    height: 48,
                    borderColor: COLORS.secondary,
                    borderWidth: 1,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: 10,
                  }}
                >
                  {/* Use Picker for gender */}
                  <Picker
                    selectedValue={formData.gender ? formData.gender : isTyping ? formData.gender : user?.gender}
                    onValueChange={(itemValue) => handleInputChange('gender', itemValue)}
                    style={{ height: 48, width: '100%', fontFamily: FONT.regular, color: COLORS.secondary, fontSize: SIZES.small }}
                  >
                    <Picker.Item label="Select Gender" value="" />
                    <Picker.Item label="Male" value="Male" />
                    <Picker.Item label="Female" value="Female" />
                    <Picker.Item label="Others" value="Others" />

                  </Picker>
                </View>
              </View>

              {/* Date of Birth Input */}
              <View style={{ marginBottom: 20 }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowPicker(true);
                    setIsTyping(true);
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row', // Add this line to set the flexDirection to 'row'
                      alignItems: 'center', // Align items to center vertically
                      width: '100%',
                      height: 48,
                      borderColor: COLORS.secondary,
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingLeft: 22,
                    }}
                  >
                    <Text style={{ flex: 1, fontFamily: FONT.regular, color: COLORS.secondary }}>
                      {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : user?.dateOfBirth ? new Date(user?.dateOfBirth).toLocaleDateString() : 'Date of Birth'}
                    </Text>
                    <MaterialIcons
                      name="date-range"
                      size={24}
                      color={COLORS.tertiary}
                      style={{ marginRight: 20 }}
                    />
                  </View>
                </TouchableOpacity>

                {showPicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowPicker(false);
                      if (date && isTyping) {
                        handleInputChange('dateOfBirth', date);
                        setSelectedDate(date);
                      }
                    }}
                  />
                )}

              </View>
              {
                isTyping ? <TouchableOpacity
                  style={styless.verifyButton}
                  onPress={handleSignUp}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={COLORS.lightWhite} />
                  ) : (
                    <Text style={{ color: COLORS.white, fontFamily: FONT.bold, fontSize: 16 }}>Update</Text>
                  )}
                </TouchableOpacity> : null
              }

            </View>
          ) : error ? (
            <Text>Something went wrong</Text>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='large' color={COLORS.primary} />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styless = StyleSheet.create({
  verifyButton: {
    backgroundColor: COLORS.tertiary,
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    alignItems: 'center',
    width: '40%',
    borderRadius: 8,
    ...SHADOWS.medium,
  },
  verifyButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: SIZES.medium,
    fontFamily: FONT.medium,
  },
  errorText: {
    color: COLORS.error,
  },
  pinIconContainer: {
    ...SHADOWS.small, // Apply the small shadow from the theme
    backgroundColor: COLORS.white,
    borderRadius: SIZES.medium / 2, // Round the container for a cool effect
    padding: SIZES.small,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

});

export default profilePage;
