import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText, Card, colors, radius, spacing } from '@ds';
import { monthLabel } from '@shared/format';
import { monthKey } from '@core/domain/services';
import type { Profile } from '@core/model';

interface ProfileCardProps {
  profile: Profile;
}

function emailLocal(email: string): string {
  const at = email.indexOf('@');
  return at > 0 ? email.slice(0, at) : email;
}

function initialFor(profile: Profile): string {
  const source = profile.displayName?.trim() || emailLocal(profile.email);
  return (source[0] ?? '?').toUpperCase();
}

/** Identity block at the top of Settings — avatar, name, email, since. */
export function ProfileCard({ profile }: ProfileCardProps) {
  const title = profile.displayName?.trim() || emailLocal(profile.email);
  const since = profile.createdAt ? monthLabel(monthKey(profile.createdAt)) : null;

  return (
    <Card glowColor={colors.accent} style={styles.card}>
      <View style={styles.avatar}>
        <AppText variant="h1" color={colors.accent} style={styles.avatarText}>
          {initialFor(profile)}
        </AppText>
      </View>
      <View style={styles.body}>
        <AppText variant="caption" color={colors.accent} uppercase>
          Profile
        </AppText>
        <AppText variant="h2" color={colors.text} numberOfLines={1}>
          {title}
        </AppText>
        <AppText variant="body" color={colors.textMuted} numberOfLines={1}>
          {profile.email}
        </AppText>
        {since ? (
          <AppText variant="label" color={colors.textFaint}>
            Since {since}
          </AppText>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.accentDim,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    lineHeight: 56,
    textAlign: 'center',
    width: '100%',
  },
  body: { flex: 1, gap: 2 },
});
