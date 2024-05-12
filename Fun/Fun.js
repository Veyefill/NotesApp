import { Button, Text } from "@rneui/themed";
import { View, StyleSheet, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';

export default function Fun({ navigation }) {
    const [activity, setActivity] = useState([]);
    const [activityModal, setActivityModal] = useState(false);

    const getActivities = () => {
        fetch(`https://www.boredapi.com/api/activity`)
            .then(response => response.json())
            .then(responseJson => setActivity(responseJson))
            .catch(error => {
                Alert.alert('Error', error)
            })
        setActivityModal(true);
    }

    return (
        <View style={styles.container}>
            <Button
                title="Generate A Random Activity"
                color='lightpink'
                onPress={() => getActivities()}
            />
            <Modal
                animationType='slide'
                transparent={true}
                visible={activityModal}
            >
                <View style={styles.container}>
                    <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 50 }}>Your Random Activity!</Text>
                    <Text style={{ fontSize: 18, marginBottom: 5 }}>{activity.activity}</Text>
                    <Text style={{ fontSize: 18, marginBottom: 5 }}>Type: {activity.type}</Text>
                    <Text style={{ fontSize: 18, marginBottom: 75 }}>Participants: {activity.participants}</Text>
                    <Button
                        color='lightpink'
                        title="Thanks!"
                        onPress={() => {
                            setActivityModal(false);
                            navigation.navigate('MainPage');
                        }}
                    />
                </View>
            </Modal>
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
});
