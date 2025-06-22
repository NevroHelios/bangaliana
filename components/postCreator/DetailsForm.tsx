import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { PostData } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';

interface DetailsFormProps {
  postData: PostData;
  setPostData: React.Dispatch<React.SetStateAction<PostData>>;
  onBack: () => void;
  onPreview: () => void;
  // Theme Colors
  backgroundColor: string;
  onBackgroundColor: string;
  primaryColor: string;
  onPrimaryColor: string;
  surfaceColor: string;
  onSurfaceColor: string;
  onSurfaceVariantColor: string;
  outlineVariantColor: string;
}

export const DetailsForm: React.FC<DetailsFormProps> = ({
  postData,
  setPostData,
  onBack,
  onPreview,
  backgroundColor,
  onBackgroundColor,
  primaryColor,
  onPrimaryColor,
  surfaceColor,
  onSurfaceColor,
  onSurfaceVariantColor,
  outlineVariantColor,
}) => {
  return (
    <ScrollView style={[styles.container, { backgroundColor }]} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <TouchableOpacity style={[styles.backButton, styles.glassButton]} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="white" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.titleText}>Post Details</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ThemedView style={[styles.formContainer, styles.glassContainer]}>
        <View style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Title (Optional)</ThemedText>
          <TextInput
            style={[styles.textInput, styles.glassInput]}
            value={postData.title}
            onChangeText={(text) => setPostData({ ...postData, title: text })}
            placeholder="Add a title..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Description (Optional)</ThemedText>
          <TextInput
            style={[styles.textArea, styles.glassInput]}
            value={postData.description}
            onChangeText={(text) => setPostData({ ...postData, description: text })}
            placeholder="Write a caption..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Visibility</ThemedText>
          <View style={styles.visibilityContainer}>
            {(['public', 'private'] as const).map((value) => (
              <TouchableOpacity
                key={value}
                style={[styles.visibilityOption, styles.glassOption]}
                onPress={() => setPostData({ ...postData, visibility: value })}
              >
                <View style={styles.radioContainer}>
                  <View style={[styles.radioButton, postData.visibility === value && styles.radioButtonActive]}>
                    {postData.visibility === value && <View style={styles.radioButtonInner} />}
                  </View>
                  <Ionicons 
                    name={value === 'public' ? 'globe-outline' : value === 'private' ? 'lock-closed-outline' : 'people-outline'} 
                    size={20} 
                    color="white" 
                  />
                  <ThemedText style={styles.visibilityLabel}>{value.charAt(0).toUpperCase() + value.slice(1)}</ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        
      </ThemedView>

      <TouchableOpacity style={[styles.nextStepButton, styles.glassButton]} onPress={onPreview}>
        <ThemedText style={styles.buttonText}>Preview Post</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 16, 
    paddingTop: 16 
  },
  stepHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24, 
    paddingHorizontal: 8 
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleText: {
    fontSize: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  placeholder: { 
    width: 64 
  },
  formContainer: { 
    gap: 24, 
    padding: 20, 
    borderRadius: 16,
    marginBottom: 20,
  },
  inputGroup: { 
    gap: 12 
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    paddingLeft: 4,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  textInput: { 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    fontSize: 16,
    color: 'white',
  },
  textArea: { 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    fontSize: 16, 
    height: 120, 
    textAlignVertical: 'top',
    color: 'white',
  },
  visibilityContainer: { 
    gap: 8 
  },
  visibilityOption: { 
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  radioContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  radioButton: { 
    width: 22, 
    height: 22, 
    borderRadius: 11, 
    borderWidth: 2, 
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  radioButtonActive: {
    borderColor: '#00BCD4',
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  radioButtonInner: { 
    width: 12, 
    height: 12, 
    borderRadius: 6,
    backgroundColor: '#00BCD4',
  },
  visibilityLabel: { 
    fontSize: 16, 
    flex: 1,
    color: 'white',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  checkboxContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  checkbox: { 
    width: 22, 
    height: 22, 
    borderRadius: 6, 
    borderWidth: 2, 
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  checkboxActive: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  checkboxLabel: { 
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  
  },
  nextStepButton: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 16, 
    paddingHorizontal: 20, 
    borderRadius: 16, 
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    
  },
  // Glass effect styles
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
 
 
  },
  glassButton: {
    
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    
    backdropFilter: 'blur(10px)',
  },
  glassInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    
    backdropFilter: 'blur(5px)',
  },
  glassOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    
  },
});