import { View, StyleSheet, Image, TouchableOpacity, Platform, ScrollView, Keyboard, ActivityIndicator, FlatList } from "react-native";
import { Card, Text, TextInput } from "react-native-paper";
import React, { useState, useEffect } from "react";
import { MaterialIcons, FontAwesome5, AntDesign, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import firebase from '../services/connectionFirebase';
import { useNavigation, useRoute } from '@react-navigation/native';

// Função para formatar data
function formatDate(date) {
  if (!date) return '';
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

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

export default function ProjetoForm() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Estados do formulário
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [descricaoProjeto, setDescricaoProjeto] = useState("");
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [tipoProjeto, setTipoProjeto] = useState("");
  const [showTipoOptions, setShowTipoOptions] = useState(false);
  const [nomeProjetoError, setNomeProjetoError] = useState("");
  const [descricaoError, setDescricaoError] = useState("");
  const [tipoProjetoError, setTipoProjetoError] = useState("");
  const [dataError, setDataError] = useState("");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isListMode, setIsListMode] = useState(false);

  // Tipos de projeto disponíveis
  const tiposProjeto = [
    "Desenvolvimento Web", 
    "Aplicativo Mobile", 
    "Design UX/UI", 
    "Automação",
    "Inteligência Artificial"
  ];

  // Carrega dados do projeto se estiver editando
  useEffect(() => {
    if (route.params?.projeto) {
      const projeto = route.params.projeto;
      setKey(projeto.key);
      setNomeProjeto(projeto.nome);
      setDescricaoProjeto(projeto.descricao);
      setTipoProjeto(projeto.tipo);
      
      // Converte strings de data para objetos Date
      if (projeto.dataInicio) {
        const [diaInicio, mesInicio, anoInicio] = projeto.dataInicio.split('/');
        setDataInicio(new Date(anoInicio, mesInicio - 1, diaInicio));
      }
      
      if (projeto.dataFim) {
        const [diaFim, mesFim, anoFim] = projeto.dataFim.split('/');
        setDataFim(new Date(anoFim, mesFim - 1, diaFim));
      }
    }
  }, [route.params?.projeto]);

  // Carrega projetos do Firebase
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        alert("Usuário não autenticado!");
        return;
      }

      const projetosRef = firebase.database().ref('projetos').orderByChild('userId').equalTo(user.uid);
      projetosRef.on('value', (snapshot) => {
        const projetos = [];
        snapshot.forEach((child) => {
          projetos.push({
            key: child.key,
            ...child.val()
          });
        });
        setProjects(projetos);
        setLoading(false);
      });
    } catch (error) {
      alert('Erro ao carregar projetos: ' + error.message);
      setLoading(false);
    }
  };

  // Validação do formulário
  function validateForm() {
    let isValid = true;
    setNomeProjetoError("");
    setDescricaoError("");
    setTipoProjetoError("");
    setDataError("");

    if (nomeProjeto.trim() === "" || nomeProjeto.trim().length < 3) {
      setNomeProjetoError("O nome do projeto deve ter pelo menos 3 caracteres");
      isValid = false;
    }

    if (descricaoProjeto.trim() === "" || descricaoProjeto.trim().length < 10) {
      setDescricaoError("A descrição deve ter pelo menos 10 caracteres");
      isValid = false;
    }

    if (!tipoProjeto) {
      setTipoProjetoError("O tipo de projeto é obrigatório");
      isValid = false;
    }

    if (!dataInicio || !dataFim) {
      setDataError("As datas são obrigatórias");
      isValid = false;
    } else if (dataInicio > dataFim) {
      setDataError("A data de início não pode ser posterior à data de finalização");
      isValid = false;
    }

    return isValid;
  }

  // Função para salvar ou atualizar projeto no Firebase
  async function saveProject() {
    if (!validateForm()) return;

    const user = firebase.auth().currentUser;
    if (!user) {
      alert("Usuário não autenticado!");
      return;
    }

    const projetoData = {
      nome: nomeProjeto,
      descricao: descricaoProjeto,
      tipo: tipoProjeto,
      dataInicio: formatDate(dataInicio),
      dataFim: formatDate(dataFim),
      userId: user.uid,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    };

    try {
      if (key) {
        // Atualizar projeto existente
        await firebase.database().ref('projetos').child(key).update(projetoData);
        alert('Projeto atualizado com sucesso!');
      } else {
        // Criar novo projeto
        const newProjectRef = firebase.database().ref('projetos').push();
        await newProjectRef.set(projetoData);
        alert('Projeto criado com sucesso!');
      }
      
      Keyboard.dismiss();
      clearFields();
      loadProjects();
      setIsListMode(true);
    } catch (error) {
      alert('Erro ao salvar projeto: ' + error.message);
    }
  }

  // Limpar campos do formulário
  function clearFields() {
    setNomeProjeto("");
    setDescricaoProjeto("");
    setDataInicio(null);
    setDataFim(null);
    setTipoProjeto("");
    setKey("");
  }

  // Selecionar tipo de projeto
  function selectTipoProjeto(tipo) {
    setTipoProjeto(tipo);
    setTipoProjetoError("");
    setShowTipoOptions(false);
  }

  // Deletar projeto
  const deleteProject = async (projectKey) => {
    try {
      await firebase.database().ref('projetos').child(projectKey).remove();
      alert('Projeto deletado com sucesso!');
      loadProjects();
    } catch (error) {
      alert('Erro ao deletar projeto: ' + error.message);
    }
  };

  // Editar projeto
  const editProject = (project) => {
    navigation.navigate('Projetos', { projeto: project });
    setIsListMode(false);
  };

  // Renderizar item da lista
  const renderItem = ({ item }) => (
    <Card style={styles.projectCard}>
      <Card.Content>
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>{item.nome}</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={() => editProject(item)}>
              <Feather name="edit" size={20} color="#4682B4" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteProject(item.key)} style={{ marginLeft: 15 }}>
              <Feather name="trash-2" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.projectType}>{item.tipo}</Text>
        <Text style={styles.projectDescription}>{item.descricao}</Text>
        <View style={styles.datesContainer}>
          <Text style={styles.dateText}>Início: {item.dataInicio}</Text>
          <Text style={styles.dateText}>Fim: {item.dataFim}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (isListMode) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Meus Projetos</Text>
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
            <Text style={styles.loadingText}>Carregando projetos...</Text>
          </View>
        ) : projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="folder" size={50} color="#4682B4" />
            <Text style={styles.emptyText}>Nenhum projeto cadastrado</Text>
          </View>
        ) : (
          <FlatList
            data={projects}
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
            {key ? 'Editar Projeto' : 'Novo Projeto'}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setIsListMode(true)}>
            <Feather name="arrow-left" size={24} color="#4682B4" />
          </TouchableOpacity>
        </View>
        
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.inputContainer}>
              <MaterialIcons name="assignment" size={24} color="#4682B4" style={styles.icon} />
              <TextInput
                style={styles.input}
                mode="outlined"
                label="Nome do Projeto"
                placeholder="Mínimo 3 caracteres"
                value={nomeProjeto}
                onChangeText={(text) => {
                  setNomeProjeto(text);
                  setNomeProjetoError("");
                }}
                error={!!nomeProjetoError}
              />
            </View>
            {nomeProjetoError ? <Text style={styles.errorText}>{nomeProjetoError}</Text> : null}

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="text-box-outline" size={24} color="#4682B4" style={styles.icon} />
              <TextInput
                style={styles.input}
                mode="outlined"
                label="Descrição do Projeto"
                placeholder="Mínimo 10 caracteres"
                multiline={true}
                numberOfLines={4}
                value={descricaoProjeto}
                onChangeText={(text) => {
                  setDescricaoProjeto(text);
                  setDescricaoError("");
                }}
                error={!!descricaoError}
              />
            </View>
            {descricaoError ? <Text style={styles.errorText}>{descricaoError}</Text> : null}

            <Text style={styles.dateLabel}>Data de Início</Text>
            <View style={styles.inputContainer}>
              <AntDesign name="calendar" size={24} color="#4682B4" style={styles.icon} />
              <DatePicker 
                value={dataInicio}
                onChange={(date) => {
                  setDataInicio(date);
                  setDataError("");
                }}
              />
            </View>
            
            <Text style={styles.dateLabel}>Data de Fim</Text>
            <View style={styles.inputContainer}>
              <AntDesign name="calendar" size={24} color="#4682B4" style={styles.icon} />
              <DatePicker 
                value={dataFim}
                onChange={(date) => {
                  setDataFim(date);
                  setDataError("");
                }}
              />
            </View>
            
            {dataError ? <Text style={styles.errorText}>{dataError}</Text> : null}

            <View style={styles.inputContainer}>
              <FontAwesome5 name="project-diagram" size={24} color="#4682B4" style={styles.icon} />
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowTipoOptions(!showTipoOptions)}>
                <Text style={styles.dropdownText}>
                  {tipoProjeto || "Selecione o Tipo de Projeto"}
                </Text>
                <AntDesign name="down" size={16} color="#4682B4" />
              </TouchableOpacity>
            </View>
            
            {showTipoOptions && (
              <View style={styles.optionsContainer}>
                {tiposProjeto.map((tipo, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionItem}
                    onPress={() => selectTipoProjeto(tipo)}>
                    <Text style={styles.optionText}>{tipo}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {tipoProjetoError ? <Text style={styles.errorText}>{tipoProjetoError}</Text> : null}
          </Card.Content>
        </Card>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={saveProject}>
          <Text style={styles.submitText}>
            {key ? 'Atualizar Projeto' : 'Salvar Projeto'}
          </Text>
        </TouchableOpacity>

        {key && (
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: '#ff4444', marginTop: 10 }]}
            onPress={() => {
              clearFields();
              setIsListMode(true);
            }}>
            <Text style={styles.submitText}>Cancelar Edição</Text>
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
  projectCard: {
    marginBottom: 15,
    elevation: 2,
    backgroundColor: '#FFF',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4682B4',
    flex: 1,
  },
  projectType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  projectDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
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