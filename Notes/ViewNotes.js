import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, TextInput, FlatList, Modal, TouchableHighlight } from 'react-native';
import { Button, Text, Input } from '@rneui/themed';
import * as SQLite from 'expo-sqlite/legacy';
import { Icon } from '@rneui/themed';
import * as Speech from 'expo-speech';

const db = SQLite.openDatabase('postpanedb.db');

export default function ViewNotes() {
    const [noteName, setNoteName] = useState("");
    const [noteDescription, setNoteDescription] = useState("");
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState([]);

    //Modals
    const [addNoteModal, setAddNoteModal] = useState(false);
    const [noteMenuModal, setNoteMenuModal] = useState(false);
    const [seeNoteModal, setSeeNoteModal] = useState(false);
    const [editNoteModal, setEditNoteModal] = useState(false);

    //Creating the Table
    useEffect(() => {
        db.transaction(tx => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT);'
            );
        }, null, updateList);

        updateList();
    }, []);

    // Saving a Note
    const saveNote = async () => {
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO notes (name, description) VALUES (?, ?);',
                [noteName, noteDescription],
                (_, { insertId }) => {
                    console.log('Item inserted with ID:', insertId);
                    updateList();
                },
                (_, error) => {
                    console.error('Error inserting item:', error);
                }
            );
        });
    };

    //Updating the FlatList
    const updateList = async () => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM notes;',
                [],
                (_, { rows }) => {
                    setNotes(rows._array);
                },
                (_, error) => {
                    console.error('Error fetching note:', error);
                }
            );
        });
    };

    //Deleting notes
    const deleteNote = (id) => {
        db.transaction(
            tx => {
                tx.executeSql('DELETE FROM notes WHERE id = ?;', [id]);
            }, null, updateList);
    };

    //Update Note for Editing
    const updateNote = (id) => {
        db.transaction(tx => {
            tx.executeSql('UPDATE notes SET name = ?, description = ? WHERE id = ?;',
                [noteName, noteDescription, id]);
        }, null, updateList);
        clearNote();
        console.log("Updated", id)
    };


    //Closing the AddNoteModal and saving the note to db
    const closeAddNoteWithSave = () => {
        if (noteName) {
            saveNote();
            setAddNoteModal(false);
            clearNote();
        } else {
            Alert.alert("Please add a Name for your note")
        }
    };

    //Closing the AddNoteModal without saving anything
    const closeAddNoteWithoutSave = () => {
        setAddNoteModal(false);
        clearNote();
    };

    //Handling long presses to open the menu
    const handleMenuPress = (item) => {
        setSelectedNote(item);
        setNoteMenuModal(true);
    }

    //Handling quick presses to open the note
    const handleViewPress = (item) => {
        setSelectedNote(item);
        setSeeNoteModal(true);
    }

    //Handling pressing the "Edit" button
    const handleEditPress = (item) => {
        setNoteName(selectedNote.name);
        setNoteDescription(selectedNote.description);
        setEditNoteModal(true);
    }

    //Handling text to speech
    const readOutloud = (words) => {
        Speech.speak(words.name + "... " + words.description);
    }

    //Declaring renderItem
    const renderItem = ({ item }) => (
        <View>
            <TouchableHighlight
                underlayColor='mistyrose'
                onPress={() => handleViewPress(item)}
                onLongPress={() => handleMenuPress(item)}
            >
                <Text style={styles.notenames}>{item.name}</Text>
            </TouchableHighlight>
        </View>
    );

    const clearNote = () => {
        setNoteName("");
        setNoteDescription("");
    };

    //This' mainly for bug tests.
    /*
    const deleteAll = () => {
        db.transaction(
            tx => {
                tx.executeSql('DELETE FROM notes;');
            }, null, updateList);
    };*/

    return (
        <View style={styles.container}>
            {/*Flatlist for displaying note titles*/}
            <View style={{ flex: 1 }}>
                <FlatList
                    data={notes}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                />
            </View>
            {/*Button for opening AddNoteModal*/}
            <View>
                <Button
                    raised
                    icon={{ name: 'add' }}
                    color='darkolivegreen'
                    style={styles.bottombutton}
                    title="ADD A NOTE"
                    onPress={() => setAddNoteModal(true)}
                />
            </View>
            {/*Modal for Adding Notes*/}
            <Modal
                animationType='slide'
                transparent={true}
                visible={addNoteModal}
            >
                <View style={styles.container}>
                    <View style={styles.menu}>
                        <Input placeholder='Name, max 30 letters' label='NAME'
                            maxLength={30}
                            inputContainerStyle={{ borderColor: '#ffccec' }}
                            onChangeText={noteName => setNoteName(noteName)} value={noteName}
                        />
                        <Input placeholder='Description' label='DESCRIPTION'
                            multiline
                            inputContainerStyle={{ borderColor: '#ffccec' }}
                            onChangeText={noteDescription => setNoteDescription(noteDescription)} value={noteDescription}
                        />
                        <View style={styles.rowbuttons}>
                            <Button raised icon={{ name: 'save' }}
                                color='darkolivegreen'
                                onPress={closeAddNoteWithSave}
                                title="ADD"
                            />
                            <Button raised icon={{ name: 'close' }}
                                color='firebrick'
                                onPress={closeAddNoteWithoutSave}
                                title="CANCEL"
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            {/*Modal for opening note menus*/}
            <Modal
                animationType='slide'
                transparent={true}
                visible={noteMenuModal}
            >
                <View style={styles.container}>
                    <View style={styles.menu}>
                        <Text style={styles.viewtitle}>{selectedNote.name}</Text>
                        <Text style={styles.edittextcontent}>What would you like to do with this note?</Text>
                        <View style={styles.rowbuttons} width='100%'>
                            <Button
                                raised
                                icon={{ name: 'arrow-back' }}
                                title="GO BACK"
                                color="darkolivegreen"
                                onPress={() => setNoteMenuModal(false)}
                            />
                            <Button
                                raised
                                icon={{ name: 'edit' }}
                                title="EDIT"
                                color="goldenrod"
                                onPress={() => handleEditPress()}
                            />
                            <Button
                                raised
                                icon={{ name: 'delete' }}
                                title="DELETE"
                                color="firebrick"
                                onPress={() => {
                                    deleteNote(selectedNote.id)
                                    setNoteMenuModal(false)
                                }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            {/*Modal for opening notes*/}
            <Modal
                animationType='slide'
                transparent={true}
                visible={seeNoteModal}
            >
                <View style={styles.container}>
                    <Text style={styles.viewtitle}>{selectedNote.name}</Text>
                    <Text style={styles.notedesc}>{selectedNote.description}</Text>
                    <View style={{ bottom: 0, left: 0, right: 0, position: 'absolute' }}>
                        <Button
                            raised
                            icon={{ name: 'volume-up' }}
                            title="READ"
                            color='dodgerblue'
                            onPress={() => readOutloud(selectedNote)}
                        />
                        <Button
                            raised
                            icon={{ name: 'arrow-back' }}
                            title="GO BACK"
                            color='firebrick'
                            onPress={() => setSeeNoteModal(false)}
                        />
                    </View>
                </View>
            </Modal>
            {/*Note Editing Modal*/}
            <Modal
                animationType='slide'
                transparent={true}
                visible={editNoteModal}
            >
                <View style={styles.container}>
                    <View style={styles.menu}>
                        <Input placeholder='Name, max 30 letters' label='NAME'
                            maxLength={30}
                            inputContainerStyle={{ borderColor: '#ffccec' }}
                            onChangeText={noteName => setNoteName(noteName)} value={noteName}
                        />
                        <Input placeholder='Description' label='DESCRIPTION'
                            inputContainerStyle={{ borderColor: '#ffccec' }}
                            onChangeText={noteDescription => setNoteDescription(noteDescription)} value={noteDescription}
                        />
                        <View style={styles.rowbuttons}>
                            <Button
                                raised
                                icon={{ name: 'edit' }}
                                color='goldenrod'
                                title="EDIT"
                                onPress={() => {
                                    setNoteMenuModal(false);
                                    setEditNoteModal(false);
                                    updateNote(selectedNote.id);
                                }}
                            />
                            <Button
                                raised
                                icon={{ name: 'close' }}
                                color='firebrick'
                                title="CANCEL"
                                onPress={() => {
                                    clearNote();
                                    setEditNoteModal(false)
                                }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fcedf1',
    },

    menu: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },

    viewtitle: {
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
    },

    rowbuttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    bottombutton: {
        flex: 1,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'absolute',
    },

    notedesc: {
        marginHorizontal: 20,
        marginBottom: 5,
        marginTop: 15,
        fontSize: 16,
    },

    notenames: {
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
        paddingVertical: 7.5,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: '#f5bfc1',
        borderRadius: 100,
    },

    edittextcontent: {
        fontSize: 18,
        marginVertical: 20,
    },
})