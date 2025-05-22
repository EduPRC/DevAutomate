import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Feather';

const API_URL = 'https://682e5470746f8ca4a47ca36f.mockapi.io/comments'; // Endpoint de comentários

export default function CrudComments() {
  const [comentarios, setComentarios] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [comentario, setComentario] = useState('');
  const [avaliacao, setAvaliacao] = useState('');
  const [tutorialId, setTutorialId] = useState('');
  const [editingComentario, setEditingComentario] = useState(null);

  useEffect(() => {
    buscarComentarios();
  }, []);

  const buscarComentarios = async () => {
    try {
      const response = await axios.get(API_URL);
      setComentarios(response.data);
    } catch (error) {
      console.error('Erro ao buscar comentários', error);
      alert('Nenhum comentário encontrado');
    }
  };

  const handleCreate = async () => {
    try {
      const novoComentario = { nomeUsuario, comentario, avaliacao, tutorialId };
      await axios.post(API_URL, novoComentario);
      buscarComentarios();
      setNomeUsuario('');
      setComentario('');
      setAvaliacao('');
      setTutorialId('');
    } catch (error) {
      console.error('Erro ao criar comentário', error);
    }
  };

  const handleCarregar = (comentarioSelecionado) => {
    setNomeUsuario(comentarioSelecionado.nomeUsuario);
    setComentario(comentarioSelecionado.comentario);
    setAvaliacao(comentarioSelecionado.avaliacao);
    setTutorialId(comentarioSelecionado.tutorialId);
    setEditingComentario(comentarioSelecionado);
  };

  const handleUpdate = async () => {
    try {
      const comentarioAtualizado = { nomeUsuario, comentario, avaliacao, tutorialId };
      await axios.put(`${API_URL}/${editingComentario.id}`, comentarioAtualizado);
      buscarComentarios();
      alert('Dados do comentario alterados com sucesso')
      setNomeUsuario('');
      setComentario('');
      setAvaliacao('');
      setTutorialId('');
      setEditingComentario(null);
    } catch (error) {
      console.error('Erro ao atualizar comentário', error);
    }
  };

  const handleDelete = async (comentarioId) => {
    try {
      await axios.delete(`${API_URL}/${comentarioId}`);
      buscarComentarios();
    } catch (error) {
      console.error('Erro ao deletar comentário', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comentários de Tutoriais</Text>

      <TextInput
        value={nomeUsuario}
        onChangeText={setNomeUsuario}
        placeholder="Nome do Usuário"
        style={styles.input}
      />
      <TextInput
        value={comentario}
        onChangeText={setComentario}
        placeholder="Comentário"
        style={styles.input}
      />
      <TextInput
        value={avaliacao}
        onChangeText={setAvaliacao}
        placeholder="Avaliação (1-5)"
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        value={tutorialId}
        onChangeText={setTutorialId}
        placeholder="ID do Tutorial"
        style={styles.input}
      />

      <Button
        title={editingComentario ? 'Atualizar Comentário' : 'Adicionar Comentário'}
        onPress={editingComentario ? handleUpdate : handleCreate}
        color="#007AFF"
      />

      <FlatList
        data={comentarios}
        keyExtractor={(item) => item.id.toString()}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>Usuário: {item.nomeUsuario}</Text>
              <Text style={styles.userEmail}>Comentário: {item.comentario}</Text>
              <Text style={styles.userEmail}>Avaliação: {item.avaliacao}</Text>
            </View>
            <TouchableOpacity onPress={() => handleCarregar(item)} style={styles.iconButton}>
              <Icon name="edit" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton}>
              <Icon name="trash-2" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#555',
  },
  iconButton: {
    padding: 6,
    marginLeft: 10,
  },
});
