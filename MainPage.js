import React, { useState } from 'react';
import { StyleSheet, View, TextInput, FlatList } from 'react-native';
import { Button, Text } from '@rneui/themed';

export default function MainPage({ navigation }) {

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Postpane, your favorite notes app</Text>
            <Text style={{ marginBottom: 20, fontSize: 15 }}>Please select an option:</Text>
            <View style={styles.buttons}>
                <Button style={{}}
                    title="View Notes"
                    color='lightpink'
                    onPress={() => navigation.navigate('ViewNotes')}
                />
                <View style={{ height: 5 }} />
                <Button
                    title="View Tasks"
                    color='lightpink'
                    onPress={() => navigation.navigate('ViewTasks')}
                />
                <View style={{ height: 5 }} />
                <Button
                    title="View Fun"
                    color='lightpink'
                    onPress={() => navigation.navigate('Fun')}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcedf1',
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttons: {
        flex: 3,
        flexDirection: 'column',
    },

    title: {
        flex: 2,
        marginTop: 75,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
    }
});
