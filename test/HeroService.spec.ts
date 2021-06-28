import expect from 'expect';
import * as fs from 'fs';
import * as JSDOM from "jsdom";
import {describe, it} from 'mocha';
import {HeroService} from "./HeroService";

const $ = require( "jquery" )( new JSDOM.JSDOM().window );

interface HeroAttributes {
  Strength: number;
  Constitution: number;
  Intelligence: number;
  Dexterity: number;
  Charisma: number;
  Agility: number;
  Perception: number;
  Willpower: number;
}

describe( 'does stuff', () => {
  it( 'does something', async () => {
    const hs = new HeroService( $ );
    const r = fs.readFileSync( __dirname + '/resources/attributes.html' );
    const parsed: HeroAttributes = hs.parsHeroAttributes( r.toString() );
    expect( parsed ).toEqual( {
      Strength: 4,
      Constitution: 3,
      Intelligence: 6,
      Dexterity: 1,
      Charisma: 1,
      Agility: 4,
      Perception: 2,
      Willpower: 6
    } );
    expect( HeroService.attributesToShortName( parsed ) ).toEqual( {
      st: 4,
      co: 3,
      in: 6,
      dx: 1,
      ch: 1,
      ag: 4,
      pe: 2,
      wi: 6
    } )
  } )
} );

interface AttackRoll {
  rollType: string;
  rollCalculation: string;
}

describe( 'parse skill rolls', () => {
  it( 'parses knife combat correctly', () => {
    const hs = new HeroService( $ );
    const r = fs.readFileSync( __dirname + '/resources/knife-combat.html' );
    const parsed: AttackRoll[] = hs.parseAttackRolls( r.toString() )
    expect( parsed ).toEqual( [
      {rollType: 'attack', rollCalculation: '2 x ag + pe + 2 x Knife Combat', modifier: undefined},
      {rollType: 'defense', rollCalculation: '2 x ag + pe + 2 x Knife Combat', modifier: undefined},
      {rollType: 'damage', rollCalculation: 'st / 2 + ag / 3 + Knife Combat / 2', modifier: undefined},
    ] );
  } );

  it( 'parses blunderbuss combat correctly', () => {
    const hs = new HeroService( $ );
    const r = fs.readFileSync( __dirname + '/resources/blunderbuss.html' );
    const parsed: AttackRoll[] = hs.parseAttackRolls( r.toString() )
    expect( parsed ).toEqual( [
      {rollType: 'attack', rollCalculation: '2 x pe + dx + 2 x Blunderbuss', modifier: '+0'},
      {rollType: 'damage', rollCalculation: 'in / 2 + pe / 3 + Blunderbuss / 2', modifier: '-40%'},
    ] );
  } )
} )

describe( 'calculate skill rolls', () => {
  const hs = new HeroService( $ );
  const heroAttributes = {
    st: 4,
    co: 3,
    in: 6,
    dx: 1,
    ch: 1,
    ag: 4,
    pe: 2,
    wi: 6
  }
  const skillName = 'Knife Combat';
  const skillLevel = 5;
  [
    {
      rollCalculation: '2 x ag + pe + 2 x Knife Combat',
      modifier: undefined,
      expected: 20
    },
    {
      rollCalculation: '2 x ag + pe + 2 x Knife Combat',
      modifier: undefined,
      expected: 20
    },
    {
      rollCalculation: 'st / 2 + ag / 3 + Knife Combat / 2',
      modifier: undefined,
      expected: 5
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '+0',
      expected: 15
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '-0',
      expected: 15
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '+6',
      expected: 21
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '-6',
      expected: 9
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '+0%',
      expected: 15
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '-0%',
      expected: 15
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '-10%',
      expected: 13
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '+10%',
      expected: 16
    },
  ].forEach( x => {
    it( `can calculate ${x.rollCalculation} ${x.modifier}`, () => {
      const result = hs.calculateSkillRoll( heroAttributes, skillName, skillLevel, x.rollCalculation, x.modifier );
      expect( result ).toEqual( x.expected );
    } )
  } );
} )
