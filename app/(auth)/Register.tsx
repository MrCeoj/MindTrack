import React, { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  StyleSheet,
  View,
  Button,
  Switch,
  Image,
  ScrollView,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import profilesData from "../data/profiles.json";
import careersData from "../data/carreras.json";
const logo = require("../../assets/images/Icon.png");

const sems = [
  { id: 2, name: "Semestre 2" },
  { id: 4, name: "Semestre 4" },
  { id: 6, name: "Semestre 6" },
];

interface Profile {
  id: string;
  name: string;
  surname: string;
  id_grupos: string[];
  matr: string;
  tutor_name: string | null;
  contact: string;
  curp: string;
  rfc: string | null;
  docs_ids: string[];
  email: string;
  career_id: string | null;
  semester: number | null;
  is_teacher: boolean;
}

export default function Register() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [matr, setMatr] = useState("");
  const [tutor_name, setTutorName] = useState<string | null>(null);
  const [contact, setContact] = useState("");
  const [curp, setCurp] = useState("");
  const [rfc, setRfc] = useState("");
  const [career_id, setCareerId] = useState<string | null>("");
  const [semester, setSemester] = useState<number | null>(null);
  const [is_teacher, setIsTeacher] = useState(false);
  const [message, setMessage] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    if (is_teacher) {
      setRfc("");
    } else {
      setTutorName("");
      setCareerId("");
      setSemester(0);
    }
  }, [is_teacher]);

  const checkFile = async () => {
    const filePath = FileSystem.documentDirectory + "profiles.json";
    const response = await FileSystem.getInfoAsync(filePath);
  
    if (!response.exists) {
      console.log("Archivo no encontrado, creando uno nuevo...");
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify({ profiles: profilesData.profiles }, null, 2));
      setProfiles(profilesData.profiles); // Initialize state with default profiles
    } else {
      const jsonString = await FileSystem.readAsStringAsync(filePath);
      const jsonData = JSON.parse(jsonString);
      setProfiles(jsonData.profiles); // Load existing profiles
    }
  };
  

  const handleRegister = async () => {
    await checkFile(); // Ensure data is loaded correctly before proceeding
  
    let tempProfiles = profiles.length === 0 ? profilesData.profiles : profiles;
  
    const profile = tempProfiles.find(
      (profile) => profile.email === email || profile.matr === matr
    );
  
    if (profile) {
      console.log("Correo o matrícula ya registrados");
      setMessage("Correo o matrícula ya registrados");
    } else {
      console.log("Usuario registrado");
      setMessage("Usuario registrado");
  
      const newProfile = {
        id: (tempProfiles.length + 1).toString(),
        name,
        surname,
        email,
        matr,
        id_grupos: [],
        tutor_name,
        contact,
        curp,
        rfc,
        docs_ids: [],
        career_id,
        semester,
        is_teacher,
      };
  
      tempProfiles.push(newProfile);
  
      await writeJsonToFile(tempProfiles);  // Pass updated profiles here
      AsyncStorage.clear();
      AsyncStorage.setItem("profile", JSON.stringify(newProfile));
      router.replace("../(tabs)/Home");
    }
  };
  

  const writeJsonToFile = async (tempProfiles: Profile[]) => {
    try {
      // Convert updated profiles to JSON string
      const jsonString = JSON.stringify({ profiles: tempProfiles }, null, 2);
  
      // Define file path in app's document directory
      const filePath = FileSystem.documentDirectory + "profiles.json";
  
      // Write to file
      await FileSystem.writeAsStringAsync(filePath, jsonString);
  
      console.log("JSON file written successfully to:", filePath);
    } catch (error) {
      console.error("Error writing JSON file:", error);
    }
  };
  

  return (
    <ScrollView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          position: "absolute",
          top: 43,
          right: 10,
          zIndex: 100,
          backgroundColor: "#2F031A",
        }}
      >
        <Text style={{ color: "white" }}>¿Registrarse como alumno?</Text>
        <Switch
          trackColor={{ false: "darkgray", true: "lightcoral" }}
          thumbColor={"maroon"}
          value={is_teacher}
          onValueChange={setIsTeacher}
        />
      </View>
      <View style={styles.imageContainer}>
        <Image source={logo} style={styles.image} />
        <Text style={styles.title}>Registro</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        value={surname}
        onChangeText={setSurname}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="CURP"
        value={curp}
        onChangeText={setCurp}
      />
      <TextInput
        style={styles.input}
        placeholder="Matrícula"
        keyboardType="numeric"
        value={matr}
        onChangeText={setMatr}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="numeric"
        value={contact}
        onChangeText={setContact}
      />
      {!is_teacher ? (
        <TextInput
          style={styles.input}
          placeholder="RFC"
          value={rfc}
          onChangeText={setRfc}
        />
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nombre del tutor"
            value={tutor_name ?? ""}
            onChangeText={setTutorName}
          />
          <Dropdown
            style={styles.input}
            labelField={"name"}
            data={careersData.careers}
            value={career_id}
            valueField={"id"}
            onChange={(value) => setCareerId(value.id)}
            placeholder="Selecciona tu carrera"
          />
          <Dropdown
            style={styles.input}
            labelField={"name"}
            data={sems}
            value={semester}
            valueField={"id"}
            onChange={(value) => setSemester(value.id)}
            placeholder="Selecciona tu semestre"
          />
        </>
      )}
      <Button color={"#EA1465"} title="Registrarse" onPress={handleRegister} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#2F031A",
    padding: 20,
    elevation: 100,
    zIndex: 100,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 80,
  },
  image: {
    width: 80,
    height: 80,
    padding: 20,
    objectFit: "fill",
  },
  title: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 10,
    fontWeight: "bold",
    marginTop: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    alignSelf: "center",
    fontWeight: "bold",
    color: "lightgray",
  },
});
