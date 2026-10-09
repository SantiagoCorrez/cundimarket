import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CommerceExplorer } from '@/components/commerce-explorer';
import { ScreenHeader } from '@/components/ui';
import { Palette } from '@/constants/theme';

export default function ComerciosScreen() {
  const insets = useSafeAreaInsets();
  const { category } = useLocalSearchParams<{ category?: string }>();

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title="Comercios" />
      <CommerceExplorer mode="browse" initialCategory={category} topInset={false} />
    </View>
  );
}
