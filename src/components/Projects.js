import { View, StyleSheet, Image, TouchableOpacity, Platform, ScrollView } from "react-native";
import { Card, Text, TextInput } from "react-native-paper";
import React, { useState } from "react";
import { MaterialIcons, FontAwesome5, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

// Função formatDate movida para fora do componente
function formatDate(date) {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

// Componente DatePicker ajustado
const DatePicker = ({ value, onChange }) => {
  if (Platform.OS === 'web') {
    return (
      <input
        type="date"
        value={value.toISOString().split('T')[0]}
        onChange={(e) => onChange(new Date(e.target.value))}
        style={styles.webDateInput}
      />
    );
  } else {
    return (
      <TouchableOpacity 
        style={styles.dateInput}
        onPress={() => {
          const newDate = prompt('Digite a data (DD/MM/AAAA):', formatDate(value));
          if (newDate) {
            const [day, month, year] = newDate.split('/');
            onChange(new Date(year, month - 1, day));
          }
        }}>
        <Text style={styles.dateText}>{formatDate(value)}</Text>
      </TouchableOpacity>
    );
  }
};

export default function ProjetoForm() {
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [descricaoProjeto, setDescricaoProjeto] = useState("");
  const [dataInicio, setDataInicio] = useState(new Date());
  const [dataFim, setDataFim] = useState(new Date());
  const [tipoProjeto, setTipoProjeto] = useState("");
  const [showTipoOptions, setShowTipoOptions] = useState(false);
  const [nomeProjetoError, setNomeProjetoError] = useState("");
  const [descricaoError, setDescricaoError] = useState("");
  const [tipoProjetoError, setTipoProjetoError] = useState("");
  const [dataError, setDataError] = useState("");

  const tiposProjeto = [
    "Desenvolvimento Web", 
    "Aplicativo Mobile", 
    "Design UX/UI", 
    "Automação",
    "Inteligência Artificial"
  ];

  function validateForm() {
    let isValid = true;

    if (nomeProjeto.trim() === "" || nomeProjeto.trim().length < 3) {
      setNomeProjetoError("O nome do projeto deve ter pelo menos 3 caracteres");
      isValid = false;
    }

    if (descricaoProjeto.trim() === "" || descricaoProjeto.trim().length < 10) {
      setDescricaoError("A descrição deve ter pelo menos 10 caracteres");
      isValid = false;
    }

    if (tipoProjeto === "") {
      setTipoProjetoError("O tipo de projeto é obrigatório");
      isValid = false;
    }

    if (dataInicio > dataFim) {
      setDataError("A data de início não pode ser posterior à data de finalização");
      isValid = false;
    }

    return isValid;
  }

  function handleSubmit() {
    if (validateForm()) {
      const projetoData = {
        nome: nomeProjeto,
        descricao: descricaoProjeto,
        dataInicio: formatDate(dataInicio),
        dataFim: formatDate(dataFim),
        tipo: tipoProjeto
      };
      
      console.log("Dados do projeto:", projetoData);
      alert(`Projeto "${nomeProjeto}" agendado com sucesso!`);
      
      setNomeProjeto("");
      setDescricaoProjeto("");
      setDataInicio(new Date());
      setDataFim(new Date());
      setTipoProjeto("");
    }
  }

  function selectTipoProjeto(tipo) {
    setTipoProjeto(tipo);
    setTipoProjetoError("");
    setShowTipoOptions(false);
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Agendamento de Projeto</Text>
        
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
                  {tipoProjeto === "" ? "Selecione o Tipo de Projeto" : tipoProjeto}
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
          onPress={handleSubmit}>
          <Text style={styles.submitText}>Agendar Projeto</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#4682B4",
    marginBottom: 20,
  },
  card: {
    marginBottom: 20,
    elevation: 4,
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
  dateText: {
    fontSize: 16,
    color: "#333",
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
});