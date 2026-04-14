import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const API_URL = 'https://app-izuxylzo.fly.dev';

const LEVELS = [
  { key: 'kid', label: "Like I'm 10", emoji: '🧒' },
  { key: 'teen', label: 'Teenager', emoji: '🎓' },
  { key: 'adult', label: 'General', emoji: '👤' },
  { key: 'expert', label: 'Expert', emoji: '🔬' },
];

export default function App() {
  const [inputText, setInputText] = useState('');
  const [simplified, setSimplified] = useState('');
  const [level, setLevel] = useState('adult');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ original: number; simplified: number } | null>(null);

  const handleSimplify = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError('');
    setSimplified('');
    setStats(null);

    try {
      const res = await fetch(`${API_URL}/api/simplify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, level }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Something went wrong');
      }

      const data = await res.json();
      setSimplified(data.simplified);
      setStats({ original: data.original_length, simplified: data.simplified_length });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to the server';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(simplified);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reductionPercent = stats
    ? Math.round(((stats.original - stats.simplified) / stats.original) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="bulb" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>ExplainItSimply</Text>
              <Text style={styles.headerSubtitle}>Paste anything. Get a simple explanation.</Text>
            </View>
          </View>

          {/* Level Selector */}
          <Text style={styles.sectionLabel}>Complexity Level</Text>
          <View style={styles.levelRow}>
            {LEVELS.map((l) => (
              <TouchableOpacity
                key={l.key}
                onPress={() => setLevel(l.key)}
                style={[
                  styles.levelButton,
                  level === l.key && styles.levelButtonActive,
                ]}
              >
                <Text style={styles.levelEmoji}>{l.emoji}</Text>
                <Text
                  style={[
                    styles.levelLabel,
                    level === l.key && styles.levelLabelActive,
                  ]}
                >
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input */}
          <Text style={styles.sectionLabel}>Paste your text</Text>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Paste any complex text here — a research paper, legal document, technical docs..."
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="top"
          />

          {/* Simplify Button */}
          <TouchableOpacity
            onPress={handleSimplify}
            disabled={loading || !inputText.trim()}
            style={[
              styles.simplifyButton,
              (loading || !inputText.trim()) && styles.simplifyButtonDisabled,
            ]}
          >
            {loading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.buttonText}>Simplifying...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Simplify</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {/* Output */}
          <View style={styles.outputHeader}>
            <Text style={styles.sectionLabel}>Simplified version</Text>
            {simplified ? (
              <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
                <Ionicons
                  name={copied ? 'checkmark' : 'copy-outline'}
                  size={16}
                  color="#4f46e5"
                />
                <Text style={styles.copyText}>{copied ? 'Copied!' : 'Copy'}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.outputBox}>
            {loading && (
              <View style={styles.outputPlaceholder}>
                <ActivityIndicator color="#9ca3af" size="large" />
              </View>
            )}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            {!loading && !error && !simplified && (
              <Text style={styles.placeholderText}>
                Your simplified text will appear here...
              </Text>
            )}
            {!loading && simplified ? (
              <Text style={styles.outputText}>{simplified}</Text>
            ) : null}
          </View>

          {stats && !loading && (
            <View style={styles.statsRow}>
              <Text style={styles.statText}>Original: {stats.original} chars</Text>
              <Text style={styles.statText}>Simplified: {stats.simplified} chars</Text>
              {reductionPercent > 0 && (
                <Text style={styles.statHighlight}>{reductionPercent}% shorter</Text>
              )}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              ExplainItSimply — Making knowledge accessible to everyone
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
    marginTop: 12,
  },
  headerIcon: {
    backgroundColor: '#4f46e5',
    padding: 10,
    borderRadius: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  levelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  levelButtonActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  levelEmoji: {
    fontSize: 16,
  },
  levelLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563',
  },
  levelLabelActive: {
    color: '#fff',
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: '#1f2937',
    minHeight: 160,
    marginBottom: 16,
  },
  simplifyButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  simplifyButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyText: {
    fontSize: 13,
    color: '#4f46e5',
    fontWeight: '500',
  },
  outputBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 16,
    minHeight: 160,
  },
  outputPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
  placeholderText: {
    color: '#9ca3af',
    fontStyle: 'italic',
    fontSize: 14,
  },
  outputText: {
    fontSize: 15,
    color: '#1f2937',
    lineHeight: 24,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    padding: 14,
    borderRadius: 10,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
  },
  statHighlight: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
