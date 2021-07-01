import expect from 'expect';
import { describe } from 'mocha';
import { DiceRoll } from 'rpg-dice-roller';

const roll = (average: number): string => {
  const maxDiceValue = 15;
  const maxAverageBeforeMax = 7;
  if (average <= maxAverageBeforeMax) {
    const diff = maxAverageBeforeMax - average;
    const d = maxDiceValue - diff * 2;
    //# We want the min value to be 0, so we subtract 1 from dice result
    return `d${d} - 1`;
  }
  //# This flow will only be hit if the average roll is greater than the wrapping point.
  //# Get the whole number of "max dice to use"
  const numberOfMaxDice = Math.floor(average / maxAverageBeforeMax);
  //# Get the whole number remaining average that needs to be rolled (this number will be <= maxAverageBeforeMax)
  const remainingAverage = average % maxAverageBeforeMax;
  //# If remaining average = 0 (average was evenly divisible by dice wrap number) do nothing, otherwise roll remainder.
  const additionalDice = remainingAverage !== 0 ? roll(remainingAverage) : NaN;
  //# For each number of max dice, populate them in the array
  //# We subtrace the flat number of max dice from the dice throws such that each roll will be between 0 - X
  const largeDice = `${numberOfMaxDice}d${maxDiceValue} - ${numberOfMaxDice}`;
  //# If there is any remainder, add that to the end of the dice roll list.
  return additionalDice ? `${largeDice} + ${additionalDice}` : largeDice;
};

interface R {
  average: number;
  expectedNotation: string;
}

describe('t', () => {
  const values: R[] = [
    { average: 1, expectedNotation: 'd3 - 1' },
    { average: 2, expectedNotation: 'd5 - 1' },
    { average: 3, expectedNotation: 'd7 - 1' },
    { average: 4, expectedNotation: 'd9 - 1' },
    { average: 5, expectedNotation: 'd11 - 1' },
    { average: 6, expectedNotation: 'd13 - 1' },
    { average: 7, expectedNotation: 'd15 - 1' },
    { average: 8, expectedNotation: '1d15 - 1 + d3 - 1' },
    { average: 9, expectedNotation: '1d15 - 1 + d5 - 1' },
    { average: 10, expectedNotation: '1d15 - 1 + d7 - 1' },
    { average: 14, expectedNotation: '2d15 - 2' },
    { average: 15, expectedNotation: '2d15 - 2 + d3 - 1' },
    { average: 16, expectedNotation: '2d15 - 2 + d5 - 1' },
    { average: 42, expectedNotation: '6d15 - 6' },
    { average: 43, expectedNotation: '6d15 - 6 + d3 - 1' },
    { average: 44, expectedNotation: '6d15 - 6 + d5 - 1' },
    { average: 45, expectedNotation: '6d15 - 6 + d7 - 1' },
    { average: 46, expectedNotation: '6d15 - 6 + d9 - 1' },
    { average: 47, expectedNotation: '6d15 - 6 + d11 - 1' },
  ];
  values.forEach((x) => {
    const { average, expectedNotation } = x;
    it(`Average ${average}=>${expectedNotation}`, () => {
      const actual = roll(average);
      const diceRoll = new DiceRoll(actual);
      console.log({
        total: diceRoll.total,
        min: diceRoll.minTotal,
        max: diceRoll.maxTotal,
        average: diceRoll.averageTotal,
      });
      expect(actual).toEqual(expectedNotation);
      expect(diceRoll.averageTotal).toEqual(average);
    });
  });
});
