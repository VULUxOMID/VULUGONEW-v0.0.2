import React from 'react';
import { StyleSheet, View } from 'react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import SidebarMenu from '../../src/components/SidebarMenu';

export default function Index() {
  return (
    <View style={styles.container}>
      <HomeScreen />
      <SidebarMenu onMenuStateChange={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131318',
  },
}); 