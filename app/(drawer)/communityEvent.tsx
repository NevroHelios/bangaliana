import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ImageBackground,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";


const API_URL = "http://192.168.233.236:10000/api/events";

interface FormData {
  name: string;
  description: string;
  eventType: string;
  date: Date;
  endDate: Date;
  locationName: string;
  locationAddress?: string;
  locationLink?: string; // Added link field to match schema
  maxParticipants: string;
  registrationRequired: boolean;
  registrationDeadline: Date;
  tags: string;
  culturalTags: string;
  visibility: "public" | "private";
  organizerNotes: string;
}

const backgroundImg = require("../../assets/images/krishna.jpg"); // Use your Bengali-inspired image

const CommunityEvent: React.FC = () => {
  const { token } = useAuth();
  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    eventType: "",
    date: new Date(),
    endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Default to next day
    locationName: "",
    locationAddress: "",
    locationLink: "", // Added link field
    maxParticipants: "",
    registrationRequired: false,
    registrationDeadline: new Date(
      new Date().getTime() + 7 * 24 * 60 * 60 * 1000
    ), // Default to 1 week from now
    tags: "",
    culturalTags: "",
    visibility: "public",
    organizerNotes: "",
  });

  const [coverImage, setCoverImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showRegDeadlinePicker, setShowRegDeadlinePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"create" | "view">("create");
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Event type options
  const eventTypes = [
    { value: "cultural", label: "Cultural" },
    { value: "social", label: "Social" },
    { value: "educational", label: "Educational" },
    { value: "religious", label: "Religious" },
    { value: "festival", label: "Festival" },
    { value: "workshop", label: "Workshop" },
    { value: "celebration", label: "Celebration" },
    { value: "other", label: "Other" },
  ];

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCoverImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleChange = <K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      setMessage("Event name is required");
      return false;
    }
    if (!form.eventType) {
      setMessage("Event type is required");
      return false;
    }
    if (!form.locationName.trim()) {
      setMessage("Location name is required");
      return false;
    }
    if (form.date < new Date()) {
      setMessage("Event date cannot be in the past");
      return false;
    }
    if (form.endDate < form.date) {
      setMessage("End date cannot be before start date");
      return false;
    }
    if (form.registrationRequired && form.registrationDeadline > form.date) {
      setMessage("Registration deadline cannot be after event date");
      return false;
    }
    if (form.maxParticipants && parseInt(form.maxParticipants) <= 0) {
      setMessage("Max participants must be a positive number");
      return false;
    }
    // Validate URL format if link is provided
    if (form.locationLink && form.locationLink.trim()) {
      try {
        new URL(form.locationLink);
      } catch {
        setMessage("Please enter a valid URL for location link");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();

      // Construct the location object according to the schema
      const locationObj = {
        name: form.locationName,
        ...(form.locationAddress &&
          form.locationAddress.trim() && { address: form.locationAddress }),
        ...(form.locationLink &&
          form.locationLink.trim() && { link: form.locationLink }),
      };

      // Append the location object as a JSON string
      formData.append("location", JSON.stringify(locationObj));

      // Append all other form fields, excluding location-specific ones
      Object.entries(form).forEach(([key, value]) => {
        if (
          key === "locationName" ||
          key === "locationAddress" ||
          key === "locationLink"
        ) {
          return; // Skip these as they're handled in the location object
        }

        if (
          key === "date" ||
          key === "endDate" ||
          key === "registrationDeadline"
        ) {
          formData.append(
            key,
            value instanceof Date ? value.toISOString() : String(value)
          );
        } else if (typeof value === "boolean") {
          formData.append(key, String(value));
        } else {
          formData.append(key, String(value));
        }
      });

      // Append cover image if selected
      if (coverImage) {
        formData.append("coverImage", {
          uri: coverImage.uri,
          name: coverImage.uri.split("/").pop() || "cover.jpg",
          type: "image/jpeg",
        } as any);
      }

      const res = await fetch(
        "http://192.168.233.236:10000/api/events/events/createevent",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Community event created successfully!");
        // Reset form after successful creation
        setForm({
          name: "",
          description: "",
          eventType: "",
          date: new Date(),
          endDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
          locationName: "",
          locationAddress: "",
          locationLink: "",
          maxParticipants: "",
          registrationRequired: false,
          registrationDeadline: new Date(
            new Date().getTime() + 7 * 24 * 60 * 60 * 1000
          ),
          tags: "",
          culturalTags: "",
          visibility: "public",
          organizerNotes: "",
        });
        setCoverImage(null);
      } else {
        setMessage(data.message || "Failed to create event");
      }
    } catch (error) {
      setMessage(
        "Error creating event: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch all community events from /api/events/events
  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const res = await fetch("http://192.168.233.236:10000/api/events/events");
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === "view") fetchEvents();
  }, [viewMode]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper to get base64 from Buffer or string (safe for large arrays)
  const getEventImageUri = (event: any) => {
    if (!event.coverImage) return undefined;
    if (typeof event.coverImage === "string") return event.coverImage;
    if (event.coverImage.data) {
      // Convert array to binary string in chunks
      const bytes = event.coverImage.data;
      let binary = "";
      for (let i = 0; i < bytes.length; i += 4096) {
        binary += String.fromCharCode.apply(null, bytes.slice(i, i + 4096));
      }
      const base64 = global.btoa(binary);
      return `data:image/jpeg;base64,${base64}`;
    }
    return undefined;
  };

  return (
    <ImageBackground
      source={backgroundImg}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "rgba(18,18,18,0.85)" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor:
                viewMode === "create" ? "#FFD700" : "rgba(44,44,44,0.7)",
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 24,
              marginRight: 8,
              shadowColor: "#B22222",
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
              borderWidth: viewMode === "create" ? 2 : 0,
              borderColor: "#B22222",
            }}
            onPress={() => setViewMode("create")}
          >
            <Text
              style={{
                color: viewMode === "create" ? "#B22222" : "#FFD700",
                fontWeight: "bold",
                fontSize: 18,
                letterSpacing: 1.2,
                fontFamily: "serif",
              }}
            >
              Create Community Event
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor:
                viewMode === "view" ? "#FFD700" : "rgba(44,44,44,0.7)",
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 24,
              shadowColor: "#B22222",
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
              borderWidth: viewMode === "view" ? 2 : 0,
              borderColor: "#B22222",
            }}
            onPress={() => setViewMode("view")}
          >
            <Text
              style={{
                color: viewMode === "view" ? "#B22222" : "#FFD700",
                fontWeight: "bold",
                fontSize: 18,
                letterSpacing: 1.2,
                fontFamily: "serif",
              }}
            >
              View Community Events
            </Text>
          </TouchableOpacity>
        </View>
        {viewMode === "create" ? (
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerContainer}>
              <Ionicons name="calendar" size={32} color="#B22222" />
              <Text style={styles.header}>Create Community Event</Text>
            </View>

            {/* Event Basic Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Event Details</Text>

              <TextInput
                style={styles.input}
                placeholder="Event Name *"
                placeholderTextColor="#A9A9A9"
                value={form.name}
                onChangeText={(v) => handleChange("name", v)}
                maxLength={200}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Event Description"
                placeholderTextColor="#A9A9A9"
                value={form.description}
                onChangeText={(v) => handleChange("description", v)}
                multiline
                numberOfLines={4}
                maxLength={2000}
                textAlignVertical="top"
              />

              {/* Event Type Selector */}
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Event Type *</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.eventTypeScroll}
                >
                  {eventTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.eventTypeChip,
                        form.eventType === type.value &&
                          styles.eventTypeChipSelected,
                      ]}
                      onPress={() => handleChange("eventType", type.value)}
                    >
                      <Text
                        style={[
                          styles.eventTypeText,
                          form.eventType === type.value &&
                            styles.eventTypeTextSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Date & Time Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 Date & Time</Text>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#B22222" />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>Start Date *</Text>
                  <Text style={styles.dateValue}>{formatDate(form.date)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#B22222" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={form.date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event:any, date:any) => {
                    setShowDatePicker(false);
                    if (date) handleChange("date", date);
                  }}
                  minimumDate={new Date()}
                  themeVariant="dark" // For iOS
                />
              )}

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#B22222" />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>End Date</Text>
                  <Text style={styles.dateValue}>
                    {formatDate(form.endDate)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#B22222" />
              </TouchableOpacity>

              {showEndDatePicker && (
                <DateTimePicker
                  value={form.endDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event:any, date:any) => {
                    setShowEndDatePicker(false);
                    if (date) handleChange("endDate", date);
                  }}
                  minimumDate={form.date}
                  themeVariant="dark" // For iOS
                />
              )}
            </View>

            {/* Location Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Location</Text>

              <TextInput
                style={styles.input}
                placeholder="Location Name *"
                placeholderTextColor="#A9A9A9"
                value={form.locationName}
                onChangeText={(v) => handleChange("locationName", v)}
                maxLength={200}
              />

              <TextInput
                style={styles.input}
                placeholder="Full Address (Optional)"
                placeholderTextColor="#A9A9A9"
                value={form.locationAddress}
                onChangeText={(v) => handleChange("locationAddress", v)}
                maxLength={500}
              />

              <TextInput
                style={styles.input}
                placeholder="Location Link/Map URL (Optional)"
                placeholderTextColor="#A9A9A9"
                value={form.locationLink}
                onChangeText={(v) => handleChange("locationLink", v)}
                maxLength={500}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            {/* Registration Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                👥 Registration & Capacity
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Max Participants (Optional)"
                placeholderTextColor="#A9A9A9"
                value={form.maxParticipants}
                onChangeText={(v) =>
                  handleChange("maxParticipants", v.replace(/[^0-9]/g, ""))
                }
                keyboardType="numeric"
                maxLength={6}
              />

              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() =>
                  handleChange(
                    "registrationRequired",
                    !form.registrationRequired
                  )
                }
              >
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Registration Required</Text>
                  <Text style={styles.toggleSubtext}>
                    {form.registrationRequired
                      ? "Users must register to attend"
                      : "Open event, no registration needed"}
                  </Text>
                </View>
                <Ionicons
                  name={form.registrationRequired ? "toggle" : "toggle-outline"}
                  size={32}
                  color={form.registrationRequired ? "#4CAF50" : "#555"}
                />
              </TouchableOpacity>

              {form.registrationRequired && (
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowRegDeadlinePicker(true)}
                >
                  <Ionicons name="alarm-outline" size={20} color="#B22222" />
                  <View style={styles.dateInfo}>
                    <Text style={styles.dateLabel}>Registration Deadline</Text>
                    <Text style={styles.dateValue}>
                      {formatDate(form.registrationDeadline)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#B22222" />
                </TouchableOpacity>
              )}

              {showRegDeadlinePicker && (
                <DateTimePicker
                  value={form.registrationDeadline}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event:any, date:any) => {
                    setShowRegDeadlinePicker(false);
                    if (date) handleChange("registrationDeadline", date);
                  }}
                  maximumDate={form.date}
                  themeVariant="dark" // For iOS
                />
              )}
            </View>

            {/* Tags & Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏷️ Tags & Categories</Text>

              <TextInput
                style={styles.input}
                placeholder="Tags (comma separated, e.g. music, dance, food)"
                placeholderTextColor="#A9A9A9"
                value={form.tags}
                onChangeText={(v) => handleChange("tags", v)}
                maxLength={500}
              />

              <TextInput
                style={styles.input}
                placeholder="Cultural Tags (e.g. Diwali, Holi, Traditional)"
                placeholderTextColor="#A9A9A9"
                value={form.culturalTags}
                onChangeText={(v) => handleChange("culturalTags", v)}
                maxLength={500}
              />
            </View>

            {/* Settings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚙️ Event Settings</Text>

              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() =>
                  handleChange(
                    "visibility",
                    form.visibility === "public" ? "private" : "public"
                  )
                }
              >
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Event Visibility</Text>
                  <Text style={styles.toggleSubtext}>
                    {form.visibility === "public"
                      ? "Public - Anyone can see this event"
                      : "Private - Only invited users can see"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.visibilityBadge,
                    form.visibility === "public"
                      ? styles.publicBadge
                      : styles.privateBadge,
                  ]}
                >
                  <Text style={styles.visibilityText}>
                    {form.visibility === "public" ? "PUBLIC" : "PRIVATE"}
                  </Text>
                </View>
              </TouchableOpacity>

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Organizer Notes (Optional)"
                placeholderTextColor="#A9A9A9"
                value={form.organizerNotes}
                onChangeText={(v) => handleChange("organizerNotes", v)}
                multiline
                numberOfLines={3}
                maxLength={1000}
                textAlignVertical="top"
              />
            </View>

            {/* Cover Image Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🖼️ Cover Image</Text>

              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                <Ionicons name="camera" size={24} color="#B22222" />
                <Text style={styles.imagePickerText}>
                  {coverImage ? "Change Cover Image" : "Add Cover Image"}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#B22222" />
              </TouchableOpacity>

              {coverImage && (
                <View style={styles.imagePreview}>
                  <Image
                    source={{ uri: coverImage.uri }}
                    style={styles.coverImage}
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setCoverImage(null)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Message Display */}
            {message && (
              <View
                style={[
                  styles.messageContainer,
                  message.includes("✅")
                    ? styles.successMessage
                    : styles.errorMessage,
                ]}
              >
                <Text style={styles.messageText}>{message}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.submitText}>Create Event</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {eventsLoading ? (
              <ActivityIndicator color="#B22222" style={{ marginTop: 40 }} />
            ) : (
              <>
                {/* Ongoing/Upcoming Events */}
                <Text
                  style={{
                    color: "#FFD700",
                    fontSize: 20,
                    fontWeight: "bold",
                    marginBottom: 8,
                    fontFamily: "serif",
                    textShadowColor: "#B22222",
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Cultural Heritage Events (Ongoing/Upcoming)
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginBottom: 24,
                  }}
                >
                  {events
                    .filter(
                      (e) => !e.endDate || new Date(e.endDate) >= new Date()
                    )
                    .map((event) => (
                      <TouchableOpacity
                        key={event._id}
                        style={{
                          backgroundColor: "rgba(255,248,240,0.3)", // More transparent
                          borderRadius: 18,
                          margin: 6,
                          padding: 0,
                          width: "46%",
                          shadowColor: "#B22222",
                          shadowOpacity: 0.18,
                          shadowRadius: 8,
                          elevation: 3,
                          borderWidth: 2,
                          borderColor: "#FFD700",
                          overflow: "hidden",
                        }}
                        onPress={() => setSelectedEvent(event)}
                      >
                        {getEventImageUri(event) && (
                          <Image
                            source={{ uri: getEventImageUri(event) }}
                            style={{
                              width: "100%",
                              height: 110,
                              borderTopLeftRadius: 16,
                              borderTopRightRadius: 16,
                              borderBottomWidth: 1,
                              borderColor: "#FFD700",
                            }}
                            resizeMode="cover"
                          />
                        )}
                        <View
                          style={{
                            padding: 12,
                            backgroundColor: "rgba(255,248,240,0.3)", // More transparent
                            borderBottomLeftRadius: 18,
                            borderBottomRightRadius: 18,
                          }}
                        >
                          <Text
                            style={{
                              color: "#B22222",
                              fontWeight: "bold",
                              fontSize: 16,
                              marginBottom: 2,
                              fontFamily: "serif",
                            }}
                          >
                            {event.name}
                          </Text>
                          <Text style={{ color: "#444", fontSize: 13 }}>
                            {event.locationName}
                          </Text>
                          <Text style={{ color: "#888", fontSize: 12 }}>
                            {event.eventType}
                          </Text>
                          <Text style={{ color: "#888", fontSize: 12 }}>
                            {new Date(event.date).toLocaleDateString()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
                {/* Ended Events */}
                <Text
                  style={{
                    color: "#FFD700",
                    fontSize: 20,
                    fontWeight: "bold",
                    marginBottom: 8,
                    fontFamily: "serif",
                    textShadowColor: "#B22222",
                    textShadowOffset: { width: 1, height: 1 },
                    textShadowRadius: 2,
                  }}
                >
                  Ended Events
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {events
                    .filter(
                      (e) => e.endDate && new Date(e.endDate) < new Date()
                    )
                    .map((event) => (
                      <TouchableOpacity
                        key={event._id}
                        style={{
                          backgroundColor: "#2C2C2C",
                          borderRadius: 18,
                          margin: 6,
                          padding: 0,
                          width: "46%",
                          borderWidth: 2,
                          borderColor: "#FFD700",
                          overflow: "hidden",
                          elevation: 2,
                        }}
                        onPress={() => setSelectedEvent(event)}
                      >
                        {event.coverImage && (
                          <Image
                            source={{
                              uri: `data:image/jpeg;base64,${event.coverImage.data}`,
                            }}
                            style={{
                              width: "100%",
                              height: 110,
                              borderTopLeftRadius: 16,
                              borderTopRightRadius: 16,
                              borderBottomWidth: 1,
                              borderColor: "#FFD700",
                            }}
                            resizeMode="cover"
                          />
                        )}
                        <View style={{ padding: 12 }}>
                          <Text
                            style={{
                              color: "#FFD700",
                              fontWeight: "bold",
                              fontSize: 16,
                              marginBottom: 2,
                              fontFamily: "serif",
                            }}
                          >
                            {event.name}
                          </Text>
                          <Text style={{ color: "#EFEFEF", fontSize: 13 }}>
                            {event.locationName}
                          </Text>
                          <Text style={{ color: "#FFD700", fontSize: 12 }}>
                            {event.eventType}
                          </Text>
                          <Text style={{ color: "#FFD700", fontSize: 12 }}>
                            {new Date(event.date).toLocaleDateString()}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              </>
            )}
            {/* Event Details Modal/Box */}
            {selectedEvent && (
              <View
                style={{
                  backgroundColor: "rgba(255,248,240,0.35)", // More transparent
                  borderRadius: 22,
                  padding: 20,
                  marginTop: 20,
                  shadowColor: "#B22222",
                  shadowOpacity: 0.22,
                  shadowRadius: 12,
                  elevation: 6,
                  borderWidth: 2,
                  borderColor: "#FFD700",
                }}
              >
                {getEventImageUri(selectedEvent) && (
                  <Image
                    source={{ uri: getEventImageUri(selectedEvent) }}
                    style={{
                      width: "100%",
                      height: 180,
                      borderRadius: 16,
                      marginBottom: 12,
                      borderWidth: 2,
                      borderColor: "#FFD700",
                    }}
                    resizeMode="cover"
                  />
                )}
                <Text
                  style={{
                    color: "#B22222",
                    fontWeight: "bold",
                    fontSize: 24,
                    marginBottom: 8,
                    fontFamily: "serif",
                    textAlign: "center",
                  }}
                >
                  {selectedEvent.name}
                </Text>
                <Text
                  style={{
                    color: "#444",
                    fontSize: 16,
                    marginBottom: 4,
                    fontFamily: "serif",
                    textAlign: "center",
                  }}
                >
                  {selectedEvent.description}
                </Text>
                <Text
                  style={{ color: "#B22222", fontWeight: "bold", marginTop: 8 }}
                >
                  Organiser:
                </Text>
                <Text style={{ color: "#444", fontSize: 15 }}>
                  {selectedEvent.organizerId?.name} (
                  {selectedEvent.organizerId?.email})
                </Text>
                <Text style={{ color: "#888", fontSize: 14, marginTop: 6 }}>
                  Type: {selectedEvent.eventType}
                </Text>
                <Text style={{ color: "#888", fontSize: 14 }}>
                  Location: {selectedEvent?.location?.name}
                </Text>
                <Text style={{ color: "#888", fontSize: 14 }}>
                  Location Address: {selectedEvent?.location?.address}
                </Text>
                <Text style={{ color: "#888", fontSize: 14 }}>
                  Location link : {selectedEvent?.location?.link ? (
                    <Text
                      style={{ color: "#1e90ff", textDecorationLine: "underline" }}
                      onPress={() => {
                        if (selectedEvent?.location?.link) {
                          // Open the link using Linking API
                          import("react-native").then(({ Linking }) => {
                            Linking.openURL(selectedEvent.location.link);
                          });
                        }
                      }}
                    >
                      {selectedEvent.location.link}
                    </Text>
                  ) : (
                    <Text style={{ color: "#888" }}>N/A</Text>
                  )}
                </Text>
                <Text style={{ color: "#888", fontSize: 14 }}>
                  Start: {new Date(selectedEvent.date).toLocaleString()}
                </Text>
                <Text style={{ color: "#888", fontSize: 14 }}>
                  End:{" "}
                  {selectedEvent.endDate
                    ? new Date(selectedEvent.endDate).toLocaleString()
                    : "N/A"}
                </Text>
                <Text style={{ color: "#888", fontSize: 14 }}>
                  Max Participants:{" "}
                  {selectedEvent.maxParticipants || "Unlimited"}
                </Text>
                <Text style={{ color: "#888", fontSize: 14 }}>
                  Visibility: {selectedEvent.visibility}
                </Text>
                <Text style={{ color: "#888", fontSize: 14 }}>
                  Status: {selectedEvent.status}
                </Text>
                <Text style={{ color: "#888", fontSize: 14 }}>
                  Tags: {selectedEvent.tags?.join(", ")}
                </Text>
                <Text style={{ color: "#888", fontSize: 14 }}>
                  Cultural Tags: {selectedEvent.culturalTags?.join(", ")}
                </Text>
                <Text style={{ color: "#888", fontSize: 14, marginBottom: 8 }}>
                  Notes: {selectedEvent.organizerNotes}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedEvent(null)}
                  style={{
                    alignSelf: "center",
                    backgroundColor: "#B22222",
                    borderRadius: 10,
                    paddingHorizontal: 24,
                    paddingVertical: 8,
                    marginTop: 8,
                  }}
                >
                  <Text
                    style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#121212", // Dark background
    minHeight: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    paddingVertical: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#B22222", // Accent color
    marginLeft: 12,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: "#1E1E1E", // Dark card background
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2c2c2c", // Subtle border
    elevation: 3, // For Android shadow
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B22222", // Accent color
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#3A3A3A", // Darker border
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#2C2C2C", // Dark input background
    fontSize: 16,
    color: "#EFEFEF", // Light text
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 16,
    color: "#B22222",
    marginBottom: 8,
    fontWeight: "600",
  },
  pickerContainer: {
    marginBottom: 12,
  },
  eventTypeScroll: {
    flexDirection: "row",
  },
  eventTypeChip: {
    backgroundColor: "#2C2C2C", // Dark chip background
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  eventTypeChipSelected: {
    backgroundColor: "#B22222",
    borderColor: "#B22222",
  },
  eventTypeText: {
    color: "#BDBDBD", // Light gray text
    fontSize: 14,
    fontWeight: "500",
  },
  eventTypeTextSelected: {
    color: "#FFFFFF",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2C",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  dateInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 14,
    color: "#A9A9A9", // Lighter secondary text
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 16,
    color: "#EFEFEF", // Primary light text
    fontWeight: "500",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2C",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    color: "#EFEFEF",
    fontWeight: "500",
    marginBottom: 2,
  },
  toggleSubtext: {
    fontSize: 12,
    color: "#A9A9A9",
  },
  visibilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  publicBadge: {
    backgroundColor: "#4CAF50",
  },
  privateBadge: {
    backgroundColor: "#FF9800",
  },
  visibilityText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  imagePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2C",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  imagePickerText: {
    flex: 1,
    color: "#B22222",
    marginLeft: 12,
    fontWeight: "500",
    fontSize: 16,
  },
  imagePreview: {
    position: "relative",
    marginTop: 12,
  },
  coverImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#2C2C2C",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(44, 44, 44, 0.8)", // Semi-transparent dark bg
    borderRadius: 12,
    padding: 4,
  },
  messageContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  successMessage: {
    backgroundColor: "#1A3A1A", // Dark green
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  errorMessage: {
    backgroundColor: "#3A1A1A", // Dark red
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  messageText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: "#EAEAEA", // Light text for messages
  },
  submitButton: {
    backgroundColor: "#B22222",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: "#4A4A4A", // Darker disabled state
    elevation: 0,
  },
  submitText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default CommunityEvent;