import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MediaItem } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const BACKEND_URL = "http://192.168.244.255:10000";

const LensScreen = () => {
    const { token } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const styles = getStyles(theme);

    const [queryImage, setQueryImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [similarImages, setSimilarImages] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pickImage = async () => {
        setQueryImage(null);
        setSimilarImages([]);
        setError(null);

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need permission to access your photos to search.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setQueryImage(result.assets[0]);
        }
    };

    const searchSimilar = async () => {
        if (!queryImage) {
            Alert.alert('No Image', 'Please select an image to search with.');
            return;
        }
        if (!token) {
            Alert.alert('Not Authenticated', 'You must be logged in to search.');
            return;
        }

        setIsLoading(true);
        setSimilarImages([]);
        setError(null);

        const formData = new FormData();
        formData.append('image', {
            uri: queryImage.uri,
            name: queryImage.fileName || `query-${Date.now()}.jpg`,
            type: 'image/jpeg',
        } as any);

        try {
            const response = await fetch(`${BACKEND_URL}/api/search/media`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to find similar images.');
            }

            if (responseData.data && responseData.data.length > 0) {
                 setSimilarImages(responseData.data);
            } else {
                 Alert.alert('No Results', 'We couldn\'t find any visually similar images.');
            }
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
            Alert.alert('Search Failed', e.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderResultItem = ({ item }: { item: MediaItem }) => (
        <View style={styles.resultItem}>
            <Image source={{ uri: item.uri }} style={styles.resultImage} />
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Ionicons name="camera-reverse-outline" size={32} color={theme.primary} />
                <Text style={styles.title}>Visual Search</Text>
                <Text style={styles.subtitle}>Find images that look like your selection.</Text>
            </View>

            <View style={styles.querySection}>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                    {queryImage ? (
                        <Image source={{ uri: queryImage.uri }} style={styles.queryImage} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Ionicons name="image-outline" size={40} color={theme.secondary} />
                            <Text style={styles.placeholderText}>Tap to select an image</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, !queryImage && styles.disabledButton]} onPress={searchSimilar} disabled={!queryImage || isLoading}>
                    <Ionicons name="search-outline" size={20} color={theme.background} />
                    <Text style={styles.buttonText}>Find Similar</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            ) : error ? (
                 <View style={styles.centered}>
                    <Ionicons name="alert-circle-outline" size={40} color={theme.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : similarImages.length > 0 ? (
                <View style={styles.resultsSection}>
                    <Text style={styles.resultsTitle}>Similar Images</Text>
                    <FlatList
                        data={similarImages}
                        renderItem={renderResultItem}
                        keyExtractor={(item) => item.id}
                        numColumns={3}
                        columnWrapperStyle={styles.row}
                    />
                </View>
            ) : null}
        </ScrollView>
    );
};

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.text,
        marginTop: 8,
    },
    subtitle: {
        fontSize: 16,
        color: theme.secondary,
        textAlign: 'center',
        marginTop: 8,
    },
    querySection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    imagePicker: {
        width: 200,
        height: 200,
        borderRadius: 15,
        backgroundColor: theme.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: theme.outline,
        borderStyle: 'dashed',
        overflow: 'hidden',
    },
    queryImage: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: theme.secondary,
        marginTop: 8,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: theme.primary,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: theme.surfaceDisabled,
    },
    buttonText: {
        color: theme.background,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    centered: {
        marginTop: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: theme.secondary,
        fontSize: 16,
    },
    errorText: {
        marginTop: 10,
        color: theme.error,
        fontSize: 16,
        textAlign: 'center'
    },
    resultsSection: {
        marginTop: 20,
    },
    resultsTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 15,
    },
    row: {
        justifyContent: 'space-between',
    },
    resultItem: {
        width: '32%',
        aspectRatio: 1,
        marginBottom: 10,
        borderRadius: 10,
        overflow: 'hidden',
    },
    resultImage: {
        width: '100%',
        height: '100%',
    },
});

export default LensScreen; 