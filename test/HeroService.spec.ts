import expect from 'expect';
import * as fs from 'fs';
import * as JSDOM from 'jsdom';
import { describe, it } from 'mocha';
import { HeroAttributes } from '../src/userscripts/display-skill-rolls/HeroAttributes';
import { HeroService } from '../src/userscripts/display-skill-rolls/HeroService';

// @ts-ignore
global.$ = require('jquery')(new JSDOM.JSDOM().window);
describe('does stuff', () => {
  it('does something', async () => {
    const hs = new HeroService();
    const r = fs.readFileSync(__dirname + '/resources/attributes.html');
    const parsed: HeroAttributes = hs.parseHeroAttributes(r.toString());
    expect(parsed).toEqual({
      Strength: 4,
      Constitution: 3,
      Intelligence: 6,
      Dexterity: 1,
      Charisma: 1,
      Agility: 4,
      Perception: 2,
      Willpower: 6,
    });
    expect(hs.attributesToShortName(parsed)).toEqual({
      st: 4,
      co: 3,
      in: 6,
      dx: 1,
      ch: 1,
      ag: 4,
      pe: 2,
      wi: 6,
    });
  });
});
