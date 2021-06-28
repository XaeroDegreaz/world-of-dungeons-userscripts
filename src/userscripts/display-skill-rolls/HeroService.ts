import {AttributeShortNames, HeroAttributes, HeroAttributesShortName} from "./HeroAttributes";

export class HeroService {
  attributesToShortName( heroAttributes: HeroAttributes ): HeroAttributesShortName
  {
    const obj: any = {}
    Object.keys( heroAttributes ).forEach( ( key: string ) => {
      // @ts-ignore
      obj[AttributeShortNames[key]] = heroAttributes[key]
    } )
    return obj
  }

  parseHeroAttributes( heroAttributesHtml: string ): HeroAttributes
  {
    const jq = $( heroAttributesHtml )
    const attributesTable = jq.find( 'table[class=content_table]' ).first()
    if ( !attributesTable.length )
    {
      console.error( 'NOPE.', attributesTable )
      throw new Error( 'NOPE' )
    }
    const attributeRows = $( attributesTable ).find( 'tr[class^=row]' )
    const rawRows = attributeRows
      .map( function () {
        const cells = $( this ).find( '> td' )
        const attributeName = cells
          .first()
          .text()
          .trim()
        const valueCell = cells
          .find( ':nth-child(2)' )
          .contents()
          .filter( function () {
            return this.nodeType == 3
          } )
          .text()
          .trim()
        const effectiveValueCell = cells
          .find( ':nth-child(2) > span[class=effective_value]' )
          .text()
          .trim()
          .replace( /\D/g, '' )
        return {attributeName, valueCell, effectiveValueCell}
      } )
      .toArray()
    const heroAttributes = {} as HeroAttributes
    rawRows.forEach( x => {
      // @ts-ignore
      heroAttributes[x.attributeName] = x.effectiveValueCell.length > 0 ? Number( x.effectiveValueCell ) : Number( x.valueCell )
    } )
    return heroAttributes
  }

}
