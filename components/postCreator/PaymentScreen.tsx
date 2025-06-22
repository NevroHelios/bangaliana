import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PaymentScreenProps {
  onBuy: () => void;
  onCancel: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ onBuy, onCancel }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Unlock Featured Post</Text>
        <Text style={styles.description}>
          Make your post shine! Feature it to reach a wider audience and stand out in the feed.
        </Text>
      </View>

      <View style={styles.planCard}>
        <Ionicons name="star" size={40} color="#F59E0B" style={styles.starIcon} />
        <Text style={styles.planName}>Featured Post Boost</Text>
        <Text style={styles.planPrice}>$4.99</Text>
        <Text style={styles.planDuration}>One-time payment per post</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#34D399" />
            <Text style={styles.featureText}>Increased Visibility</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#34D399" />
            <Text style={styles.featureText}>Appears in Featured Section</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={18} color="#34D399" />
            <Text style={styles.featureText}>Higher Engagement Potential</Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buyButton} onPress={onBuy}>
          <Text style={styles.buttonText}>Buy Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Changed from a solid color to transparent to allow the parent's overlay to be visible
    backgroundColor: 'transparent', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E0BBE4', 
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  planCard: {
    backgroundColor: '#2D2D3A',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 50,
    width: '95%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#4A4A5A', 
  },
  starIcon: {
    marginBottom: 15,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginTop: 10,
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  planDuration: {
    fontSize: 16,
    color: '#A0AEC0',
    marginBottom: 20,
  },
  featuresList: {
    marginTop: 15,
    width: '100%',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#E5E7EB',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  buyButton: {
    backgroundColor: '#00C853', 
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  cancelButton: {
    backgroundColor: '#FF3B30', 
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});