import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Card, Text, TextInput } from "react-native-paper";
import React, { useState } from "react";
import firebase from '../services/connectionFirebase';
import DevAutomateIcon from '../../assets/DevAutomate-icon.png';

export default function Login({ changeStatus }) {
  const [type, setType] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function validateEmail(email) {
    if (!email.includes('@')) {
      setEmailError("Falta @ no email");
      return false;
    }
    if (!email.includes('.com')) {
      setEmailError("Falta .com no email");
      return false;
    }
    if (email !== email.toLowerCase()) {
      setEmailError("Email deve conter apenas letras minúsculas");
      return false;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePassword(password) {
    const specialChars = /[!@#$%^&*(),.?":{}|<>]/;
    const upperCase = /[A-Z]/;
    const lowerCase = /[a-z]/;
    const numbers = /[0-9]/;

    if (!specialChars.test(password)) {
      setPasswordError("A senha deve conter pelo menos um caractere especial");
      return false;
    }
    if (!upperCase.test(password)) {
      setPasswordError("A senha deve conter pelo menos uma letra maiúscula");
      return false;
    }
    if (!lowerCase.test(password)) {
      setPasswordError("A senha deve conter pelo menos uma letra minúscula");
      return false;
    }
    if (!numbers.test(password)) {
      setPasswordError("A senha deve conter pelo menos um número");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }
    return true;
  }

  function handleLogin() {
    if (!validateEmail(email)) {
      return;
    }

    if (!validatePassword(password)) {
      return;
    }

    if (type === 'login') {
      // Aqui fazemos o login
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
          changeStatus(user.user.uid);
        })
        .catch((err) => {
          console.log(err);
          if (err.code === 'auth/user-not-found') {
            setEmailError("Email não cadastrado");
          } else {
            alert('Email ou senha incorretos!');
          }
        });
    } else {
      // Aqui cadastramos o usuario
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((user) => {
          changeStatus(user.user.uid);
        })
        .catch((err) => {
          console.log(err);
          alert('Erro ao Cadastrar!');
        });
    }
  }

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
            onChangeText={(text) => {
              setEmail(text);
              setEmailError("");
            }}
            error={!!emailError}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          <TextInput
            style={styles.label}
            mode="outlined"
            label="Senha acima de 6 caracteres"
            secureTextEntry
            maxLength={30}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError("");
            }}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
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
        <Text style={styles.switchText}>
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
  colorButton: {
    width: '50%',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  loginText: {
    color: "#FFF",
    fontSize: 24,
    textAlign: 'center',
  },
  switchText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#4682B4',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
});