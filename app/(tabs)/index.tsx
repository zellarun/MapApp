/**
 * CS402 - Mobile App Development
 * Assignment: Map Locations
 * Date: 8 March 2026
 */

import * as Location from "expo-location";
import { Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

const USERNAME = "zellarunning";

const LOAD_URL = `https://mec402.boisestate.edu/csclasses/cs402/codesnips/loadjson.php?user=${USERNAME}`;
const SAVE_URL = `https://mec402.boisestate.edu/csclasses/cs402/codesnips/savejson.php?user=${USERNAME}`;

// Type definition for a location item, including id, name, latitude, and longitude
type LocationItem = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

// Main component for the Map Locations app
export default function Index() {
  const mapRef = useRef<MapView | null>(null);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [address, setAddress] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Default region to show on the map when the app loads
  const defaultRegion: Region = {
    latitude: 43.615,
    longitude: -116.2023,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Move the map to the specified latitude and longitude
  const moveMapToLocation = (latitude: number, longitude: number) => {
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };
  
  // Load locations from the server and clean the data
  const loadLocations = async () => {
    try {
      const response = await fetch(LOAD_URL);
      const data = await response.json();

      if (Array.isArray(data)) {
        const cleanedData: LocationItem[] = data
          .filter(
            (item) =>
              item &&
              item.name &&
              typeof item.latitude === "number" &&
              typeof item.longitude === "number"
          )
          .map((item, index) => ({
            id: item.id ? String(item.id) : `${Date.now()}-${index}`,
            name: String(item.name),
            latitude: item.latitude,
            longitude: item.longitude,
          }));

        setLocations(cleanedData);
      } else {
        Alert.alert("Load Error", "The loaded data was not an array.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not load locations from the server.");
    }
  };

  // Save the current locations to the server
  const saveLocations = async () => {
    try {
      const response = await fetch(SAVE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locations),
      });

      const result = await response.text();
      Alert.alert("Save Complete", result || "Locations saved.");
    } catch (error) {
      Alert.alert("Error", "Could not save locations to the server.");
    }
  };

  // Add a new location based on the entered address
  const addAddressLocation = async () => {
    if (!address.trim()) {
      Alert.alert("Missing Address", "Please type an address first.");
      return;
    }

    try {
      const results = await Location.geocodeAsync(address);

      if (results.length === 0) {
        Alert.alert("Not Found", "Could not find that address.");
        return;
      }

      const found = results[0];

      const newLocation: LocationItem = {
        id: Date.now().toString(),
        name: address,
        latitude: found.latitude,
        longitude: found.longitude,
      };

      setLocations((prev) => [...prev, newLocation]);
      setAddress("");
      moveMapToLocation(found.latitude, found.longitude);
    } catch (error) {
      Alert.alert("Error", "Failed to geocode the address.");
    }
  };

  // Add the user's current GPS location as a new location
  const addCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to get your GPS location."
        );
        return;
      }

      const current = await Location.getCurrentPositionAsync({});

      const newLocation: LocationItem = {
        id: Date.now().toString(),
        name: "Current Location",
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      setLocations((prev) => [...prev, newLocation]);
      moveMapToLocation(current.coords.latitude, current.coords.longitude);
    } catch (error) {
      Alert.alert("Error", "Could not get current GPS location.");
    }
  };

  // Delete the currently selected location from the list and map
  const deleteSelected = () => {
    if (!selectedId) {
      Alert.alert("No Selection", "Please select a location to delete.");
      return;
    }

    setLocations((prev) => prev.filter((loc) => loc.id !== selectedId));
    setSelectedId(null);
  };

  useEffect(() => {
    loadLocations();
  }, []);

  // Render the main UI of the app, including the map and the list of locations
  return (
    <>
      <Stack.Screen options={{ title: "Map Locations" }} />

      <View style={[styles.container, isLandscape && styles.containerLandscape]}>
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={defaultRegion}
          >
            {locations.map((loc) => (
              <Marker
                key={loc.id}
                coordinate={{
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }}
                title={loc.name}
              />
            ))}
          </MapView>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.heading}>Saved Locations</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter address"
            placeholderTextColor="#888"
            value={address}
            onChangeText={setAddress}
          />

          <View style={styles.buttonSpacing}>
            <Button title="Add Address" onPress={addAddressLocation} />
          </View>

          <View style={styles.buttonSpacing}>
            <Button
              title="Add Current GPS Location"
              onPress={addCurrentLocation}
            />
          </View>

          <View style={styles.buttonSpacing}>
            <Button title="Delete Selected" onPress={deleteSelected} />
          </View>

          <View style={styles.buttonSpacing}>
            <Button title="Load" onPress={loadLocations} />
          </View>

          <View style={styles.buttonSpacing}>
            <Button title="Save" onPress={saveLocations} />
          </View>

          <FlatList
            data={locations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.listItem,
                  selectedId === item.id && styles.selectedItem,
                ]}
                onPress={() => {
                  setSelectedId(item.id);
                  moveMapToLocation(item.latitude, item.longitude);
                }}
              >
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemText}>
                  Lat: {item.latitude.toFixed(6)}
                </Text>
                <Text style={styles.itemText}>
                  Lon: {item.longitude.toFixed(6)}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No locations loaded yet.</Text>
            }
          />
        </View>
      </View>
    </>
  );
}

// Styles for the app, including layout and appearance of the map and list
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#f5f5f5",
  },
  containerLandscape: {
    flexDirection: "row",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    padding: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    color: "#000",
  },
  buttonSpacing: {
    marginBottom: 8,
  },
  listItem: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e2e2",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  selectedItem: {
    backgroundColor: "#e6f2ff",
    borderColor: "#4a90e2",
  },
  itemTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 12,
    color: "#555",
  },
  emptyText: {
    marginTop: 15,
    textAlign: "center",
    color: "#777",
    fontStyle: "italic",
  },
});