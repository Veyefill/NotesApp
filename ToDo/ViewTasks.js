import React, { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite/legacy';
import { Button, Text, Input } from '@rneui/themed';
import { StyleSheet, View, Alert, TextInput, FlatList, Modal, TouchableHighlight } from 'react-native';
import { Icon } from '@rneui/themed';


const db = SQLite.openDatabase('postpanedb.db');

export default function ViewTasks() {
    const [taskName, setTaskName] = useState("");
    const [subtaskName, setSubtaskName] = useState("");
    const [tasks, setTasks] = useState([]);
    const [subtasks, setSubtasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState([]);
    const [selectedSubtask, setSelectedSubtask] = useState([]);
    const [subtaskStatus, setSubtaskStatus] = useState([]);

    //Task Modals
    const [addTaskModal, setAddTaskModal] = useState(false);
    const [editTaskModal, setEditTaskModal] = useState(false);
    const [viewTaskModal, setViewTaskModal] = useState(false);
    const [taskMenuModal, setTaskMenuModal] = useState(false);

    //Subtask Modals
    const [addSubtaskModal, setAddSubtaskModal] = useState(false);
    const [editSubtaskModal, setEditSubtaskModal] = useState(false);
    const [subtaskMenuModal, setSubtaskMenuModal] = useState(false);

    //Creating the Table
    useEffect(() => {
        db.transaction(tx => {
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);',
            );
            tx.executeSql(
                'CREATE TABLE IF NOT EXISTS subtasks (id INTEGER PRIMARY KEY AUTOINCREMENT, taskid INTEGER, name TEXT, FOREIGN KEY (taskid) REFERENCES tasks(id));',
            );
        }, null, updateTaskList);
        updateTaskList();
    }, []);

    useEffect(() => {
        // Fetch subtasks and update subtaskStatus
        const initialStatus = subtasks.map(() => false); // Array of 'false' indicating unchecked
        setSubtaskStatus(initialStatus);
    }, [subtasks]);

    // Saving a Task
    const saveTask = () => {
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO tasks (name) VALUES (?);',
                [taskName],
                (_, { insertId }) => {
                    console.log('Task inserted with ID: ', insertId);
                    updateTaskList();
                },
                (_, error) => {
                    console.error('Error inserting task:', error);
                }
            );
        });
    };

    //Update Task Flatlist
    const updateTaskList = async () => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM tasks;',
                [],
                (_, { rows }) => {
                    setTasks(rows._array);
                },
                (_, error) => {
                    console.error('Error fetching tasks:', error);
                }
            );
        });
    };

    //Deleting Tasks
    const deleteTask = (id) => {
        db.transaction(
            tx => {
                tx.executeSql('DELETE FROM tasks WHERE id = ?;', [id]);
                tx.executeSql('DELETE FROM subtasks WHERE taskid = ?;', [id]);
            }, null, updateTaskList);
    };

    //Update Task for Editing
    const updateTask = (id) => {
        db.transaction(tx => {
            tx.executeSql('UPDATE tasks SET name = ? WHERE id = ?;',
                [taskName, id]);
        }, null, updateTaskList);
        setTaskName("")
        console.log("Updated", id)
    };

    //Update Subtask for Editing
    const updateSubtask = (subtaskName, id) => {
        db.transaction(tx => {
            tx.executeSql('UPDATE subtasks SET name = ? WHERE id = ?;',
                [subtaskName, id]);
        }, null);
        setSubtaskName("");
        console.log("Updated", id);
    };

    //Saving a Subtask
    const saveSubtask = () => {
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO subtasks (taskid, name) VALUES (?, ?);',
                [selectedTask.id, subtaskName],
                (_, { insertId }) => {
                    console.log('Subtask inserted with ID: ', insertId);
                    updateSubtaskList(selectedTask);
                },
                (_, error) => {
                    console.error('Error inserting task:', error);
                }
            );
        });
    };

    //Handles pressing the "delete button" in the subtask menu
    const handleSubtaskDeletePress = (selectedTask, selectedSubtask) => {
        deleteSubtask(selectedSubtask.id);
        updateSubtaskList(selectedTask);
        setSubtaskMenuModal(false);
        setViewTaskModal(true)
    }

    //Handles updating a Subtask after it's edited
    const handleSubtaskUpdatePress = (subtaskName, selectedTask, selectedSubtask) => {
        updateSubtask(subtaskName, selectedSubtask.id);
        updateSubtaskList(selectedTask);
        setEditSubtaskModal(false);
        setViewTaskModal(true);
    }

    //Deleting subtasks
    const deleteSubtask = (id) => {
        db.transaction(
            tx => {
                tx.executeSql('DELETE FROM subtasks WHERE id = ?;', [id]);
            }, null);
    }

    //Updating subtask list
    const updateSubtaskList = (item) => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM subtasks WHERE taskid = ?;',
                [item.id],
                (_, { rows }) => {
                    setSubtasks(rows._array);
                },
                (_, error) => {
                    console.log('Error getting subtasks:', error);
                }
            );
        });
    };

    //Rendering the list of tasks
    const renderTasks = ({ item, index }) => {
        const changingColors = {
            backgroundColor: index % 2 === 0 ? '#ffeee8' : '#ffe8f3',
            fontSize: 20,
            paddingLeft: 10,
            paddingVertical: 8,
        }

        return (
            <View>
                <TouchableHighlight
                    underlayColor='mistyrose'
                    onPress={() => handleTaskViewPress(item)}
                    onLongPress={() => handleTaskMenuPress(item)}
                >
                    <Text style={changingColors}>{item.name}</Text>
                </TouchableHighlight>
            </View>
        )
    }

    //Rendering the list of subtasks
    const renderSubtasks = ({ item }) => (
        <View style={styles.subtasklist}>
            <TouchableHighlight
                underlayColor='mistyrose'
                onPress={() => handleSubtaskMenuPress(item)}
            >
                <Text style={styles.subtasklist}><Icon name='minimize'></Icon> {item.name}</Text>
            </TouchableHighlight>
        </View>
    )

    //Handling long presses on Tasks to open the menu
    const handleTaskMenuPress = (item) => {
        setSelectedTask(item);
        setTaskMenuModal(true);
    }

    //Handle long presses on Subtasks to open the menu
    const handleSubtaskMenuPress = (item) => {
        setSelectedSubtask(item);
        setSubtaskMenuModal(true);
    }

    //Handling quick presses to open the task, getting subtasks for said task
    const handleTaskViewPress = (item) => {
        setSelectedTask(item);
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM subtasks WHERE taskid = ?;',
                [item.id],
                (_, { rows }) => {
                    setSubtasks(rows._array);
                },
                (_, error) => {
                    console.log('Error getting subtasks:', error);
                }
            );
        });
        setViewTaskModal(true);
    };

    //Handling pressing the "Edit" button on tasks
    const handleTaskEditPress = (item) => {
        setTaskName(selectedTask.name);
        setEditTaskModal(true);
    }

    //Handling pressing the "Edit" button on subtasks
    const handleSubtaskEditPress = (item) => {
        setSubtaskName(selectedSubtask.name);
        setEditSubtaskModal(true);
    }

    return (
        <View style={styles.container}>
            {/*Flatlist for displaying tasks*/}
            <View style={{ flex: 1 }} >
                <FlatList
                    data={tasks}
                    renderItem={renderTasks}
                    keyExtractor={item => item.id.toString()}
                />
            </View>
            {/*Button for opening AddTaskModal*/}
            <View>
                <Button
                    raised
                    icon={{ name: 'add' }}
                    color='darkolivegreen'
                    style={styles.bottombutton}
                    title="ADD A TASK"
                    onPress={() => setAddTaskModal(true)}
                />
            </View>
            {/*Modal for Adding Tasks*/}
            <Modal
                animationType='slide'
                transparent={true}
                visible={addTaskModal}
            >
                <View style={styles.container}>
                    <View style={styles.menu}>
                        <Input placeholder='Name' label='NAME'
                            inputContainerStyle={{ borderColor: '#ffccec' }}
                            onChangeText={taskName => setTaskName(taskName)} value={taskName}
                        />
                        <View style={styles.rowbuttons}>
                            <Button raised icon={{ name: 'close' }}
                                color='firebrick'
                                onPress={() => {
                                    setTaskName("");
                                    setAddTaskModal(false);
                                }}
                                title="CANCEL"
                            />
                            <Button raised icon={{ name: 'save' }}
                                color='darkolivegreen'
                                onPress={() => {
                                    if (taskName) {
                                        saveTask();
                                        setTaskName("");
                                        setAddTaskModal(false);
                                    } else {
                                        Alert.alert("You cannot add an empty task.");
                                    }
                                }}
                                title="ADD"
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            {/*Modal for adding subtasks */}
            <Modal
                animationType='slide'
                transparent={true}
                visible={addSubtaskModal}
            >
                <View style={styles.container}>
                    <View style={styles.menu}>
                        <Input placeholder='Name' label='NAME'
                            inputContainerStyle={{ borderColor: '#ffccec' }}
                            onChangeText={subtaskName => setSubtaskName(subtaskName)} value={subtaskName}
                        />
                        <View style={styles.rowbuttons}>
                            <Button raised icon={{ name: 'close' }}
                                color='firebrick'
                                onPress={() => {
                                    setSubtaskName("");
                                    setAddSubtaskModal(false);
                                    setViewTaskModal(true);
                                }}
                                title="CANCEL"
                            />
                            <Button raised icon={{ name: 'save' }}
                                color='darkolivegreen'
                                onPress={() => {
                                    if (subtaskName) {
                                        saveSubtask();
                                        setSubtaskName("");
                                        setAddSubtaskModal(false);
                                        setViewTaskModal(true);
                                    } else {
                                        Alert.alert("You cannot add an empty subtask.");
                                    }
                                }}
                                title="ADD"
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            {/*Modal for opening tasks*/}
            <Modal
                animationType='slide'
                transparent={true}
                visible={viewTaskModal}
            >
                <View style={styles.container}>
                    <Text style={styles.viewtitle}>{selectedTask.name}</Text>
                    <FlatList
                        data={subtasks}
                        renderItem={renderSubtasks}
                        keyExtractor={item => item.id.toString()}
                    />
                    <Button
                        raised
                        style={styles.bottombutton}
                        icon={{ name: 'add-task' }}
                        title="ADD A SUBTASK"
                        color='darkolivegreen'
                        onPress={() => {
                            setAddSubtaskModal(true);
                        }}
                    />
                    <Button
                        raised
                        style={styles.bottombutton}
                        icon={{ name: 'arrow-back' }}
                        title="GO BACK"
                        color='firebrick'
                        onPress={() => setViewTaskModal(false)}
                    />
                </View>
            </Modal>
            {/*Modal for opening task menus*/}
            <Modal
                animationType='slide'
                transparent={true}
                visible={taskMenuModal}
            >
                <View style={styles.container}>
                    <View style={styles.menu}>
                        <Text style={styles.viewtitle}>{selectedTask.name}</Text>
                        <Text style={styles.edittextcontent}>What would you like to do with this task?</Text>
                        <View style={styles.rowbuttons} width='100%'>
                            <Button
                                raised
                                icon={{ name: 'arrow-back' }}
                                title="GO BACK"
                                color="darkolivegreen"
                                onPress={() => setTaskMenuModal(false)}
                            />
                            <Button
                                raised
                                icon={{ name: 'edit' }}
                                title="EDIT"
                                color="goldenrod"
                                onPress={() => handleTaskEditPress()}
                            />
                            <Button
                                raised
                                icon={{ name: 'delete' }}
                                title="DELETE"
                                color="firebrick"
                                onPress={() => {
                                    deleteTask(selectedTask.id);
                                    setTaskMenuModal(false);
                                }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            {/*Modal for opening subtask menus */}
            <Modal
                animationType='slide'
                transparent={true}
                visible={subtaskMenuModal}
            >
                <View style={styles.container}>
                    <View style={styles.menu}>
                        <Text style={styles.viewtitle}>{selectedSubtask.name}</Text>
                        <Text style={styles.edittextcontent}>What would you like to do with this subtask?</Text>
                        <View style={styles.rowbuttons} width='100%'>
                            <Button
                                raised
                                icon={{ name: 'arrow-back' }}
                                title="GO BACK"
                                color="darkolivegreen"
                                onPress={() => {
                                    setViewTaskModal(true)
                                    setSubtaskMenuModal(false)
                                }}
                            />
                            <Button
                                raised
                                icon={{ name: 'edit' }}
                                title="EDIT"
                                color="goldenrod"
                                onPress={() => handleSubtaskEditPress()}
                            />
                            <Button
                                raised
                                icon={{ name: 'delete' }}
                                title="DELETE"
                                color="firebrick"
                                onPress={() => handleSubtaskDeletePress(selectedTask, selectedSubtask)}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            {/*Task Editing Modal*/}
            <Modal
                animationType='slide'
                visible={editTaskModal}
            >
                <View style={styles.container}>
                    <View style={styles.menu}>
                        <Input placeholder='Name' label='NAME'
                            inputContainerStyle={{ borderColor: '#ffccec' }}
                            onChangeText={taskName => setTaskName(taskName)} value={taskName}
                        />
                        <View style={styles.rowbuttons}>
                            <Button
                                raised
                                icon={{ name: 'close' }}
                                color='firebrick'
                                title="CANCEL"
                                onPress={() => {
                                    setTaskName("");
                                    setEditTaskModal(false)
                                }}
                            />
                            <Button
                                raised
                                icon={{ name: 'edit' }}
                                color='goldenrod'
                                title="EDIT"
                                onPress={() => {
                                    setTaskMenuModal(false);
                                    setEditTaskModal(false);
                                    updateTask(selectedTask.id);
                                }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            {/*Subtask Editing Modal*/}
            <Modal
                animationType='slide'
                transparent={true}
                visible={editSubtaskModal}
            >
                <View style={styles.container}>
                    <View style={styles.menu}>
                        <Input placeholder='Name' label='NAME'
                            inputContainerStyle={{ borderColor: '#ffccec' }}
                            onChangeText={subtaskName => setSubtaskName(subtaskName)} value={subtaskName}
                        />
                        <View style={styles.rowbuttons}>
                            <Button
                                raised
                                icon={{ name: 'close' }}
                                color='firebrick'
                                title="CANCEL"
                                onPress={() => {
                                    setSubtaskName("");
                                    setEditSubtaskModal(false);
                                }}
                            />
                            <Button
                                raised
                                icon={{ name: 'edit' }}
                                color='goldenrod'
                                title="EDIT"
                                onPress={() => handleSubtaskUpdatePress(subtaskName, selectedTask, selectedSubtask)}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View >
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
        flex: 2,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'absolute',
    },

    tasklist: {
        fontSize: 20,
        width: '100%',
        height: 60,
        borderBottomWidth: 1,
        borderColor: 'black',
    },

    edittextcontent: {
        fontSize: 18,
        marginVertical: 20,
    },

    subtasklist: {
        width: '100',
        fontSize: 18,
        paddingVertical: 10,
    },
})