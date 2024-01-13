import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from '../constants';
import Button from '../components/Button';
import { Stack, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import Animated, {
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
const STORAGE_KEY = '@Ezhire:locationData';
const TOKEN_KEY = '@Ezhire:token';
const DATA_KEY = '@Ezhire:userData';

const Welcome = () => {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(false);
    const [newCity, setNewCity] = useState(null);
    const [newCountry, setNewCountry] = useState(null);


    useEffect(() => {
        loadLocationData();
    }, [newCity, newCountry]);

    const loadLocationData = async () => {
        try {
            const storedLocationData = await AsyncStorage.getItem(STORAGE_KEY);

            if (storedLocationData) {
                const { city, country } = JSON.parse(storedLocationData);
                setNewCity(city);
                setNewCountry(country);

                const tokenData = await AsyncStorage.getItem(TOKEN_KEY);
                const userData = await AsyncStorage.getItem(DATA_KEY);

                if (userData) {
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
                        await AsyncStorage.setItem('@Ezhire:userData', JSON.stringify(userData));
                        // You can also perform additional actions after successful login
                        setTimeout(() => {
                            router.replace('/home');
                        }, 2000);
                    } else {
                        // Handle authentication failure
                        await AsyncStorage.removeItem(TOKEN_KEY);
                        await AsyncStorage.removeItem(DATA_KEY);

                        setTimeout(() => {
                            setIsLogin(true);
                        }, 2000);
                    }
                } else {
                    setTimeout(() => {
                        setIsLogin(true);
                    }, 2000);
                }

            } else {
                const { status } = await Location.requestForegroundPermissionsAsync();

                if (status === 'granted') {
                    const location = await Location.getCurrentPositionAsync({});
                    const { latitude, longitude } = location.coords;


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

                        // console.log(city, country);

                        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ city, country }));


                        const tokenData = await AsyncStorage.getItem(TOKEN_KEY);
                        const userData = await AsyncStorage.getItem(DATA_KEY);

                        if (userData) {
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
                                await AsyncStorage.setItem('@Ezhire:userData', JSON.stringify(userData));
                                // You can also perform additional actions after successful login
                                // router.replace('/home');
                                setTimeout(() => {
                                    router.replace('/home');
                                }, 2000);
                            } else {
                                // Handle authentication failure
                                await AsyncStorage.removeItem(TOKEN_KEY);
                                await AsyncStorage.removeItem(DATA_KEY);
                                setTimeout(() => {
                                    setIsLogin(true);
                                }, 2000);

                            }
                        } else {
                            setTimeout(() => {
                                setIsLogin(true);
                            }, 2000);
                        }
                        setNewCountry(country);
                        setNewCity(city);

                    } catch (error) {
                        console.error('Error:', error);
                    }
                } else {
                    console.log('Location permission denied');
                }
            }
        } catch (error) {
            console.error('Error loading location data:', error);
        }
    };

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


   


    return (
        <>
            {
                isLogin ? (

                    <SafeAreaView style={{ flex: 1, backgroundColor: '#DD7B29' }}>
                        <Stack.Screen
                            options={{
                                headerShown: false
                            }}
                        />
                        <LinearGradient
                            style={{
                                flex: 1,
                                paddingTop: '13%'
                            }}
                            colors={[COLORS.secondary, COLORS.primary]}
                        >
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
                                                { rotate: "-15deg" }
                                            ]
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
                                                { rotate: "-5deg" }
                                            ]
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
                                                { rotate: "15deg" }
                                            ]
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
                                                { rotate: "-15deg" }
                                            ]
                                        }}
                                    />
                                </View>


                                <View style={{
                                    paddingHorizontal: 22,
                                    position: "absolute",
                                    top: 400,
                                    width: "100%"
                                }}>
                                    <Text style={{
                                        fontSize: 50,
                                        fontWeight: 800,
                                        color: COLORS.white,
                                        fontFamily: 'DMBold',
                                    }}>Let's Get</Text>
                                    <Text style={{
                                        fontSize: 46,
                                        fontWeight: 800,
                                        color: COLORS.white,
                                        fontFamily: 'DMBold'
                                    }}>Started</Text>

                                    <View style={{ marginVertical: 22 }}>
                                        <Text style={{
                                            fontSize: 16,
                                            color: COLORS.white,
                                            marginVertical: 4,
                                            fontFamily: 'DMMedium'
                                        }}>Connect securely, interview safely within</Text>
                                        <Text style={{
                                            fontSize: 16,
                                            color: COLORS.white,
                                            fontFamily: 'DMMedium'
                                        }}>The job-finding app for a private job search.</Text>
                                    </View>

                                    <Button
                                        title="Join Now"
                                        onPress={() => router.push("/signup")}
                                        style={{
                                            marginTop: 22,
                                            width: "100%",
                                        }}
                                    />

                                    <View style={{
                                        flexDirection: "row",
                                        marginTop: 12,
                                        justifyContent: "center"
                                    }}>
                                        <Text style={{
                                            fontSize: 16,
                                            color: COLORS.white,
                                            fontFamily: 'DMMedium'
                                        }}>Already have an account ?</Text>
                                        <TouchableOpacity

                                            onPress={() => router.push("/login")}
                                        >
                                            <Text style={{
                                                fontSize: 16,
                                                color: COLORS.white,
                                                fontWeight: "bold",
                                                fontFamily: 'DMBold',
                                                marginLeft: 4
                                            }}>Login</Text>
                                        </TouchableOpacity>

                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </SafeAreaView>

                ) : (

                    <SafeAreaView style={{ flex: 1, backgroundColor: '#DD7B29', justifyContent: 'center', alignItems: 'center', }}>
                        <Stack.Screen
                            options={{
                                headerShown: false

                            }}
                        />
                        {/* Big Circle 1 */}
                        <Animated.View
                            style={{
                                backgroundColor: 'rgba(245, 215, 189, 0.2)',
                                padding: bigCircleScale,
                                borderRadius: 165,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 20,
                            }}
                        >
                            {/* Big Circle 2 */}
                            <Animated.View
                                style={{
                                    backgroundColor: 'rgba(245, 215, 189, 0.36)',
                                    padding: smallCircleScale,
                                    borderRadius: 165,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                {/* Image in the center */}
                                <Image
                                    source={require('../assets/new_logo.png')}
                                    style={{ width: 170, height: 170, borderRadius: 170 / 2 }}
                                />
                            </Animated.View>
                        </Animated.View>

                        <View style={{ position: 'absolute', zIndex: 1, top: 670 }}>
                            <Image
                                source={require('../assets/wirte_logo.png')}
                                style={{ width: 200, height: 60 }}
                            />
                        </View>
                    </SafeAreaView>
                )
            }

        </>
    )
}

export default Welcome


