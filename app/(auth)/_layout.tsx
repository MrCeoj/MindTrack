import { Stack } from "expo-router/stack";

export default function Layout() {
  
  return (
    <Stack>
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen
        name="Register"
        options={{
          title: "",
          headerStyle: { backgroundColor: "#2F031A" },
          headerTintColor: "#fff",
          headerTransparent: true,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
    </Stack>
  );
}
