//tabs layour
import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Tabs } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { HomeIcon, UserCircleIcon } from "react-native-heroicons/micro";

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

export default function TabLayout() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (profile) return;
    getProfile();
  }, [profile]);

  const getProfile = async () => {
    const profile = await AsyncStorage.getItem("profile");
    if (!profile) return;
    setProfile(JSON.parse(profile));
  };

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#2F031A" }}>
      <Tabs.Screen
        name="Home"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: HomeIcon,
        }}
      />
      <Tabs.Screen
        name="Perfil"
        options={{
          headerShown: false,
          title: "Perfil",
          tabBarIcon: UserCircleIcon,
        }}
      />
    </Tabs>
  );
}
