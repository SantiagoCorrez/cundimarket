import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import type { News } from '@/api/types';
import { Badge, ScreenHeader } from '@/components/ui';
import { NEWS_TYPES } from '@/constants/taxonomy';
import { Palette } from '@/constants/theme';
import { timeAgo } from '@/utils/format';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [item, setItem] = useState<News | null>(null);

  useEffect(() => {
    api.get<{ news: News }>(`/api/mobile/news/${id}`).then((r) => setItem(r.news));
  }, [id]);

  if (!item) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Palette.brand} />
      </View>
    );
  }

  const t = NEWS_TYPES[item.type] ?? NEWS_TYPES.NEWS;

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background, paddingTop: insets.top }}>
      <ScreenHeader title="Noticia" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {item.imageUrl ? (
          <Image source={item.imageUrl} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ fontSize: 56 }}>{t.icon}</Text>
          </View>
        )}
        <View style={styles.body}>
          <Badge tone={item.type === 'ALERT' ? 'danger' : 'brand'}>
            {t.icon} {t.label}
          </Badge>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>
            {item.municipality} · {timeAgo(item.publishedAt)}
          </Text>
          <Text style={styles.content}>{item.body}</Text>
          {item.sourceUrl && (
            <Pressable style={styles.sourceLink} onPress={() => WebBrowser.openBrowserAsync(item.sourceUrl!)}>
              <Ionicons name="open-outline" size={16} color={Palette.brandStrong} />
              <Text style={styles.sourceText}>Ver la noticia completa en la Alcaldía de Mosquera</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.background },
  image: { height: 210, width: '100%' },
  imagePlaceholder: { height: 160, width: '100%', backgroundColor: Palette.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, gap: 4 },
  title: { fontSize: 22, fontWeight: '800', color: Palette.text, marginTop: 10, lineHeight: 28 },
  meta: { fontSize: 12, color: Palette.inkFaint, marginTop: 4 },
  content: { fontSize: 15, color: Palette.textSecondary, lineHeight: 22, marginTop: 14 },
  sourceLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22 },
  sourceText: { flex: 1, fontSize: 14, fontWeight: '700', color: Palette.brandStrong },
});
