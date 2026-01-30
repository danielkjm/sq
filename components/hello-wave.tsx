import Animated from 'react-native-reanimated';
import { cssInterop } from 'nativewind';

const AnimatedText = cssInterop(Animated.Text, { className: 'style' });

export function HelloWave() {
  return (
    <AnimatedText
      className="text-[28px] leading-8 -mt-1.5"
      style={{
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      👋
    </AnimatedText>
  );
}
