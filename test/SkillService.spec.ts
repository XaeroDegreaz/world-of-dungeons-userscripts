import expect from 'expect';
import fs from 'fs';
import JSDOM from 'jsdom';
import { describe, it } from 'mocha';
import { SkillRoll } from '../src/userscripts/display-skill-rolls/SkillRoll';
import { SkillService } from '../src/userscripts/display-skill-rolls/SkillService';
// @ts-ignore
global.$ = require('jquery')(new JSDOM.JSDOM().window);

describe('parse skill rolls', () => {
  it('parses knife combat correctly', () => {
    const hs = new SkillService();
    const r = fs.readFileSync(__dirname + '/resources/knife-combat.html');
    const parsed: SkillRoll[] = hs.parseSkillRolls(r.toString());
    expect(parsed).toEqual([
      {
        rollType: 'attack',
        rollCalculation: '2 x ag + pe + 2 x Knife Combat',
        modifier: undefined,
      },
      {
        rollType: 'defense',
        rollCalculation: '2 x ag + pe + 2 x Knife Combat',
        modifier: undefined,
      },
      {
        rollType: 'damage',
        rollCalculation: 'st / 2 + ag / 3 + Knife Combat / 2',
        modifier: undefined,
      },
    ]);
  });

  it('parses blunderbuss combat correctly', () => {
    const hs = new SkillService();
    const r = fs.readFileSync(__dirname + '/resources/blunderbuss.html');
    const parsed: SkillRoll[] = hs.parseSkillRolls(r.toString());
    expect(parsed).toEqual([
      {
        rollType: 'attack',
        rollCalculation: '2 x pe + dx + 2 x Blunderbuss',
        modifier: '+0',
      },
      {
        rollType: 'damage',
        rollCalculation: 'in / 2 + pe / 3 + Blunderbuss / 2',
        modifier: '-40%',
      },
    ]);
  });
});

describe('calculate skill rolls', () => {
  const hs = new SkillService();
  const heroAttributes = {
    st: 4,
    co: 3,
    in: 6,
    dx: 1,
    ch: 1,
    ag: 4,
    pe: 2,
    wi: 6,
  };
  const skillName = 'Knife Combat';
  const skillLevel = 5;
  [
    {
      rollCalculation: '2 x ag + pe + 2 x Knife Combat',
      modifier: undefined,
      expected: 20,
    },
    {
      rollCalculation: '2 x ag + pe + 2 x Knife Combat',
      modifier: undefined,
      expected: 20,
    },
    {
      rollCalculation: 'st / 2 + ag / 3 + Knife Combat / 2',
      modifier: undefined,
      expected: 5,
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '+0',
      expected: 15,
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '-0',
      expected: 15,
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '+6',
      expected: 21,
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '-6',
      expected: 9,
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '+0%',
      expected: 15,
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '-0%',
      expected: 15,
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '-10%',
      expected: 13,
    },
    {
      rollCalculation: '2 x pe + dx + 2 x Knife Combat',
      modifier: '+10%',
      expected: 16,
    },
  ].forEach((x) => {
    it(`can calculate ${x.rollCalculation} ${x.modifier}`, () => {
      const result = hs.calculateSkillRoll(heroAttributes, skillName, skillLevel, x.rollCalculation, x.modifier);
      expect(result).toEqual(x.expected);
    });
  });
});
