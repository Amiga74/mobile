import AsyncStorage from '@react-native-community/async-storage';
import * as RNLocalize from 'react-native-localize';
import {Observable} from 'shared/Observable';
import {Region} from 'shared/Region';

const DEFAULT_LOCALE = 'en';

enum Key {
  IsOnboarded = 'IsOnboarded',
  Locale = 'Locale',
  Region = 'Region',
}

export class StorageService {
  isOnboarding: Observable<boolean>;
  locale: Observable<string>;
  region: Observable<Region | undefined>;

  ready: Observable<boolean>;

  constructor() {
    this.isOnboarding = new Observable<boolean>(true);
    this.locale = new Observable<string>('');
    this.ready = new Observable<boolean>(false);
    this.region = new Observable<Region | undefined>(undefined);
    this.init();
  }

  setOnboarded = async (value: boolean) => {
    await AsyncStorage.setItem(Key.IsOnboarded, value ? '1' : '0');
    this.isOnboarding.set(!value);
  };

  setLocale = async (value: string) => {
    await AsyncStorage.setItem(Key.Locale, value);
    this.locale.set(value);
  };

  setRegion = async (value: Region | undefined) => {
    await AsyncStorage.setItem(Key.Region, value ? value : '');
    this.region.set(value);
  };

  private init = async () => {
    const isOnboarded = (await AsyncStorage.getItem(Key.IsOnboarded)) === '1';
    this.isOnboarding.set(!isOnboarded);

    await this.updateLocale();
    RNLocalize.addEventListener('change', () => this.updateLocale());

    const region = ((await AsyncStorage.getItem(Key.Region)) as Region | undefined) || undefined;
    this.region.set(region);

    this.ready.set(true);
  };

  private async updateLocale() {
    const locales = RNLocalize.getLocales();
    const systemLocale = locales.length > 0 ? locales[0].languageCode : null;
    const persistedLocale = await AsyncStorage.getItem(Key.Locale);
    const currentLocale = this.locale.get();
    const newLocale = currentLocale || persistedLocale || systemLocale || DEFAULT_LOCALE;

    console.log('eeeeeeeeee', currentLocale, persistedLocale, systemLocale, DEFAULT_LOCALE, newLocale);

    if (newLocale === this.locale.get()) {
      return;
    }
    this.locale.set(newLocale);
  }
}
