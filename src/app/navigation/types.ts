import type { NavigatorScreenParams } from '@react-navigation/native';

export type AppTabsParamList = {
  Home: undefined;
  History: undefined;
  Analytics: undefined;
  Leak: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Tabs: NavigatorScreenParams<AppTabsParamList>;
  AddReading: undefined;
  ReadingDetail: { readingId: string };
  MonthlyRates: { sourceId: string };
  Locations: undefined;
  SourceEditor: { sourceId?: string; locationId: string };
  SourcePicker: undefined;
};
