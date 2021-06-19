// ==UserScript==
// @name         Hero Switcher Dropdown
// @namespace    com.dobydigital.userscripts.wod
// @version      2021.06.19.0
// @description  Adds a hero selection dropdown at the top of all pages. Not all skins are supported.
// @author       XaeroDegreaz
// @supportUrl   https://github.com/XaeroDegreaz/world-of-dungeons-userscripts/issues
// @source       https://raw.githubusercontent.com/XaeroDegreaz/world-of-dungeons-userscripts/main/src/hero-switcher-dropdown.js
// @match        http*://*.world-of-dungeons.net/wod/spiel*
// @icon         http://info.world-of-dungeons.net/wod/css/WOD.gif
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  'use strict';

  const targetElement = $( 'td[class="gadget_table_cell merged"]' );
  if ( !targetElement.length )
  {
    console.error( `Character Selector Dropdown Userscript: Unable to find target element for dropdown.`, targetElement );
    return;
  }
  const SESSION_HERO_ID_KEY = 'session_hero_id';

  GM_xmlhttpRequest( {
    url: '/wod/spiel/settings/heroes.php',
    synchronous: false,
    onload: ( data ) => {
      const jq = $( data.responseText );
      const inputs = jq.find( 'input[name=FIGUR]' );
      if ( !inputs.length )
      {
        console.error( 'Character Selector Dropdown Userscript: Unable to find hero list inputs on "heroes" page.', inputs );
        return;
      }
      const heroes = inputs.map( function () {
        const characterId = $( this ).val();
        const characterName = $( this ).parent().find( 'a' ).text();
        return {characterId, characterName};
      } ).toArray();
      displayHeroSelector( heroes );
    }
  } );

  const displayHeroSelector = ( heroes ) => {
    //# We could process the query parameters ahead of time, but, for a small amount of efficiency, I think it's best to defer so it can be done asynchronously.
    const rawVars = getUrlVars();
    //# We want to capture all query parameters so they can be passed when changing users. We don't want the session_hero_id, because we will be replacing that.
    const urlVars = rawVars.filter( key => key !== SESSION_HERO_ID_KEY );
    const currentSessionHeroId = rawVars[SESSION_HERO_ID_KEY];
    //# Location without any query parameters
    const location = window.location.href.split( '?' )[0];
    const remainingQueryParameters = urlVars.map( x => `${x}=${rawVars[x]}` ).join( '&' );
    const querystring = urlVars.length > 0 ? `&${remainingQueryParameters}` : '';
    //# Begin generating new DOM elements.
    const newDiv = $( '<div class="gadget"><label for="xaerodegreaz_userscript_hero_select">Switch Hero: </label></div>' );
    const options = heroes
      .map(
        ( hero ) => {
          const selected = hero.characterId === currentSessionHeroId ? 'selected' : '';
          return `<option ${selected} value="${location}?${SESSION_HERO_ID_KEY}=${hero.characterId}${querystring}">${hero.characterName}</option>`;
        } )
      .join( '' );
    const select = $( `<select id="xaerodegreaz_userscript_hero_select">${options}</select>` ).change( function () {
      window.location.href = $( this ).val();
    } );
    newDiv.append( select );
    targetElement.prepend( newDiv );
  }

  const getUrlVars = () => {
    const vars = [];
    let hash;
    const hashes = window.location.href.slice( window.location.href.indexOf( '?' ) + 1 ).split( '&' );
    for ( let i = 0; i < hashes.length; i++ )
    {
      hash = hashes[i].split( '=' );
      vars.push( hash[0] );
      vars[hash[0]] = hash[1];
    }
    return vars;
  }
})();
