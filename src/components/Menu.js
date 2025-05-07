import * as React from 'react';
import { Text, View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import ProjetoForm from './Projects';
import TutorialForm from './Tutorials';

function ProjetoScreen() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#4682B4" />
        <View style={styles.container}>
          <ProjetoForm />
        </View>
      </SafeAreaView>
    );
  }

function HomeScreen() {
    return (
<View style={styles.container}>
<Text></Text>
</View>
    );
}

function ListScreen() {
    return (
<View style={styles.container}>
<Text></Text>
</View>
    );
}

function APIScreen() {
    return (
<View style={styles.container}>
<Text></Text>
</View>
    );
}
const Tab = createBottomTabNavigator();
export default function Menu() {
    return (
<NavigationContainer>
<Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, size }) => {
                        let iconName;
                        switch (route.name) {
                            case 'Home':
                                iconName = 'home';
                                break;
                            case 'Listar':
                                iconName = 'list'; 
                                break;
                            case 'Projetos':
                                iconName = 'lightbulb-o';
                                break;
                            case 'Tutoriais':
                                iconName = 'book';
                                break;
                            case 'Ler API':
                                iconName = 'android';
                                break;
                            default:
                                iconName = '';
                                break;
                        }
                        return <Icon name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: '#0285a6',
                    tabBarInactiveTintColor: '#9ea2a3',
                    tabBarStyle: { height: 65 }, 
                    tabBarLabelStyle: { fontSize: 12 },
                    showLabel: true,
                })}
>
<Tab.Screen name="Home" component={HomeScreen} />
<Tab.Screen name="Listar" component={ListScreen} />
<Tab.Screen
                    name="Projetos"
                    component={ProjetoScreen}
                />
<Tab.Screen
                    name="Tutoriais"
                    component={TutorialForm}
                />
<Tab.Screen name="Ler API" component={APIScreen} />
</Tab.Navigator>
</NavigationContainer>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconTabRound: {
        width: 60,
        height: 90,
        borderRadius: 30,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#006400',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
      },
      container: {
        flex: 1,
        padding: 16,
      },
      headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 16,
        color: '#4682B4',
    }
});