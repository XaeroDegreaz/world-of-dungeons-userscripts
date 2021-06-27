const attributeShortNames = {
  Strength: 'st',
  Constitution: 'co',
  Intelligence: 'in',
  Dexterity: 'dx',
  Charisma: 'ch',
  Agility: 'ag',
  Perception: 'pe',
  Willpower: 'wi'
}

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

const attributesToShortName = ( heroAttributes: HeroAttributes ) => {
  const obj: any = {};
  Object.keys( heroAttributes ).forEach( ( key: string ) => {
    obj[attributeShortNames[key]] = heroAttributes[key]
  } );
  return obj;
}

const loadHeroAttributes = async (): Promise<HeroAttributes> => {
  return await new Promise( resolve => {
    GM.xmlHttpRequest( {
      url: '/wod/spiel/hero/attributes.php',
      method: 'GET',
      synchronous: false,
      onload: ( data ) => {
        resolve( parseHeroAttributes( data ) );
      }
    } );
  } );
}

const parseHeroAttributes = ( data ): HeroAttributes => {
  const jq = $( data.responseText );
  const attributesTable = jq.find( 'table[class=content_table]' ).first();
  if ( !attributesTable.length )
  {
    console.error( 'NOPE.', attributesTable );
    throw new Error( 'NOPE' );
  }
  const attributeRows = $( attributesTable ).find( 'tr[class^=row]' )
  const rawRows = attributeRows
    .map( function () {
      const cells = $( this ).find( '> td' );
      const attributeName = cells
        .first()
        .text()
        .trim();
      const valueCell = cells
        .find( ':nth-child(2)' )
        .contents()
        .filter( function () {
          return this.nodeType == 3;
        } )
        .text()
        .trim();
      const effectiveValueCell = cells
        .find( ':nth-child(2) > span[class=effective_value]' )
        .text()
        .trim()
        .replace( /\D/g, '' );
      return {attributeName, valueCell, effectiveValueCell};
    } )
    .toArray();
  const retVal = {} as HeroAttributes;
  rawRows.forEach( x => {
    retVal[x.attributeName] = x.effectiveValueCell.length > 0 ? Number( x.effectiveValueCell ) : Number( x.valueCell );
  } );
  return retVal;
}

interface AttackRoll {
  rollType: string;
  rollCalculation: string;
  modifier: string;
}

const parseAttackRolls = ( data ): AttackRoll[] => {
  const jq = $( data );
  const markers: AttackRoll[] = jq.find( 'li' ).map( function () {
    const match = /^The (?<rollType>.+)roll is: (?<rollCalculation>.+?)( \((?<modifier>[+\-]\d*%?)\))?$/g.exec( $( this ).text() );
    if ( !match )
    {
      return;
    }
    //console.log( {match} );
    // @ts-ignore
    const {rollType, rollCalculation, modifier} = match.groups;
    //console.log( {rollType, rollCalculation, modifier} );
    return {rollType, rollCalculation, modifier};
  } ).toArray();
  //console.log( {markers} );
  return markers;
}

const calculateSkillRoll = (
  heroAttributes: HeroAttributes,
  skillName: string,
  skillLevel: number,
  rollCalculation: string,
  modifier?: string ): number => {
  //console.log( {heroAttributes, skillName, skillLevel, rollCalculation, modifier} );
  let replaced = rollCalculation.replaceAll( skillName, skillLevel.toString() ).trim();
  Object.keys( heroAttributes ).forEach( key => {
    replaced = replaced.replaceAll( key, heroAttributes[key] );
  } )
  replaced = replaced.replaceAll( 'x', '*' );
  //console.log( {replaced} );
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
  //console.log( {rollWithModifier} );
  return Math.floor( rollWithModifier );
};

const SKILL_ROLLS_STORAGE_KEY = 'com.dobydigital.userscripts.wod.displayskillrolls.skillrollslist';

async function load( key )
{
  try
  {
    const raw: string | undefined = await GM.getValue( key );
    return raw ? JSON.parse( raw ) : undefined;
  }
  catch ( e )
  {
    console.error( `Hero Selector Dropdown Userscript: Unable to load key:${key}`, e );
    return undefined;
  }
}

