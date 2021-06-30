import expect from 'expect';
import { describe } from 'mocha';
import { DiceRoll } from 'rpg-dice-roller';

const roll = ( average: number ): string => {
  const maxDiceValue = 15;
  const maxAverageBeforeMax = 7;
  if ( average <= maxAverageBeforeMax )
  {
    const diff = maxAverageBeforeMax - average;
    const d = maxDiceValue - diff * 2;
    return `d${d}`;
  }
  //# This flow will only be hit if the average roll is greater than the wrapping point.
  //# Get the whole number of "max dice to use"
  const numberOfMaxDice = Math.floor( average / maxAverageBeforeMax );
  //# Get the whole number remaining average that needs to be rolled (this number will be <= maxAverageBeforeMax)
  const remainingAverage = average % maxAverageBeforeMax;
  //# If remaining average = 0 (average was evenly divisible by dice wrap number) do nothing, otherwise roll remainder.
  const additionalDice = remainingAverage !== 0 ? roll( remainingAverage ) : NaN;
  //# For each number of max dice, populate them in the array
  const largeDice = `${numberOfMaxDice}d${maxDiceValue}`; //[...Array( numberOfMaxDice )].map( ( _ ) => maxDiceValue );
  //# If there is any remainder, add that to the end of the dice roll list.
  return additionalDice ? `${largeDice} + ${additionalDice}` : largeDice; // : largeDice;
};

interface R {
  average: number;
  dice: string;
}

describe( 't', () => {
  const values: R[] = [
    { average: 1, dice: 'd3' },
    { average: 2, dice: 'd5' },
    { average: 3, dice: 'd7' },
    { average: 4, dice: 'd9' },
    { average: 5, dice: 'd11' },
    { average: 6, dice: 'd13' },
    { average: 7, dice: 'd15' },
    { average: 8, dice: '1d15 + d3' },
    { average: 9, dice: '1d15 + d5' },
    { average: 10, dice: '1d15 + d7' },
    { average: 14, dice: '2d15' },
    { average: 15, dice: '2d15 + d3' },
    { average: 16, dice: '2d15 + d5' },
    { average: 42, dice: '6d15' },
    { average: 43, dice: '6d15 + d3' },
    { average: 44, dice: '6d15 + d5' },
    { average: 45, dice: '6d15 + d7' },
    { average: 46, dice: '6d15 + d9' },
    { average: 47, dice: '6d15 + d11' },
  ];
  values.forEach( ( x ) => {
    const { average, dice } = x;
    it( `Average ${average}=>${dice}`, () => {
      expect( roll( average ) ).toEqual( dice );
      console.log( new DiceRoll( dice ).total )
    } );
  } );
} );
