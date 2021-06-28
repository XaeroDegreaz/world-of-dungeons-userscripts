export type HeroAttributesShortName = { [shortAttributeName: string]: number }

export interface HeroAttributes {
  Strength: number;
  Constitution: number;
  Intelligence: number;
  Dexterity: number;
  Charisma: number;
  Agility: number;
  Perception: number;
  Willpower: number;
}

export enum AttributeShortNames {
  Strength = 'st',
  Constitution = 'co',
  Intelligence = 'in',
  Dexterity = 'dx',
  Charisma = 'ch',
  Agility = 'ag',
  Perception = 'pe',
  Willpower = 'wi'
}