async function save( key, value )
{
  try
  {
    await GM.setValue( key, JSON.stringify( value ) );
  }
  catch ( e )
  {
    console.error( `Hero Selector Dropdown Userscript: Unable to save key:${key}`, e );
  }
}

const main = async () => {
  const contentTable = $( 'table[class=content_table]' );
  const body = $( contentTable ).find( '> tbody' );
  const header = $( body ).find( '> tr[class=header]' );
  $( header ).append( '<th>Base Rolls</th>' );
  const skillRows = $( body ).find( 'tr[class^=row]' );
  $( skillRows )
    .each( function () {
      const a = $( this ).find( 'a' );
      //# Re-align the skill name cell so the text doesn't look inconsistent when injecting attack rolls
      $( a ).parent().attr( 'valign', 'center' );
      $( this ).append( '<td class="roll_placeholder">-</td>' )
    } );
  const heroAttributes = await loadHeroAttributes();
  const shortAttributes = attributesToShortName( heroAttributes );
  const skillRollData = await load( SKILL_ROLLS_STORAGE_KEY ) || {};
  //console.log( {heroAttributes, shortAttributes} );
  //console.log( {header} );
  // # begin parsing rows
  $( skillRows )
    // @ts-ignore
    .each( async function (): Promise<void> {
      const row = $( this );
      $( row )
        .find( 'input[type=image]' )
        .click( async function () {
          await renderRollData( $( row ), skillRollData, shortAttributes );
        } );
      await renderRollData( $( row ), skillRollData, shortAttributes )
    } );
}

const renderRollData = async ( row, skillRollData, shortAttributes ): Promise<void> => {
  //console.log( "rendering" )
  const a = $( row ).find( 'a' );
  const skill = $( a ).text();
  const link = $( a ).attr( 'href' );
  //console.log( {skill, link} );
  const baseLevel = $( row ).find( 'div[id^=skill_rang_]' ).text().trim();
  const effectiveLevel = $( row ).find( 'span[id^=skill_eff_rang_]' ).text().replace( /\D/g, '' ).trim();
  const skillLevel = effectiveLevel.length > 0 ? Number( effectiveLevel ) : Number( baseLevel );
  if ( !skillLevel || !link )
  {
    return;
  }

  if ( !skillRollData?.[skill] )
  {
    const skillData = await new Promise( resolve => {
      GM.xmlHttpRequest( {
        url: link,
        method: 'GET',
        synchronous: false,
        onload: ( data ) => {
          resolve( data.responseText );
        }
      } );
    } );
    skillRollData[skill] = parseAttackRolls( skillData );
    await save( SKILL_ROLLS_STORAGE_KEY, skillRollData );
  }
  //console.log( "data", skillRollData[skill] );
  if ( skillRollData[skill].length === 0 )
  {
    return;
  }
  const formatted = skillRollData[skill].map( x => {
    return {
      rollType: x.rollType,
      rollValue: calculateSkillRoll( shortAttributes, skill, skillLevel, x.rollCalculation, x.modifier ),
      rollCalculation: x.rollCalculation,
      modifier: x.modifier
    };
  } );
  //console.log( {formatted} );
  $( row )
    .find( 'td[class=roll_placeholder]' )
    .replaceWith( `<td class="roll_placeholder"><table width="100%"><tbody>${
      formatted
        .map( x => {
          const modifierString = x.modifier ? `<b>(${x.modifier})</b>` : '';
          return `<tr onmouseover="return wodToolTip(this, '<b>${x.rollType}</b>: ${x.rollCalculation} ${modifierString}');">
                            <td align="left">
                                ${x.rollType}
                            </td>
                            <td align="right">
                                ${x.rollValue}
                            </td>
                            <td align="right">
                                <img alt="" border="0" src="/wod/css//skins/skin-8/images/icons/inf.gif">
                            </td>
                        </tr>`;
        } )
        .join( '' )
    }</tbody></table></td>` );
}

main().catch( console.error );
