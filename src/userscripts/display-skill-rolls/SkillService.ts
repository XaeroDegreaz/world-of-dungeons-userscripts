import {HeroAttributesShortName} from "./HeroAttributes";
import {SkillRoll} from "./SkillRoll";

export class SkillService {
  parseSkillRolls( skillHtml: string ): SkillRoll[]
  {
    const jq = $( skillHtml )
    const attackRolls = jq.find( 'li' ).map( function () {
      const match = /^The (?<rollType>.+)roll is: (?<rollCalculation>.+?)( \((?<modifier>[+\-]\d*%?)\))?$/g.exec( $( this ).text() )
      if ( !match )
      {
        return
      }
      //console.log( {match} );
      //console.log( {rollType, rollCalculation, modifier} );
      // @ts-ignore
      const {rollType, rollCalculation, modifier} = match.groups
      return {rollType, rollCalculation, modifier}
    } ).toArray()
    //console.log( {attackRolls} );
    return attackRolls
  }

  calculateSkillRoll(
    heroAttributes: HeroAttributesShortName,
    skillName: string,
    skillLevel: number,
    rollCalculation: string,
    modifier?: string ): number
  {
    //console.log( {heroAttributes, skillName, skillLevel, rollCalculation, modifier} );
    let replaced = rollCalculation.replaceAll( skillName, skillLevel.toString() ).trim()
    Object.keys( heroAttributes ).forEach( key => {
      replaced = replaced.replaceAll( key, heroAttributes[key].toString() )
    } )
    replaced = replaced.replaceAll( 'x', '*' )
    //console.log( {replaced} );
    const roll = eval( replaced )
    const modifierAsNumber = Number( modifier?.replaceAll( /\D/g, '' ) )
    const modifierAsFraction = modifierAsNumber / 100
    const rollWithModifier = modifier
                             ? modifier.endsWith( '%' )
                               ? modifier.startsWith( '+' )
                                 ? roll * (1 + modifierAsFraction)
                                 : roll * (1 - modifierAsFraction)
                               : modifier.startsWith( '+' )
                                 ? roll + modifierAsNumber
                                 : roll - modifierAsNumber
                             : roll
    //console.log( {rollWithModifier} );
    return Math.floor( rollWithModifier )
  }
}
