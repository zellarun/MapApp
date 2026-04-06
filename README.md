# Working With Maps App

This project is a React Native mobile application that displays a map and allows the user to manage a list of saved locations. Locations can be added by typing an address or by using the device’s current GPS location. Each saved location appears both in a list and as a marker on the map.

Selecting a location from the list will move the map to that location and zoom in.

## What It Does
- Interactive MapView using React Native Maps
- Scrollable list of saved locations
- Add a location by typing an address (geocoding)
- Add current GPS location
- Delete selected locations
- Tap a list item to zoom to that marker on the map
- Load and save location data from a remote URL
- Supports device rotation (portrait and landscape)

## Technologies Used
- React Native
- Expo
- react-native-maps
- expo-location
- JavaScript / TypeScript

## Running The App
1. Install dependencies with your package manager.
2. Start the Expo dev server (npx expo start)
3. Open on iOS Simulator, Android Emulator, or Expo Go.
