import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Feather';

const API_URL = 'https://682e5470746f8ca4a47ca36f.mockapi.io/comments';

export default function CrudComments() {
  const [comentarios, setComentarios] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [comentario, setComentario] = useState('');
  const [avaliacao, setAvaliacao] = useState('');
  const [tutorialId, setTutorialId] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [editingComentario, setEditingComentario] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [comentarioIdParaExcluir, setComentarioIdParaExcluir] = useState(null);

  const [errors, setErrors] = useState({});

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

  const validarFormulario = () => {
    const newErrors = {};

    if (!titulo || titulo.length < 3 || titulo.length > 20) {
      newErrors.titulo = 'Título deve ter entre 3 e 20 caracteres.';
    }

    if (!comentario || comentario.length < 3 || comentario.length > 100) {
      newErrors.comentario = 'Comentário deve ter entre 3 e 100 caracteres.';
    }

    const avaliacaoNum = parseInt(avaliacao);
    if (!avaliacao || isNaN(avaliacaoNum)) {
      newErrors.avaliacao = 'Avaliação deve ser um número entre 1 e 5.';
    } else if (avaliacaoNum < 1 || avaliacaoNum > 5) {
      newErrors.avaliacao = 'Avaliação será ajustada entre 1 e 5.';
    }

    const urlRegex = /^(https:\/\/.*\.(?:png|jpg|jpeg|gif|webp))|^data:image\/[a-zA-Z]+;base64,/;
    if (!imagemUrl || !urlRegex.test(imagemUrl)) {
      newErrors.imagemUrl = 'Imagem deve ser uma URL HTTPS válida ou base64.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetFormulario = () => {
    setTitulo('');
    setComentario('');
    setAvaliacao('');
    setTutorialId('');
    setImagemUrl('');
    setEditingComentario(null);
    setErrors({});
  };

  const handleCreateOrUpdate = async () => {
    if (!validarFormulario()) return;

    const avaliacaoCorrigida = Math.max(1, Math.min(5, parseInt(avaliacao)));

    const dados = {
      titulo: titulo,
      comentario,
      avaliacao: avaliacaoCorrigida.toString(),
      tutorialId,
      imagemUrl,
    };

    try {
      if (editingComentario) {
        await axios.put(`${API_URL}/${editingComentario.id}`, dados);
        alert('Comentário atualizado com sucesso');
      } else {
        await axios.post(API_URL, dados);
        alert('Comentário adicionado com sucesso');
      }
      buscarComentarios();
      resetFormulario();
    } catch (error) {
      console.error('Erro ao salvar comentário', error);
    }
  };

  const handleCarregar = (comentarioSelecionado) => {
    setTitulo(comentarioSelecionado.titulo);
    setComentario(comentarioSelecionado.comentario);
    setAvaliacao(comentarioSelecionado.avaliacao);
    setTutorialId(comentarioSelecionado.tutorialId);
    setImagemUrl(comentarioSelecionado.imagemUrl);
    setEditingComentario(comentarioSelecionado);
    setErrors({});
  };

  const confirmarExclusao = (comentarioId) => {
    setComentarioIdParaExcluir(comentarioId);
    setModalVisible(true);
  };

  const excluirComentario = async () => {
    try {
      await axios.delete(`${API_URL}/${comentarioIdParaExcluir}`);
      buscarComentarios();
      setModalVisible(false);
      setComentarioIdParaExcluir(null);
    } catch (error) {
      console.error('Erro ao deletar comentário', error);
    }
  };

  const selecionarImagem = async () => {
    let resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });

    if (!resultado.canceled && resultado.assets.length > 0) {
      const imagem = resultado.assets[0];
      setImagemUrl(imagem.uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comentários de Tutoriais</Text>

      <TextInput
        value={titulo}
        onChangeText={setTitulo}
        placeholder="Título"
        style={styles.input}
      />
      {errors.titulo && <Text style={styles.errorText}>{errors.titulo}</Text>}

      <TextInput
        value={comentario}
        onChangeText={setComentario}
        placeholder="Comentário"
        style={styles.input}
      />
      {errors.comentario && <Text style={styles.errorText}>{errors.comentario}</Text>}

      <TextInput
        value={avaliacao}
        onChangeText={setAvaliacao}
        placeholder="Avaliação (1-5)"
        style={styles.input}
        keyboardType="numeric"
      />
      {errors.avaliacao && <Text style={styles.errorText}>{errors.avaliacao}</Text>}

      <TextInput
        value={tutorialId}
        onChangeText={setTutorialId}
        placeholder="ID do Tutorial (opcional)"
        style={styles.input}
      />

      <TextInput
        value={imagemUrl}
        onChangeText={setImagemUrl}
        placeholder="URL da Imagem"
        style={styles.input}
      />
      <Button title="Selecionar imagem do dispositivo" onPress={selecionarImagem} />
      {errors.imagemUrl && <Text style={styles.errorText}>{errors.imagemUrl}</Text>}

      <View style={styles.buttonRow}>
        <Button
          title={editingComentario ? 'Atualizar Comentário' : 'Adicionar Comentário'}
          onPress={handleCreateOrUpdate}
          color="#007AFF"
        />
        {editingComentario && (
          <Button title="Cancelar Edição" color="#aaa" onPress={resetFormulario} />
        )}
      </View>

      <FlatList
        data={comentarios}
        keyExtractor={(item) => item.id.toString()}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Image source={{ uri: item.imagemUrl }} style={styles.userImage} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.userName}>Título: {item.titulo}</Text>
              <Text>Comentário: {item.comentario}</Text>
              <Text>Avaliação: {item.avaliacao}</Text>
              <Text>ID: {item.tutorialId}</Text>
            </View>
            <TouchableOpacity onPress={() => handleCarregar(item)} style={styles.iconButton}>
              <Icon name="edit" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmarExclusao(item.id)} style={styles.iconButton}>
              <Icon name="trash-2" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal de confirmação de exclusão */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirmar exclusão</Text>
            <Text>Deseja realmente excluir este item?</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={excluirComentario}
              >
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
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
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 6,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#aaa',
  },
  deleteButton: {
    backgroundColor: '#e53935',
  },
  buttonText: {
    color: '#fff',
  },
});
