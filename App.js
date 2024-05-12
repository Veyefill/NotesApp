import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ViewNotes from './Notes/ViewNotes';
import ViewTasks from './ToDo/ViewTasks';
import MainPage from './MainPage';
import Fun from './Fun/Fun';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MainPage" component={MainPage}></Stack.Screen>
        <Stack.Screen name="ViewTasks" component={ViewTasks}></Stack.Screen>
        <Stack.Screen name="ViewNotes" component={ViewNotes}></Stack.Screen>
        <Stack.Screen name="Fun" component={Fun}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}