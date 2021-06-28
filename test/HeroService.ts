let $;

export class HeroService {
  constructor( _$ )
  {
    $ = _$;
  }

  public static readonly attributeShortNames = {
    Strength: 'st',
    Constitution: 'co',
    Intelligence: 'in',
    Dexterity: 'dx',
    Charisma: 'ch',
    Agility: 'ag',
    Perception: 'pe',
    Willpower: 'wi'
  }

  public static attributesToShortName( heroAttributes )
  {
    const obj = {};
    Object.keys( heroAttributes ).forEach( key => {
      obj[this.attributeShortNames[key]] = heroAttributes[key]
    } );
    return obj;
  }

  parsHeroAttributes( data: string ): any
  {
    const jq = $( data );
    const attributesTable = jq.find( 'table[class=content_table]' ).first();
    if ( !attributesTable.length )
    {
      console.error( 'NOPE.', attributesTable );
      return;
    }
    const attributeRows = $( attributesTable ).find( 'tr[class^=row]' )
    console.log( attributeRows );
    const rawRows = attributeRows
      .map( function () {
        const cells = $( this ).find( '> td' );
        const attributeName = cells
          .first()
          .text()
          .trim();
        console.log( {attributeName} );
        const valueCell = cells
          .find( ':nth-child(2)' )
          .contents()
          .filter( function () {
            return this.nodeType == 3;
          } )
          .text()
          .trim();
        console.log( {valueCell} )
        const effectiveValueCell = cells
          .find( ':nth-child(2) > span[class=effective_value]' )
          .text()
          .trim()
          .replace( /\D/g, '' );
        console.log( {effectiveValueCell} );
        return {attributeName, valueCell, effectiveValueCell};
      } )
      .toArray();
    const retVal = {};
    rawRows.forEach( x => {
      retVal[x.attributeName] = x.effectiveValueCell.length > 0 ? Number( x.effectiveValueCell ) : Number( x.valueCell );
    } );
    console.log( {retVal} );
    return retVal;
  }

  parseAttackRolls( data )
  {
    const jq = $( data );
    const markers = jq.find( 'li' ).map( function () {
      const match = /^The (?<rollType>.+)roll is: (?<rollCalculation>.+?)( \((?<modifier>[+\-]\d*%?)\))?$/g.exec( $( this ).text() );
      if ( !match )
      {
        return;
      }
      console.log( {match} );
      // @ts-ignore
      const {rollType, rollCalculation, modifier} = match.groups;
      console.log( {rollType, rollCalculation, modifier} );
      return {rollType, rollCalculation, modifier};
    } ).toArray();
    console.log( {markers} );
    return markers;
  }

  calculateSkillRoll( heroAttributes, skillName, skillLevel, rollCalculation, modifier )
  {
    console.log( {heroAttributes, skillName, skillLevel, rollCalculation, modifier} );
    let replaced = rollCalculation.replaceAll( skillName, skillLevel ).trim();
    Object.keys( heroAttributes ).forEach( key => {
      replaced = replaced.replaceAll( key, heroAttributes[key] );
    } )
    replaced = replaced.replaceAll( 'x', '*' );
    console.log( {replaced} );
    const roll = eval( replaced );
    const modifierAsNumber = Number( modifier?.replaceAll( /\D/g, '' ) );
    const modifierAsFraction = modifierAsNumber / 100;
    const rollWithModifier = modifier
                             ? modifier.endsWith( '%' )
                               ? modifier.startsWith( '+' )
                                 ? roll * (1 + modifierAsFraction)
                                 : roll * (1 - modifierAsFraction)
                               : modifier.startsWith( '+' )
                                 ? roll + modifierAsNumber
                                 : roll - modifierAsNumber
                             : roll
    return Math.floor( rollWithModifier );
  }
}
