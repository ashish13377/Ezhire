import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const CustomToast = ({ message, icon }) => {
  return (
    <View style={styles.container}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  message: {
    color: '#fff',
  },
});

export default CustomToast;
