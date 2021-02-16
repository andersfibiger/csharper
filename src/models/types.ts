export interface UnitUnderTest {
  name: string;
  type: string;
}

export interface Searcher {
  count: number;
  searchCharacter: SearchCharacter;
}

export type SearchCharacter = ',' | '-';
