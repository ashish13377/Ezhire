import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { COLORS, FONT, SIZES, SHADOWS, icons, images } from '../../constants'; // Adjust the path accordingly
import { Clipboard } from 'react-native';
import { Stack, useRouter, useSearchParams } from 'expo-router';
import { ScreenHeaderBtn } from '../../components';

const OTPScreen = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpInputs = Array(6).fill(0).map((_, index) => useRef(null));
    const [isLoading, setIsLoading] = useState(false);
    const [check, setCheck] = useState(true);
    const [error, setError] = useState('');
    const [pastedText, setPastedText] = useState('');


    const params = useSearchParams();
    const router = useRouter();
    const email = params.email;

    const handleOtpChange = (index, value) => {
        if (value.length === 1 && index < 5) {
            otpInputs[index + 1].current.focus();
        }

        const updatedOtp = [...otp];
        updatedOtp[index] = value;
        setOtp(updatedOtp);
    };

    const handleKeyPress = (event, index) => {
        const isBackspace = event.nativeEvent.key === 'Backspace';
        const isDelete = event.nativeEvent.key === 'Delete';

        if ((isBackspace || isDelete) && index > 0) {
            const updatedOtp = [...otp];
            updatedOtp[index - 1] = '';
            otpInputs[index - 1].current.focus();
            setOtp(updatedOtp);
        }
        if (index === 0) {
            setCheck(true);
            Clipboard.setString('');
        }
    };


    const handleVerifyOtp = () => {
        setIsLoading(true);

        // Simulating a 2-second delay, replace this with your actual verification logic
        setTimeout(() => {
            const isValid = validateOtp(); // Implement your OTP validation logic here

            if (isValid) {
                console.log('Verifying OTP:', otp.join(''));
                setIsLoading(false);
                setError(''); // Reset the error state

                // Reset OTP input fields
                const emptyOtp = Array(6).fill('');
                setOtp(emptyOtp);

                // Reset other relevant states
                setCheck(true);
                setPastedText('');
                Clipboard.setString('');
                otpInputs[0].current.focus();
                router.push(`/profile-page`);
                // Optionally, you can reset other states if needed
            } else {
                setError('Invalid OTP. Please try again.');
                setIsLoading(false);
            }
        }, 2000);
    };

    const validateOtp = () => {
        // Implement your OTP validation logic here
        // For example, check if the OTP is not empty and meets your criteria
        const enteredOtp = otp.join('');
        return enteredOtp.length === 6;
    };

    const handlePaste = async () => {
        if (check) {
            try {
                const pastedText = await Clipboard.getString();
                if (pastedText.length === 6) {
                    const updatedOtp = pastedText.split('');
                    setOtp(updatedOtp);
                    setCheck(false);
                    // Set focus to the last input field after pasting
                    otpInputs[5].current.focus();
                }
            } catch (error) {
                console.error('Error pasting OTP:', error);
            }
        }

    };


    return (
        <SafeAreaView style={styles.container}>
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
                    headerTitle: '',
                }}
            />
            <View style={{ flex: 1, marginHorizontal: 22 }}>
                <View style={{ marginVertical: 30 }}>
                    <Image
                        source={images.verification} // Adjust the path to your image
                        style={styles.headerImage}
                    />
                    <Text
                        style={{
                            fontSize: 22,
                            marginVertical: 7,
                            color: COLORS.secondary,
                            fontFamily: FONT.bold,
                        }}
                    >
                        Account Verification
                    </Text>
                    <Text style={{ fontSize: 16, fontFamily: FONT.medium }}>
                        your code has landed in your email{' '}
                        <Text style={{ color: COLORS.tertiary }}>{email}</Text>
                    </Text>
                </View>
                <View style={{ marginBottom: 50, marginTop: 25 }}>
                    <View style={styles.otpContainer}>
                        {otpInputs.map((inputRef, index) => (
                            <TextInput
                                key={index}
                                style={[styles.otpInput, otp[index] && styles.filledInput]}
                                maxLength={1}
                                value={otp[index]}
                                ref={inputRef}
                                onChangeText={(value) => handleOtpChange(index, value)}
                                onKeyPress={(event) => handleKeyPress(event, index)}
                                onSelectionChange={handlePaste}
                                onSubmitEditing={() => handleVerifyOtp()}
                            />
                        ))}
                    </View>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>
                <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={handleVerifyOtp}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={COLORS.lightWhite} />
                    ) : (
                        <Text style={{ color: COLORS.white, fontFamily: FONT.bold, fontSize: 16 }}>Verify</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightWhite,
    },
    innerContainer: {
        flex: 1,
        justifyContent: '',
        alignItems: 'center',
        paddingHorizontal: SIZES.large,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
        marginBottom: SIZES.large,
    },
    otpInput: {
        borderBottomWidth: 1,
        color: COLORS.secondary,
        borderBottomColor: COLORS.secondary,
        fontSize: SIZES.xLarge,
        textAlign: 'center',
        width: '15%',
    },
    filledInput: {
        color: COLORS.tertiary,
        borderBottomColor: COLORS.tertiary,
    },
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
    headerImage: {
        width: '30%',
        height: 100,
        resizeMode: 'cover',
    },
    errorText: {
        color: COLORS.error,
    },
});

export default OTPScreen;
