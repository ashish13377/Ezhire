import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Pressable, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT, icons, SIZES } from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { ScreenHeaderBtn } from '../../components';

import Toast from '../../components/Toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import axios from 'axios';


const STORAGE_KEY = '@Ezhire:locationData';


const Signup = () => {
    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newCity, setNewCity] = useState(null);
    const [newCountry, setNewCountry] = useState(null);
    const toastRef = useRef();

    useEffect(() => {
        const loadLocationData = async () => {
            try {
                const storedLocationData = await AsyncStorage.getItem(STORAGE_KEY);

                if (storedLocationData) {
                    const { city, country } = JSON.parse(storedLocationData);
                    setNewCity(city);
                    setNewCountry(country);
                } else {
                    const { status } = await Location.requestForegroundPermissionsAsync();

                    if (status === 'granted') {
                        const location = await Location.getCurrentPositionAsync({});
                        const { latitude, longitude } = location.coords;

                        fetchLocationData(latitude, longitude);
                    } else {
                        console.log('Location permission denied');
                    }
                }
            } catch (error) {
                console.error('Error loading location data:', error);
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
                data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.hamlet;
            const country = data.address.country;

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ city, country }));

            setNewCountry(country);
            setNewCity(city);

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
    });

    // Error states
    const [firstNameError, setFirstNameError] = useState(null);
    const [lastNameError, setLastNameError] = useState(null);
    const [emailError, setEmailError] = useState(null);
    const [phoneError, setPhoneError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [checkError, setCheckError] = useState(null);

    const router = useRouter();


    const handleSignUp = async () => {
        // Validate form fields
        let isValid = true;

        // Email validation using a regular expression
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.email.trim()) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!emailRegex.test(formData.email.trim())) {
            setEmailError('Invalid email format');
            isValid = false;
        } else {
            setEmailError(null);
        }

        if (!formData.phone.trim()) {
            setPhoneError('Phone number is required');
            isValid = false;
        } else {
            setPhoneError(null);
        }

        if (!formData.firstName.trim()) {
            setFirstNameError('First Name is required');
            isValid = false;
        } else {
            setFirstNameError(null);
        }

        if (!formData.lastName.trim()) {
            setLastNameError('Last Name is required');
            isValid = false;
        } else {
            setLastNameError(null);
        }

        if (!formData.password.trim()) {
            setPasswordError('Password is required');
            isValid = false;
        } else {
            setPasswordError(null);
        }

        if (!isChecked) {
            setCheckError('Please check the terms and conditions ');
            isValid = false;
        } else {
            setCheckError(null);
        }
        if (!isValid) {
            // Stop sign-up process if there are validation errors
            return;
        }

        setIsLoading(true);

        try {
            // Simulate calling an authentication API
            const authApiUrl = 'https://ezhire.onrender.com/auth/signup'; // Replace with your actual API endpoint

            const response = await axios.post(authApiUrl, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
            });

            if (response.status !== 201) {
                // Handle authentication failure
                toastRef.current.show({
                    type: 'error',
                    text: 'User already exists',
                    duration: 2500,
                });

                return
            }

            // Authentication successful
            toastRef.current.show({
                type: 'success',
                text: 'Regestraion successful 🎉',
                duration: 2500,
            });

            // Reset form data after successful login
            setTimeout(() => {
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    phone: '',
                });
                router.replace('/login');
                setIsLoading(false);
            }, 2699);

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
                        headerTitle: '',
                    }}
                />
                <Toast ref={toastRef} />

                <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: -35 }}>
                    <View style={{ paddingBottom: 10, padding: 10 }}>

                        {/* ... other components */}
                        <View style={{ marginVertical: 0 }}>
                            <Text
                                style={{
                                    fontSize: 22,
                                    marginVertical: 0,
                                    color: COLORS.secondary,
                                    fontFamily: FONT.bold,
                                    zIndex: 1,
                                }}
                            >
                                Create Account
                            </Text>

                            <Text style={{ fontSize: 16, color: COLORS.secondary, fontFamily: FONT.medium, zIndex: 1, }}>
                            Connect with job opportunities today!
                            </Text>
                        </View>

                        {/* First Name Input */}
                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: '400', marginVertical: 8, fontFamily: FONT.medium }}>
                                First Name
                            </Text>

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
                                    placeholder='Enter your first name'
                                    placeholderTextColor={COLORS.secondary}
                                    style={{ width: '100%', fontFamily: FONT.regular }}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, firstName: text });
                                    }}
                                    value={formData.firstName}
                                    onSubmitEditing={handleSignUp}

                                />
                            </View>
                            {firstNameError && <Text style={{ color: COLORS.error, fontFamily: FONT.medium }}>{firstNameError}</Text>}

                        </View>

                        {/* Last Name Input */}
                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: '400', marginVertical: 8, fontFamily: FONT.medium }}>
                                Last Name
                            </Text>

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
                                    placeholder='Enter your last name'
                                    placeholderTextColor={COLORS.secondary}
                                    style={{ width: '100%', fontFamily: FONT.regular }}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, lastName: text });
                                    }}
                                    value={formData.lastName}
                                    onSubmitEditing={handleSignUp}
                                />
                            </View>
                            {lastNameError && <Text style={{ color: COLORS.error, fontFamily: FONT.medium }}>{lastNameError}</Text>}

                        </View>

                        {/* Email Input */}
                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: '400', marginVertical: 8, fontFamily: FONT.medium }}>
                                Email address
                            </Text>

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
                                    placeholder='Enter your email address'
                                    placeholderTextColor={COLORS.secondary}
                                    keyboardType='email-address'
                                    style={{ width: '100%', fontFamily: FONT.regular }}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, email: text });
                                        setEmailError(null); // Clear error when typing
                                    }}
                                    value={formData.email}
                                    onSubmitEditing={handleSignUp}
                                />
                            </View>

                            {/* Display error message if email is empty or invalid */}
                            {emailError && <Text style={{ color: COLORS.error, fontFamily: FONT.medium }}>{emailError}</Text>}
                        </View>

                        {/* Phone Input */}
                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: '400', marginVertical: 8, fontFamily: FONT.medium }}>
                                Mobile Number
                            </Text>

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
                                <TextInput
                                    placeholder='+91'
                                    placeholderTextColor={COLORS.secondary}
                                    value='+91'
                                    keyboardType='numeric'
                                    style={{
                                        width: '12%',
                                        borderRightWidth: 1,
                                        borderLeftColor: COLORS.grey,
                                        height: '100%',
                                        fontFamily: FONT.bold,
                                    }}

                                />

                                <TextInput
                                    placeholder='Enter your phone number'
                                    placeholderTextColor={COLORS.secondary}
                                    keyboardType='numeric'
                                    style={{ width: '80%', fontFamily: FONT.regular }}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, phone: text });
                                        setPhoneError(null); // Clear error when typing
                                    }}
                                    value={formData.phone}
                                    onSubmitEditing={handleSignUp}
                                />
                            </View>

                            {/* Display error message if phone number is empty */}
                            {phoneError && <Text style={{ color: COLORS.error, fontFamily: FONT.medium }}>{phoneError}</Text>}
                        </View>

                        {/* Password Input */}
                        <View style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: '400', marginVertical: 8, fontFamily: FONT.medium }}>
                                Password
                            </Text>

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
                                    placeholder='Enter your password'
                                    placeholderTextColor={COLORS.secondary}
                                    secureTextEntry={isPasswordShown}
                                    style={{ width: '100%', fontFamily: FONT.regular }}
                                    onChangeText={(text) => {
                                        setFormData({ ...formData, password: text });
                                        setPasswordError(null); // Clear error when typing
                                    }}
                                    value={formData.password}
                                    onSubmitEditing={handleSignUp}
                                />

                                <TouchableOpacity
                                    onPress={() => setIsPasswordShown(!isPasswordShown)}
                                    style={{ position: 'absolute', right: 12 }}
                                >
                                    {isPasswordShown == true ? (
                                        <Ionicons name='eye' size={24} color={COLORS.secondary} />
                                    ) : (
                                        <Ionicons name='eye-off' size={24} color={COLORS.secondary} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Display error message if password is empty */}
                            {passwordError && <Text style={{ color: COLORS.error, fontFamily: FONT.medium }}>{passwordError}</Text>}
                        </View>

                        {/* Checkbox */}
                        <View style={{ flexDirection: 'row', marginVertical: 6 }}>
                            <Checkbox
                                style={{ marginRight: 8 }}
                                value={isChecked}
                                onValueChange={setIsChecked}
                                color={isChecked ? COLORS.primary : undefined}
                            />
                            <Text style={{ fontFamily: FONT.medium }}>I agree to the terms and conditions</Text>
                        </View>
                        {checkError && <Text style={{ color: COLORS.error, fontFamily: FONT.medium }}>{checkError}</Text>}


                        {/* Sign Up Button */}
                        <TouchableOpacity
                            disabled={isLoading}
                            onPress={handleSignUp}
                            style={{
                                marginTop: 18,
                                marginBottom: 4,
                                backgroundColor: isLoading ? COLORS.primary : COLORS.tertiary,
                                borderRadius: 8,
                                height: 48,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={COLORS.lightWhite} />
                            ) : (
                                <Text style={{ color: COLORS.white, fontFamily: FONT.bold, fontSize: 16 }}>Sign Up</Text>
                            )}
                        </TouchableOpacity>

                        {/* ... other components */}
                        {/* Social Media Buttons */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                            <View
                                style={{
                                    flex: 1,
                                    height: 1,
                                    backgroundColor: COLORS.secondary,
                                    marginHorizontal: 10,
                                }}
                            />
                            <Text style={{ fontSize: 14, fontFamily: FONT.medium }}>Or Sign up with</Text>
                            <View
                                style={{
                                    flex: 1,
                                    height: 1,
                                    backgroundColor: COLORS.secondary,
                                    marginHorizontal: 10,
                                }}
                            />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            {/* Facebook Button */}
                            <TouchableOpacity
                                onPress={() => console.log('Pressed')}
                                style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'row',
                                    height: 52,
                                    borderWidth: 1,
                                    borderColor: COLORS.grey,
                                    marginRight: 4,
                                    borderRadius: 10,
                                }}
                            >
                                <Image
                                    source={require('../../assets/facebook.png')}
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
                                onPress={() => console.log('Pressed')}
                                style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'row',
                                    height: 52,
                                    borderWidth: 1,
                                    borderColor: COLORS.grey,
                                    marginRight: 4,
                                    borderRadius: 10,
                                }}
                            >
                                <Image
                                    source={require('../../assets/google.png')}
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

                        {/* Login Link */}
                        <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 22 }}>
                            <Text style={{ fontSize: 16, color: COLORS.secondary, fontFamily: FONT.medium }}>
                                Already have an account
                            </Text>
                            <Pressable onPress={() => router.push('/login')}>
                                <Text
                                    style={{
                                        fontSize: 16,
                                        color: COLORS.primary,
                                        fontFamily: FONT.bold,
                                        marginLeft: 6,
                                    }}
                                >
                                    Login
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Signup;

