// ─── ShadowDrive AI — Mobile Home Screen ───

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚗 ShadowDrive AI</Text>
      <Text style={styles.subtitle}>Hollandaca · Türkçe</Text>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => {
          // TODO: Navigate to courses or AI generation
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.startText}>Derse Başla</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Eller serbest, güvenli sürüş modunda dil öğrenin.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#9ca3af',
    marginBottom: 48,
  },
  startButton: {
    backgroundColor: '#10b981',
    paddingVertical: 20,
    paddingHorizontal: 48,
    borderRadius: 16,
    minHeight: 88,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  startText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 48,
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
});
