//declaração de componentes a serem utilizados
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Card, Text, TextInput } from "react-native-paper";
import React, { useState } from "react";
import firebase from '../services/connectionFirebase';
import DevAutomateIcon from '../../assets/DevAutomate-icon.png';

export default function Login({ changeStatus }) {
  const [type, setType] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    if (type === 'login') {
      // Aqui fazemos o login
      const user = firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
          changeStatus(user.user.uid)
        })
        .catch((err) => {
          console.log(err);
          alert('Email ou senha não cadastrados!');
          return;
        })
    } else {
      // Aqui cadastramos o usuario
      const user = firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((user) => {
          changeStatus(user.user.uid)
        })
        .catch((err) => {
          console.log(err);
          alert('Erro ao Cadastrar!');
          return;
        })
    }
  }

  //tipo recebe padrão logado
  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={DevAutomateIcon} />
      <Card>
        <Card.Title title="" subtitle="" />
        <Card.Content>
          <Text variant="bodyMedium"></Text>
          <TextInput
            style={styles.label}
            mode="outlined"
            label="E-mail"
            value={email}
            onChangeText={(text) => setEmail(text)}
          />
          <TextInput
            style={styles.label}
            mode="outlined"
            label="Senha acima de 6 caracteres"
            secureTextEntry
            maxLength={30}
            value={password}
            onChangeText={(text) => setPassword(text)}
          />
        </Card.Content>
      </Card>
      <TouchableOpacity
        style={[
          styles.colorButton,
          { backgroundColor: type === 'login' ? '#4682B4' : '#FF0000' },
        ]}
        onPress={handleLogin}>
        <Text style={styles.loginText}>
          {type === 'login' ? 'Acessar' : 'Cadastrar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          setType((type) => (type === 'login' ? 'cadastrar' : 'login'))
        }>
        <Text style={{ textAlign: 'center' }}>
          {type === 'login' ? 'Criar uma conta' : 'Já possuo uma conta'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    textAlign: "center",
  },
  logo: {
    width: 400,
    height: 300,
    justifyContent: "center",
    alignSelf: "center",
  },
  label: {
    marginBottom: 10,
    color: "red",
  },
  loginText: {
    color: "#FFF",
    fontSize: 24,
  },
});