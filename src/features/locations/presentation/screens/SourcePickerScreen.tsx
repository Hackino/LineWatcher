import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Screen,
  AppText,
  Card,
  EmptyState,
  PrimaryButton,
  colors,
  radius,
  spacing,
} from '@ds';
import {
  useLocations,
  useMeterStore,
  useUserData,
} from '@core/state';
import type { RootStackParamList } from '@app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Full-screen source selector reached from the header chip on any screen. */
export function SourcePickerScreen() {
  const navigation = useNavigation<Nav>();
  const data = useUserData();
  const locations = useLocations();
  const selectSource = useMeterStore((s) => s.selectSource);
  const selectedId = useMeterStore((s) => s.selectedSourceId);

  if (!data) return <Screen title="Choose source" eyebrow="Context" scroll={false}>{null}</Screen>;

  const pick = (sourceId: string) => {
    selectSource(sourceId);
    navigation.goBack();
  };

  if (locations.length === 0) {
    return (
      <Screen title="Choose source" eyebrow="Context">
        <EmptyState
          title="No locations yet"
          message="Add a location and a source to start tracking."
        >
          <PrimaryButton
            label="Manage locations"
            onPress={() => {
              navigation.goBack();
              navigation.navigate('Locations');
            }}
          />
        </EmptyState>
      </Screen>
    );
  }

  return (
    <Screen title="Choose source" eyebrow="Context">
      {locations.map((loc) => {
        const sources = Object.values(data.sources).filter(
          (s) => s.locationId === loc.id,
        );
        return (
          <View key={loc.id} style={styles.group}>
            <AppText variant="caption" color={colors.accent} uppercase>
              {loc.label}
            </AppText>
            {sources.length === 0 ? (
              <Card>
                <AppText variant="body" color={colors.textMuted}>
                  No sources under this location.
                </AppText>
              </Card>
            ) : (
              sources.map((s) => {
                const selected = s.id === selectedId;
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => pick(s.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${loc.label} · ${s.label}`}
                  >
                    {({ pressed }) => (
                      <Card
                        style={[
                          styles.row,
                          selected && styles.rowSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={styles.rowText}>
                          <AppText variant="title" color={colors.text}>
                            {s.label}
                          </AppText>
                          <AppText variant="label" color={colors.textFaint}>
                            {s.type} · rate {s.ratePerKwh} / kWh
                          </AppText>
                        </View>
                        {selected ? (
                          <AppText variant="caption" color={colors.accent} uppercase>
                            Selected
                          </AppText>
                        ) : null}
                      </Card>
                    )}
                  </Pressable>
                );
              })
            )}
          </View>
        );
      })}

      <PrimaryButton
        label="Manage locations & sources"
        variant="ghost"
        onPress={() => {
          navigation.goBack();
          navigation.navigate('Locations');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: { flex: 1, gap: 2 },
  rowSelected: { borderColor: colors.accent, borderWidth: 1, borderRadius: radius.md },
  pressed: { opacity: 0.7 },
});
