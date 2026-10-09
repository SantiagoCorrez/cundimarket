import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Palette, Radius } from '@/constants/theme';

/** Campo de contraseña con botón para mostrar/ocultar lo escrito. */
export function PasswordInput(props: Omit<TextInputProps, 'secureTextEntry'>) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrap}>
      <TextInput
        placeholderTextColor={Palette.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
        secureTextEntry={!visible}
        style={[styles.input, props.style]}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        style={styles.eye}>
        <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={Palette.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.card,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.line,
  },
  input: { flex: 1, minWidth: 0, height: '100%', paddingLeft: 16, paddingRight: 8, fontSize: 15, color: Palette.text },
  eye: { paddingHorizontal: 14, height: '100%', alignItems: 'center', justifyContent: 'center' },
});
