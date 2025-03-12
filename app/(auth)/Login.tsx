import React, { useState, useEffect } from "react";
import { StyleSheet, View, TextInput, Button, Text, Image } from "react-native";
import { Link, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import profilesData from "@/app/data/profiles.json";
import * as FileSystem from "expo-file-system";
const Welcome = require("@/assets/images/Welcome.png");

interface Profile {
  id: string;
  name: string;
  surname: string;
  id_grupos: string[];
  matr: string;
  tutor_name: string | null;
  contact: string;
  curp: string;
  rfc: string;
  docs_ids: string[];
  career_id: string | null;
  email: string;
  semester: number | null;
  is_teacher: boolean;
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [matr, setMatr] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const readJsonFile = async () => {
    try {
      const response = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "profiles.json");
      console.log(response);
      if(!response.exists) {
        setProfiles(profilesData.profiles);
        console.log(profilesData.profiles);
        return;
      };
      console.log("Leyendo archivo JSON...");
      const filePath = FileSystem.documentDirectory + "profiles.json";
      const jsonString = await FileSystem.readAsStringAsync(filePath);
      const jsonData = JSON.parse(jsonString);
      setProfiles(jsonData.profiles);
      console.log(profiles)
    } catch (error) {
      console.error("Error reading JSON file:", error);
      return null;
    }
  };

  useEffect(() => {
    if(profiles.length) return;
    readJsonFile();
  }, [profiles]);

  const handleLogin = async () => {
    setLoading(true);
    setError(false);
    setMessage("");

    console.log("Iniciando sesión...");
    const profile = profiles.find(
      (profile: Profile) => profile.email === email && profile.matr === matr
    );

    console.log(profiles);

    if (profile) {
      setError(false);
      console.log("Inicio de sesión exitoso");
      AsyncStorage.setItem("profile", JSON.stringify(profile));
      router.replace("../(tabs)/Home");
    } else {
      console.log("Datos erróneos, por favor intenta de nuevo.");
      setError(true);
      setMessage("Datos erróneos, por favor intenta de nuevo.");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={Welcome} style={styles.image} />
      </View>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder="Ingrese su correo"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor={"#2F031A"}
        textAlignVertical="center"
      />
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder="Ingresa tu matricula"
        keyboardType="numeric"
        value={matr}
        onChangeText={setMatr}
        placeholderTextColor={"#2F031A"}
        textAlignVertical="center"
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Button
        title="Iniciar sesión"
        onPress={handleLogin}
        disabled={loading}
        color={"#EA1465"}
      />
      <Link style={styles.signup} href="/Register">
        ¿Sin cuenta? Regístrate
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#2F031A",
    padding: 20,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 310,
    height: 210,
    padding: 20,
    marginBottom: 20,
    objectFit: "fill",
  },
  input: {
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    marginBottom: 10,
    padding: 5,
    paddingLeft: 10,
    paddingEnd: 20,
  },
  inputError: {
    borderColor: "#000000",
    borderWidth: 3,
  },
  message: {
    marginBottom: 10,
    alignSelf: "center",
    fontSize: 16,
    color: "red",
  },
  button: {
    marginTop: 50,
  },
  signup: {
    alignSelf: "center",
    marginTop: 40,
    color: "#FFFFFF",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default Login;
