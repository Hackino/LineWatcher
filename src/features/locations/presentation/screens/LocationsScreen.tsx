import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { container } from 'tsyringe';
import {
  Screen,
  AppText,
  Card,
  Field,
  Chip,
  PrimaryButton,
  SectionHeader,
  ConfirmDialog,
  EmptyState,
  colors,
  radius,
  spacing,
} from '@ds';
import { useLocations, useUserData } from '@core/state';
import { shortId } from '@shared/id';
import type { RootStackParamList } from '@app/navigation/types';
import { UpsertLocation } from '../../domain/usecases/upsertLocation';
import { DeleteLocation } from '../../domain/usecases/deleteLocation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Manage all locations and their sources. */
export function LocationsScreen() {
  const navigation = useNavigation<Nav>();
  const data = useUserData();
  const locations = useLocations();
  const [newLabel, setNewLabel] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(
    null,
  );

  if (!data) return <Screen title="Locations" eyebrow="Metering">{null}</Screen>;

  const addLocation = async () => {
    const label = newLabel.trim();
    if (!label) return;
    const id = shortId('loc');
    await container.resolve(UpsertLocation).execute({
      id,
      label,
      timezone: data.settings.timezone,
      createdAt: new Date().toISOString(),
    });
    setNewLabel('');
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { id } = pendingDelete;
    setPendingDelete(null);
    await container.resolve(DeleteLocation).execute(id);
  };

  return (
    <Screen title="Locations" eyebrow="Metering" back>
      <Card style={styles.addCard}>
        <SectionHeader title="Add a location" />
        <Field
          label="Label"
          value={newLabel}
          onChangeText={setNewLabel}
          placeholder="e.g. Beach house"
          autoCapitalize="sentences"
        />
        <PrimaryButton label="Add location" icon="＋" onPress={addLocation} disabled={!newLabel.trim()} />
      </Card>

      {locations.length === 0 ? (
        <EmptyState
          title="No locations yet"
          message="Add a location to start tracking its electricity sources."
        />
      ) : (
        locations.map((loc) => {
          const sources = Object.values(data.sources).filter(
            (s) => s.locationId === loc.id,
          );
          return (
            <Card key={loc.id} style={styles.locationCard}>
              <View style={styles.locationHead}>
                <AppText variant="h2" color={colors.text}>
                  {loc.label}
                </AppText>
                <Pressable
                  onPress={() => setPendingDelete({ id: loc.id, label: loc.label })}
                  hitSlop={8}
                  accessibilityLabel={`Delete ${loc.label}`}
                  style={styles.deleteBtn}
                >
                  <AppText variant="label" color={colors.textMuted}>
                    Delete
                  </AppText>
                </Pressable>
              </View>

              <View style={styles.sourceList}>
                {sources.length === 0 ? (
                  <AppText variant="body" color={colors.textFaint}>
                    No sources yet.
                  </AppText>
                ) : (
                  sources.map((s) => (
                    <Pressable
                      key={s.id}
                      onPress={() =>
                        navigation.navigate('SourceEditor', {
                          sourceId: s.id,
                          locationId: loc.id,
                        })
                      }
                    >
                      {({ pressed }) => (
                        <View style={[styles.sourceRow, pressed && styles.pressed]}>
                          <View style={styles.sourceRowText}>
                            <AppText variant="title" color={colors.text}>
                              {s.label}
                            </AppText>
                            <AppText variant="label" color={colors.textFaint}>
                              {s.ratePerKwh} {data.profile.currency} / kWh
                            </AppText>
                          </View>
                          <Chip label={s.type} tone="neutral" />
                        </View>
                      )}
                    </Pressable>
                  ))
                )}
              </View>

              <PrimaryButton
                label="Add source"
                icon="＋"
                variant="ghost"
                onPress={() =>
                  navigation.navigate('SourceEditor', { locationId: loc.id })
                }
              />
            </Card>
          );
        })
      )}

      <ConfirmDialog
        visible={pendingDelete !== null}
        eyebrow="Location"
        title={`Delete ${pendingDelete?.label ?? ''}?`}
        message="Sources and readings under this location will also be removed."
        confirmLabel="Delete"
        cancelLabel="Keep"
        tone="danger"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  addCard: { gap: spacing.md },
  locationCard: { gap: spacing.md },
  locationHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deleteBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  sourceList: { gap: spacing.sm },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.panel,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sourceRowText: { flex: 1, gap: 2 },
  pressed: { opacity: 0.7 },
});
