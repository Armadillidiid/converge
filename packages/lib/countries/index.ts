import countryStateJSON from "./countries-states.json" with { type: "json" };

export type Country = {
  name: string;
  dial_code: string;
  code: string;
};

type Timezone = {
  zoneName: string;
  gmtOffset: number;
  gmtOffsetName: string;
  abbreviation: string;
  tzName: string;
};

type Translations = Partial<{
  kr: string;
  "pt-B": string;
  pt: string;
  nl: string;
  hr: string;
  fa: string;
  de: string;
  es: string;
  fr: string;
  ja: string;
  it: string;
  cn: string;
  tr: string;
}>;

export type State = {
  id: number;
  name: string;
  state_code: string;
  latitude: string | null;
  longitude: string | null;
  type: string | null;
};

export type CountryState = {
  name: string;
  iso3: string;
  iso2: string;
  numeric_code: string;
  phone_code: string;
  capital: string;
  currency: string;
  currency_name: string;
  currency_symbol: string;
  tld: string;
  native: string | null;
  region: string;
  region_id: string | null;
  subregion: string;
  subregion_id: string | null;
  nationality: string;
  timezones: Timezone[] | null;
  translations: Translations;
  latitude: string;
  longitude: string;
  emoji: string;
  emojiU: string;
  states: State[];
  continent_code: string;
};

export const countriesWithState: CountryState[] = countryStateJSON;
