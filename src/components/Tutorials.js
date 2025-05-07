import { View, StyleSheet, TouchableOpacity, Platform, ScrollView, Keyboard, ActivityIndicator, FlatList, Alert } from "react-native";
import { Card, Text, TextInput } from "react-native-paper";
import React, { useState, useEffect } from "react";
import { MaterialIcons, FontAwesome5, AntDesign, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import firebase from '../services/connectionFirebase';
import { useNavigation, useRoute } from '@react-navigation/native';

// Função para formatar data
const formatDate = (date) => {
  if (!date) return '';
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

// Componente DatePicker
const DatePicker = ({ value, onChange }) => {
  if (Platform.OS === 'web') {
    return (
      <input
        type="date"
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={(e) => onChange(new Date(e.target.value))}
        style={styles.webDateInput}
      />
    );
  } else {
    return (
      <TouchableOpacity 
        style={styles.dateInput}
        onPress={() => {
          const newDate = prompt('Digite a data (DD/MM/AAAA):', value ? formatDate(value) : '');
          if (newDate) {
            const [day, month, year] = newDate.split('/');
            onChange(new Date(year, month - 1, day));
          }
        }}>
        <Text style={styles.dateText}>{value ? formatDate(value) : 'Selecione uma data'}</Text>
      </TouchableOpacity>
    );
  }
};

export default function TutorialForm() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Estados do formulário
  const [nomeTutorial, setNomeTutorial] = useState("");
  const [descricaoTutorial, setDescricaoTutorial] = useState("");
  const [duracaoTutorial, setDuracaoTutorial] = useState("");
  const [dataPostagem, setDataPostagem] = useState(null);
  const [tipoTutorial, setTipoTutorial] = useState("");
  const [showTipoOptions, setShowTipoOptions] = useState(false);
  const [nomeTutorialError, setNomeTutorialError] = useState("");
  const [descricaoError, setDescricaoError] = useState("");
  const [duracaoError, setDuracaoError] = useState("");
  const [tipoTutorialError, setTipoTutorialError] = useState("");
  const [dataError, setDataError] = useState("");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [tutorials, setTutorials] = useState([]);
  const [isListMode, setIsListMode] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState(null);

  // Tipos de tutoriais disponíveis
  const tiposTutorial = [
    "Programação", 
    "Design", 
    "Marketing Digital", 
    "Banco de Dados",
    "DevOps",
    "Inteligência Artificial",
    "Mobile",
    "Cloud Computing"
  ];

  // Carrega dados do tutorial se estiver editando
  useEffect(() => {
    if (route.params?.tutorial) {
      const tutorial = route.params.tutorial;
      loadTutorialData(tutorial);
      setEditingTutorial(tutorial);
    }
  }, [route.params?.tutorial]);

  // Carrega tutoriais do Firebase
  useEffect(() => {
    loadTutorials();
  }, []);

  const loadTutorialData = (tutorial) => {
    setKey(tutorial.key);
    setNomeTutorial(tutorial.nome);
    setDescricaoTutorial(tutorial.descricao);
    setDuracaoTutorial(tutorial.duracao);
    setTipoTutorial(tutorial.tipo);
    
    if (tutorial.dataPostagem) {
      const [dia, mes, ano] = tutorial.dataPostagem.split('/');
      setDataPostagem(new Date(ano, mes - 1, dia));
    }
  };

  const loadTutorials = async () => {
    setLoading(true);
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        alert("Usuário não autenticado!");
        return;
      }

      const tutoriaisRef = firebase.database().ref('tutoriais').orderByChild('userId').equalTo(user.uid);
      tutoriaisRef.on('value', (snapshot) => {
        const tutoriais = [];
        snapshot.forEach((child) => {
          tutoriais.push({
            key: child.key,
            ...child.val()
          });
        });
        setTutorials(tutoriais);
        setLoading(false);
      });
    } catch (error) {
      alert('Erro ao carregar tutoriais: ' + error.message);
      setLoading(false);
    }
  };

  // Validação do formulário
  function validateForm() {
    let isValid = true;
    setNomeTutorialError("");
    setDescricaoError("");
    setDuracaoError("");
    setTipoTutorialError("");
    setDataError("");

    if (nomeTutorial.trim() === "" || nomeTutorial.trim().length < 3) {
      setNomeTutorialError("O nome do tutorial deve ter pelo menos 3 caracteres");
      isValid = false;
    }

    if (descricaoTutorial.trim() === "" || descricaoTutorial.trim().length < 10) {
      setDescricaoError("A descrição deve ter pelo menos 10 caracteres");
      isValid = false;
    }

    if (duracaoTutorial.trim() === "") {
      setDuracaoError("A duração é obrigatória");
      isValid = false;
    }

    if (!tipoTutorial) {
      setTipoTutorialError("O tipo de tutorial é obrigatório");
      isValid = false;
    }

    if (!dataPostagem) {
      setDataError("A data de postagem é obrigatória");
      isValid = false;
    }

    return isValid;
  }

  // Função para salvar ou atualizar tutorial no Firebase
  async function saveTutorial() {
    if (!validateForm()) return;

    const user = firebase.auth().currentUser;
    if (!user) {
      alert("Usuário não autenticado!");
      return;
    }

    const tutorialData = {
      nome: nomeTutorial,
      descricao: descricaoTutorial,
      duracao: duracaoTutorial,
      tipo: tipoTutorial,
      dataPostagem: formatDate(dataPostagem),
      userId: user.uid,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    };

    try {
      if (key) {
        // Atualizar tutorial existente
        await firebase.database().ref('tutoriais').child(key).update(tutorialData);
        alert('Tutorial atualizado com sucesso!');
      } else {
        // Criar novo tutorial
        const newTutorialRef = firebase.database().ref('tutoriais').push();
        await newTutorialRef.set(tutorialData);
        alert('Tutorial criado com sucesso!');
      }
      
      Keyboard.dismiss();
      clearFields();
      loadTutorials();
      setIsListMode(true);
    } catch (error) {
      alert('Erro ao salvar tutorial: ' + error.message);
    }
  }

  // Limpar campos do formulário
  function clearFields() {
    setNomeTutorial("");
    setDescricaoTutorial("");
    setDuracaoTutorial("");
    setDataPostagem(null);
    setTipoTutorial("");
    setKey("");
    setEditingTutorial(null);
  }

  // Selecionar tipo de tutorial
  function selectTipoTutorial(tipo) {
    setTipoTutorial(tipo);
    setTipoTutorialError("");
    setShowTipoOptions(false);
  }

  // Deletar tutorial
  const deleteTutorial = async (tutorialKey) => {
    try {
      await firebase.database().ref('tutoriais').child(tutorialKey).remove();
      alert('Tutorial deletado com sucesso!');
      loadTutorials();
    } catch (error) {
      alert('Erro ao deletar tutorial: ' + error.message);
    }
  };

  // Editar tutorial
  const editTutorial = (tutorial) => {
    loadTutorialData(tutorial);
    setEditingTutorial(tutorial);
    setIsListMode(false);
  };

  // Confirmar cancelamento
  const confirmCancel = () => {
    if (!hasChanges()) {
      setIsListMode(true);
      return;
    }

    Alert.alert(
      'Cancelar Edição',
      'Tem certeza que deseja descartar as alterações?',
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim', 
          onPress: () => {
            if (editingTutorial) {
              loadTutorialData(editingTutorial);
            } else {
              clearFields();
            }
            setIsListMode(true);
          }
        }
      ]
    );
  };

  // Verifica se houve alterações no formulário
  const hasChanges = () => {
    if (!editingTutorial && (nomeTutorial || descricaoTutorial || duracaoTutorial || tipoTutorial || dataPostagem)) {
      return true;
    }

    if (editingTutorial) {
      return (
        nomeTutorial !== editingTutorial.nome ||
        descricaoTutorial !== editingTutorial.descricao ||
        duracaoTutorial !== editingTutorial.duracao ||
        tipoTutorial !== editingTutorial.tipo ||
        formatDate(dataPostagem) !== editingTutorial.dataPostagem
      );
    }

    return false;
  };

  // Renderizar item da lista
  const renderItem = ({ item }) => (
    <Card style={styles.tutorialCard}>
      <Card.Content>
        <View style={styles.tutorialHeader}>
          <Text style={styles.tutorialTitle}>{item.nome}</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={() => editTutorial(item)}>
              <Feather name="edit" size={20} color="#4682B4" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTutorial(item.key)} style={{ marginLeft: 15 }}>
              <Feather name="trash-2" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.tutorialType}>{item.tipo}</Text>
        <Text style={styles.tutorialDescription}>{item.descricao}</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Feather name="clock" size={14} color="#666" />
            <Text style={styles.infoText}>{item.duracao}</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="calendar" size={14} color="#666" />
            <Text style={styles.infoText}>Postado em: {item.dataPostagem}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (isListMode) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Meus Tutoriais</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setIsListMode(false);
              clearFields();
            }}>
            <Feather name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4682B4" />
            <Text style={styles.loadingText}>Carregando tutoriais...</Text>
          </View>
        ) : tutorials.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="book-open" size={50} color="#4682B4" />
            <Text style={styles.emptyText}>Nenhum tutorial cadastrado</Text>
          </View>
        ) : (
          <FlatList
            data={tutorials}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            {key ? 'Editar Tutorial' : 'Novo Tutorial'}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={confirmCancel}>
            <Feather name="arrow-left" size={24} color="#4682B4" />
          </TouchableOpacity>
        </View>
        
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.inputContainer}>
              <MaterialIcons name="book" size={24} color="#4682B4" style={styles.icon} />
              <TextInput
                style={styles.input}
                mode="outlined"
                label="Nome do Tutorial"
                placeholder="Mínimo 3 caracteres"
                value={nomeTutorial}
                onChangeText={(text) => {
                  setNomeTutorial(text);
                  setNomeTutorialError("");
                }}
                error={!!nomeTutorialError}
              />
            </View>
            {nomeTutorialError ? <Text style={styles.errorText}>{nomeTutorialError}</Text> : null}

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="text-box-outline" size={24} color="#4682B4" style={styles.icon} />
              <TextInput
                style={styles.input}
                mode="outlined"
                label="Descrição do Tutorial"
                placeholder="Mínimo 10 caracteres"
                multiline={true}
                numberOfLines={4}
                value={descricaoTutorial}
                onChangeText={(text) => {
                  setDescricaoTutorial(text);
                  setDescricaoError("");
                }}
                error={!!descricaoError}
              />
            </View>
            {descricaoError ? <Text style={styles.errorText}>{descricaoError}</Text> : null}

            <View style={styles.inputContainer}>
              <Feather name="clock" size={24} color="#4682B4" style={styles.icon} />
              <TextInput
                style={styles.input}
                mode="outlined"
                label="Duração do Tutorial"
                placeholder="Ex: 10 minutos, 2 horas, etc."
                value={duracaoTutorial}
                onChangeText={(text) => {
                  setDuracaoTutorial(text);
                  setDuracaoError("");
                }}
                error={!!duracaoError}
              />
            </View>
            {duracaoError ? <Text style={styles.errorText}>{duracaoError}</Text> : null}

            <Text style={styles.dateLabel}>Data de Postagem</Text>
            <View style={styles.inputContainer}>
              <AntDesign name="calendar" size={24} color="#4682B4" style={styles.icon} />
              <DatePicker 
                value={dataPostagem}
                onChange={(date) => {
                  setDataPostagem(date);
                  setDataError("");
                }}
              />
            </View>
            {dataError ? <Text style={styles.errorText}>{dataError}</Text> : null}

            <View style={styles.inputContainer}>
              <FontAwesome5 name="tags" size={24} color="#4682B4" style={styles.icon} />
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowTipoOptions(!showTipoOptions)}>
                <Text style={styles.dropdownText}>
                  {tipoTutorial || "Selecione o Tipo de Tutorial"}
                </Text>
                <AntDesign name="down" size={16} color="#4682B4" />
              </TouchableOpacity>
            </View>
            
            {showTipoOptions && (
              <View style={styles.optionsContainer}>
                {tiposTutorial.map((tipo, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionItem}
                    onPress={() => selectTipoTutorial(tipo)}>
                    <Text style={styles.optionText}>{tipo}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {tipoTutorialError ? <Text style={styles.errorText}>{tipoTutorialError}</Text> : null}
          </Card.Content>
        </Card>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={saveTutorial}>
          <Text style={styles.submitText}>
            {key ? 'Atualizar Tutorial' : 'Salvar Tutorial'}
          </Text>
        </TouchableOpacity>

        {key && (
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: '#ff4444', marginTop: 10 }]}
            onPress={confirmCancel}>
            <Text style={styles.submitText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4682B4",
  },
  card: {
    marginBottom: 20,
    elevation: 4,
  },
  tutorialCard: {
    marginBottom: 15,
    elevation: 2,
    backgroundColor: '#FFF',
  },
  tutorialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tutorialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4682B4',
    flex: 1,
  },
  tutorialType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  tutorialDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  infoContainer: {
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 4,
    padding: 15,
    backgroundColor: "#f8f8f8",
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  webDateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 4,
    padding: 15,
    backgroundColor: '#f8f8f8',
    fontSize: 16,
    color: '#333',
    height: 50,
  },
  dropdownButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 4,
    padding: 15,
    backgroundColor: "#f8f8f8",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  optionsContainer: {
    marginLeft: 34,
    marginTop: -5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  optionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#4682B4",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 34,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#4682B4',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  addButton: {
    backgroundColor: '#4682B4',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});