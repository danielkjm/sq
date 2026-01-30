import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const StyledImage = cssInterop(Image, { className: 'style' });

export default function ChatScreen() {
  return (
    <ThemedView className="flex-1 items-center justify-center gap-3 p-6">
      <StyledImage
        source={require('@/assets/images/cube-of-notes-stack (1).svg')}
        className="h-40 w-40"
        contentFit="contain"
      />
      <ThemedText type="title">Chat</ThemedText>
      <ThemedText>Placeholder content for the chat tab.</ThemedText>
    </ThemedView>
  );
}
