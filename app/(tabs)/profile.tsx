import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProfileScreen() {
  return (
    <ThemedView className="flex-1 items-center justify-center gap-2 p-6">
      <ThemedText type="title">Profile</ThemedText>
      <ThemedText>Placeholder content for the profile tab.</ThemedText>
    </ThemedView>
  );
}
