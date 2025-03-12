import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { CheckBadgeIcon } from "react-native-heroicons/micro";
const grupos = require("../data/grupos.json");
const materias = require("../data/materias.json");
const inscripciones = require("../data/inscripciones.json");
const profilesData = require("../data/profiles.json");
const califs = require("../data/califs.json");
const docs = require("../data/docs.json");
const emotional = require("../data/emotional.json");

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

interface Grupo {
  id: string;
  subject_id: string;
  teacher_id: string;
  schedule: number;
}

interface Subject {
  id: string;
  name: string;
  career_id: string;
  semester: number;
}

interface Enrollment {
  id: string;
  student_id: string;
  group_id: string;
}

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [gruposDisp, setGruposDisp] = useState<Grupo[]>([]);
  const [gruposInsc, setGruposInsc] = useState<Grupo[]>([]);
  const [materiasDisp, setMateriasDisp] = useState<Subject[]>([]);
  const [inscripcionesDisp, setInscripcionesDisp] = useState<Enrollment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    if (profile) return;
    getProfile();
    checkFiles();
  }, [profile]);

  const getProfile = async () => {
    const profile = await AsyncStorage.getItem("profile");
    if (!profile) return;
    setProfile(JSON.parse(profile));
  };

  const checkFiles = async () => {
    const profilesFilePath = FileSystem.documentDirectory + "profiles.json";
    const califsFilePath = FileSystem.documentDirectory + "califs.json";
    const docsFilePath = FileSystem.documentDirectory + "docs.json";
    const emotionalFilePath = FileSystem.documentDirectory + "emotional.json";
    const gruposFilePath = FileSystem.documentDirectory + "grupos.json";
    const inscripcionesFilePath =
      FileSystem.documentDirectory + "inscripciones.json";
    const materiasFilePath = FileSystem.documentDirectory + "materias.json";

    let response = await FileSystem.getInfoAsync(profilesFilePath);

    if (!response.exists) {
      console.log("Perfiles no encontrado, creando uno nuevo...");
      await FileSystem.writeAsStringAsync(
        profilesFilePath,
        JSON.stringify({ profiles: profilesData.profiles }, null, 2)
      );
    }

    response = await FileSystem.getInfoAsync(califsFilePath);
    if (!response.exists) {
      console.log("Calificaciones no encontradas, creando uno nuevo...");
      await FileSystem.writeAsStringAsync(
        califsFilePath,
        JSON.stringify({ califs: califs.califs }, null, 2)
      );
    }

    response = await FileSystem.getInfoAsync(docsFilePath);
    if (!response.exists) {
      console.log("Documentos no encontrados, creando uno nuevo...");
      await FileSystem.writeAsStringAsync(
        docsFilePath,
        JSON.stringify({ docs: docs.docs }, null, 2)
      );
    }

    response = await FileSystem.getInfoAsync(emotionalFilePath);
    if (!response.exists) {
      console.log("Emocional no encontrado, creando uno nuevo...");
      let emotionalData = { emotional: emotional.emotional_status };
      console.log(emotionalData);
      await FileSystem.writeAsStringAsync(
        emotionalFilePath,
        JSON.stringify(emotionalData, null, 2)
      );
    }

    response = await FileSystem.getInfoAsync(gruposFilePath);
    if (!response.exists) {
      console.log("Grupos no encontrados, creando uno nuevo...");
      await FileSystem.writeAsStringAsync(
        gruposFilePath,
        JSON.stringify({ grupos: grupos.grupos }, null, 2)
      );
    }

    response = await FileSystem.getInfoAsync(inscripcionesFilePath);
    if (!response.exists) {
      console.log("Inscripciones no encontradas, creando uno nuevo...");
      await FileSystem.writeAsStringAsync(
        inscripcionesFilePath,
        JSON.stringify({ inscripciones: inscripciones.inscripciones }, null, 2)
      );
    }

    response = await FileSystem.getInfoAsync(materiasFilePath);
    if (!response.exists) {
      console.log("Materias no encontradas, creando uno nuevo...");
      await FileSystem.writeAsStringAsync(
        materiasFilePath,
        JSON.stringify({ materias: materias.materias }, null, 2)
      );
    }
  };

  useEffect(() => {
    if (profile) return;
    getProfile();
    checkFile();
  }, [profile]);

  useEffect(() => {
    getMaterias();
    checkFile();
  }, [profile]);

  useEffect(() => {
    getGrupos();
  }, [materiasDisp]);

  useEffect(() => {
    if (profile && materiasDisp.length > 0) {
      getInscripciones();
    }
  }, [profile, materiasDisp]);

  const checkFile = async () => {
    const filePath = FileSystem.documentDirectory + "profiles.json";

    const jsonString = await FileSystem.readAsStringAsync(filePath);
    const jsonData = JSON.parse(jsonString);
    setProfiles(jsonData.profiles);
    console.log(jsonData);
  };

  const getMaterias = () => {
    if (!profile) return;

    if (profile.is_teacher) return;

    const subjects = materias.subjects.filter(
      (materia: Subject) =>
        materia.career_id === profile.career_id &&
        materia.semester === profile.semester
    );

    setMateriasDisp(subjects);
  };

  const getGrupos = () => {
    if (profile?.is_teacher) {
      const mygroups = grupos.groups.filter(
        (grupo: Grupo) => grupo.teacher_id === profile?.id
      );
      setGruposDisp(mygroups);
      return;
    }

    const enrolledGroupIds = inscripciones.enrollments
      .filter(
        (inscripcion: Enrollment) => inscripcion.student_id === profile?.id
      )
      .map((inscripcion: Enrollment) => inscripcion.group_id);

    const gruposDis: Grupo[] = grupos.groups.filter(
      (grupo: Grupo) =>
        materiasDisp.find(
          (materia: Subject) => materia.id === grupo.subject_id
        ) && !enrolledGroupIds.includes(grupo.id) // Exclude already enrolled groups
    );

    setGruposDisp(gruposDis);
  };

  const getInscripciones = () => {
    if (!profile) return;

    if (profile.is_teacher) return;

    const inscripcionesDis = inscripciones.enrollments.filter(
      (inscripcion: Enrollment) => inscripcion.student_id === profile.id
    );

    setInscripcionesDisp(inscripcionesDis);

    const gruposInsc = grupos.groups.filter((grupo: Grupo) =>
      inscripcionesDis.find(
        (inscripcion: Enrollment) => inscripcion.group_id === grupo.id
      )
    );
    setGruposInsc(gruposInsc);
  };

  const handleEnroll = (grupo: Grupo) => {
    if (!profile) return;
    const inscripcion = {
      id: (inscripciones.enrollments.length + 1).toString(),
      student_id: profile.id,
      group_id: grupo.id,
    };

    inscripciones.enrollments.push(inscripcion);
    FileSystem.writeAsStringAsync(
      FileSystem.documentDirectory + "inscripciones.json",
      JSON.stringify(inscripciones, null, 2)
    );

    getInscripciones();

    const gruposDis = gruposDisp.filter((g: Grupo) => g.id !== grupo.id);
    setGruposDisp(gruposDis);
  };

  return (
    <View>
      {profile?.is_teacher ? (
        <View style={styles.container}>
          <Text style={styles.title}>Mis Grupos</Text>
          <ScrollView style={styles.cardHolder}>
            {gruposDisp.map((grupo: Grupo) => {
              return (
                <View key={grupo.id} style={styles.cardBlue}>
                  <Text style={styles.cardText}>{grupo.schedule}</Text>
                  <Text style={styles.cardText}>
                    {
                      materias.subjects.find(
                        (materia: Subject) => materia.id === grupo.subject_id
                      )?.name
                    }
                  </Text>
                  <Text style={styles.cardText}>
                    {"Docente: " +
                      profiles.find(
                        (profile: Profile) => profile.id === grupo.teacher_id
                      )?.name +
                      " " +
                      profiles.find(
                        (profile: Profile) => profile.id === grupo.teacher_id
                      )?.surname}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <>
          <View style={styles.container}>
            <Text style={styles.sectionText}>Todos los grupos</Text>

            <ScrollView style={styles.cardHolder}>
              {gruposDisp.map((grupo: Grupo) => {
                return (
                  <View key={grupo.id} style={styles.cardRed}>
                    <View style={{ flexDirection: "column" }}>
                      <Text style={styles.cardText}>{grupo.schedule}</Text>
                      <Text style={styles.cardText}>
                        {
                          materiasDisp.find(
                            (materia: Subject) =>
                              materia.id === grupo.subject_id
                          )?.name
                        }
                      </Text>
                      <Text style={styles.cardText}>
                        {"Docente: " +
                          profiles.find(
                            (profile: Profile) =>
                              profile.id === grupo.teacher_id
                          )?.name +
                          " " +
                          profiles.find(
                            (profile: Profile) =>
                              profile.id === grupo.teacher_id
                          )?.surname}
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "column", alignItems: "center" }}
                    >
                      <CheckBadgeIcon
                        color={"#fff"}
                        size={32}
                        onPress={() => handleEnroll(grupo)}
                      />
                      <Text
                        style={{ color: "#fff" }}
                        onPress={() => handleEnroll(grupo)}
                      >
                        Inscribirse
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <Text style={styles.sectionText}>Mis Grupos</Text>
            <ScrollView style={styles.cardHolder}>
              {gruposInsc.map((grupo: Grupo) => {
                const subject = materiasDisp.find(
                  (materia: Subject) =>
                    materia.id.toString().trim() ===
                    grupo.subject_id.toString().trim()
                );

                return (
                  <View key={grupo.id} style={styles.cardBlue}>
                    <Text style={styles.cardText}>{grupo.schedule}</Text>
                    <Text style={styles.cardText}>
                      {subject ? subject.name : "Materia no encontrada"}
                    </Text>
                    <Text style={styles.cardText}>
                      {"Docente: " +
                        profiles.find(
                          (profile: Profile) => profile.id === grupo.teacher_id
                        )?.name +
                        " " +
                        profiles.find(
                          (profile: Profile) => profile.id === grupo.teacher_id
                        )?.surname}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#fff",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 10,
  },
  cardHolder: {
    display: "flex",
    width: "100%",
    flex: 1,
    overflow: "scroll",
    marginTop: 10,
    marginBottom: 10,
    flexDirection: "column",
  },
  sectionText: {
    fontSize: 24,
    color: "#2F031A",
  },
  cardText: {
    color: "#fff",
    fontSize: 14,
  },
  cardRed: {
    backgroundColor: "#EA1465",
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
    height: 100,
    width: 300,
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  cardBlue: {
    backgroundColor: "#1465EA",
    alignSelf: "flex-end",
    width: 300,
    height: 100,
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    color: "#2F031A",
  },
});
