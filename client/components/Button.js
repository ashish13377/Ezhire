import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import React from 'react'
import { COLOR } from '../constants'

const Button = (props) => {
    const filledBgColor = props.color || COLOR.primary;
    const outlinedColor = COLOR.white;
    const bgColor = props.filled ? filledBgColor : outlinedColor;
    const textColor = props.filled ? COLOR.white : COLOR.primary;

    return (
        <TouchableOpacity
            style={{
                ...styles.button,
                ...{ backgroundColor: "#FF7754" },
                ...props.style
            }}
            onPress={props.onPress}
        >
            {
                props.isLoading ? <ActivityIndicator size='small' color='#ffffff' /> :  <Text style={{ fontSize: 18, fontFamily: 'DMMedium', color: '#ffffff', ... { color: '#ffffff' } }}>{props.title}</Text>
            } 
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        paddingBottom: 16,
        paddingVertical: 10,
        borderColor: "#FF7754",
        borderWidth: 2,
        borderRadius: 12,
        alignItems: 'center',
        fontFamily: 'DMMedium',
        justifyContent: 'center'
    }
})
export default Button