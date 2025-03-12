import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Button,
  ScrollView,
  AppState,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PieChart } from "react-native-chart-kit";
import { router } from "expo-router";
import {
  FaceFrownIcon,
  FaceSmileIcon,
  PowerIcon,
} from "react-native-heroicons/micro";
import * as DocumentPicker from "expo-document-picker";
import * as IntentLauncher from "expo-intent-launcher";
import * as FileSystem from "expo-file-system";

interface EmotionalStatus {
  id: string;
  student_id: string;
  date: string;
  status: "Bien" | "Mal";
}

interface Document {
  id: string;
  student_id: string;
  date: string;
  file_url: string;
  file_name: string;
}

interface Profile {
  id: string;
  name: string;
  surname: string;
  id_grupos: string[];
  matr: string;
  tutor_name: string;
  contact: string;
  curp: string;
  rfc: string;
  docs_ids: string[];
  email: string;
  career_id: string;
  semester: number;
  is_teacher: boolean;
}

export default function Perfil() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allStatus, setAllStatus] = useState<EmotionalStatus[]>([]);
  const [emotionalStatus, setEmotionalStatus] = useState<EmotionalStatus[]>([]);
  const today = new Date().toISOString().split("T")[0];
  const [documents, setDocuments] = useState<Document[]>([]);
  const appState = useRef(AppState.currentState);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("profile");
    router.replace("../(auth)/Login");
  };

  useEffect(() => {
    if (!profile) return;
    loadDocuments();
  }, [emotionalStatus, profile]);

  useEffect(() => {
    if (!profile) return;
    loadEmotionalStatus();
  }, [profile]);

  useEffect(() => {
    if (!allStatus.length) return;
    flterEmotional();
  }, [allStatus]);

  const loadEmotionalStatus = async () => {
    if (!profile) return;

    const filePath = FileSystem.documentDirectory + "emotional.json";

    const jsonString = await FileSystem.readAsStringAsync(filePath);
    console.log("JSON cargado:", jsonString);
    const jsonData = JSON.parse(jsonString);

    setAllStatus(jsonData.emotional);
    console.log("Todos los estados emocionales:", allStatus);
  };

  const flterEmotional = () => {
    if (!profile) return;
    let filtered = allStatus.filter(
      (entry: EmotionalStatus) => entry.student_id === profile.id
    );

    setEmotionalStatus(filtered);
    console.log("Estado emocional cargado:", filtered);
  };

  const handleStatusClick = async (status: "Bien" | "Mal") => {
    const existingEntry = emotionalStatus.find(
      (entry) => entry.date === today && entry.student_id === profile?.id
    );
    console.log("Entrada existente:", existingEntry);

    if (existingEntry) {
      Alert.alert("Atención", "Ya registraste tu estado de ánimo hoy.");
      return;
    }

    const newEntry: EmotionalStatus = {
      id: (emotionalStatus.length + 1).toString(),
      student_id: profile?.id || "",
      date: today,
      status: status,
    };

    const updatedStatus = [...emotionalStatus, newEntry];
    setEmotionalStatus(updatedStatus);

    console.log("Estado emocional actualizado:", updatedStatus);
    Alert.alert("¡Gracias por compartir!", "Registro guardado correctamente.");
  };

  // Load existing documents from JSON
  const loadDocuments = async () => {
    const filePath = FileSystem.documentDirectory + "documents.json";
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    console.log("🗂️ Ruta del archivo:", filePath);
    console.log("📂 ¿Existe el archivo?:", fileInfo.exists);

    if (fileInfo.exists) {
      const jsonString = await FileSystem.readAsStringAsync(filePath);
      console.log("📄 Contenido del archivo JSON:", jsonString);

      const jsonData = JSON.parse(jsonString);
      console.log("📋 Documentos cargados:", jsonData);

      const filtrado = jsonData.documents.filter(
        (doc: Document) => doc.student_id === profile?.id
      );

      console.log("🎯 Documentos filtrados:", filtrado);

      setDocuments(filtrado);
    } else {
      console.log("❌ `documents.json` no encontrado.");
    }
  };

  const handleDocumentPick = async () => {
    try {
      if (!profile) return;
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        Alert.alert("Cancelado", "No se seleccionó ningún documento.");
        return;
      }

      const document = result.assets[0];

      // Create a permanent copy of the file
      const fileName = document.name;
      const destinationUri = FileSystem.documentDirectory + fileName;

      await FileSystem.copyAsync({
        from: document.uri,
        to: destinationUri,
      });

      console.log("✅ Documento copiado en:", destinationUri);

      const newDocument: Document = {
        id: (documents.length + 1).toString(),
        student_id: profile.id,
        date: new Date().toISOString(),
        file_url: destinationUri,
        file_name: fileName,
      };

      const updatedDocuments = [...documents, newDocument];
      setDocuments(updatedDocuments);

      await saveDocuments(updatedDocuments);

      Alert.alert("Éxito", "Documento subido correctamente.");
    } catch (error) {
      console.error("❌ Error al seleccionar el documento:", error);
      Alert.alert("Error", "Hubo un problema al subir el documento.");
    }
  };

  const saveDocuments = async (updatedDocuments: Document[]) => {
    const filePath = FileSystem.documentDirectory + "documents.json";
    const jsonString = JSON.stringify({ documents: updatedDocuments }, null, 2);

    try {
      await FileSystem.writeAsStringAsync(filePath, jsonString);
      console.log("✅ Documentos guardados exitosamente en:", filePath);

      // Check file content immediately after saving
      const fileContent = await FileSystem.readAsStringAsync(filePath);
      console.log("📄 Archivo guardado con este contenido:", fileContent);
    } catch (error) {
      console.error("❌ Error al guardar documentos:", error);
    }
  };

  useEffect(() => {
    if (profile) return;
    getProfile();
  }, [profile]);

  const getProfile = async () => {
    const profile = await AsyncStorage.getItem("profile");
    if (!profile) return;
    setProfile(JSON.parse(profile));
  };

  const bienCount = emotionalStatus.filter(
    (entry) => entry.status === "Bien"
  ).length;
  const malCount = emotionalStatus.filter(
    (entry) => entry.status === "Mal"
  ).length;

  const pieData = [
    {
      name: "Bien",
      population: bienCount,
      color: "#4CAF50",
      legendFontColor: "#4CAF50",
      legendFontSize: 15,
    },
    {
      name: "Mal",
      population: malCount,
      color: "#F44336",
      legendFontColor: "#F44336",
      legendFontSize: 15,
    },
  ];

  const openDocument = async (doc: Document) => {
    if (appState.current !== "active") {
      Alert.alert("Error", "La aplicación no está en primer plano.");
      return;
    }

    try {
      const fileInfo = await FileSystem.getContentUriAsync(doc.file_url);
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: fileInfo,
        flags: 1,
        type: "application/pdf",
      });
    } catch (error) {
      console.error("Error opening document:", error);
      Alert.alert("Error", "An error occurred while opening the document.");
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <PowerIcon
        size={30}
        color="#2F031A"
        onPress={handleLogout}
        style={{ position: "absolute", top: 10, right: 20 }}
      />
      <Text style={styles.title}>
        {profile?.name} {profile?.surname}
      </Text>
      <Text>¿Cómo te sientes hoy?</Text>
      <View style={{ flexDirection: "row" }}>
        <FaceSmileIcon
          size={50}
          color="#4CAF50"
          onPress={() => handleStatusClick("Bien")}
        />
        <FaceFrownIcon
          size={50}
          color="#F44336"
          onPress={() => handleStatusClick("Mal")}
        />
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.subtitle}>Registros emocionales</Text>
        <PieChart
          data={pieData}
          width={350}
          height={250}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="40"
          center={[40, 0]}
          hasLegend={false}
        />
        <Text>
          ✅ Bien: {((bienCount * 100) / (bienCount + malCount)) | 0}%
        </Text>
        <Text>❌ Mal: {((malCount * 100) / (bienCount + malCount)) | 0}%</Text>
      </View>
      <ScrollView style={styles.cardContainer}>
        {documents.length === 0 ? (
          <Text>No documents available.</Text>
        ) : (
          documents.map((doc) => (
            <View key={doc.id} style={styles.card}>
              <Text style={styles.docTitle}>{doc.file_name}</Text>
              <Text style={styles.docDate}>
                {new Date(doc.date).toLocaleDateString()}
              </Text>
              <Text style={styles.docUrl} onPress={() => openDocument(doc)}>
                {doc.file_url}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
      <Button
        title="Subir evidencia médica"
        color="#4CAF50"
        onPress={handleDocumentPick}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9ffff",
    justifyContent: "center",
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  chartContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 20,
  },
  cardContainer: {
    marginTop: 20,
    height: "50%",
    overflow: "scroll",
  },
  card: {
    backgroundColor: "#ddd",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  docTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  docDate: {
    fontSize: 14,
    color: "#660022",
  },
  docUrl: {
    fontSize: 14,
    color: "#0000FF",
    fontStyle: "italic",
    textDecorationLine: "underline",
  },
});