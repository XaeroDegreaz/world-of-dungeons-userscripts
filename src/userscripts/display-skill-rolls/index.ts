import { loadFromStorage, saveToStorage } from '../../utils/PersistanceUtil';
import { HeroAttributes, HeroAttributesShortName } from './heroAttributes';
import { HeroService } from './HeroService';
import { RawSkillRollData } from './RawSkillRollData';
import { SkillRoll } from './SkillRoll';
import { SkillService } from './SkillService';

const SKILL_ROLLS_STORAGE_KEY =
  'com.dobydigital.userscripts.wod.displayskillrolls.skillrollslist';
const heroService = new HeroService();
const skillService = new SkillService();

const main = async () => {
  const contentTable = $('table[class=content_table]');
  const body = $(contentTable).find('> tbody');
  const header = $(body).find('> tr[class=header]');
  $(header).append('<th>Base Rolls</th>');
  const skillRows = $(body).find('tr[class^=row]');
  $(skillRows).each(function () {
    const a = $(this).find('a');
    //# Re-align the skill name cell so the text doesn't look inconsistent when injecting attack rolls
    $(a).parent().attr('valign', 'center');
    $(this).append('<td class="roll_placeholder">-</td>');
  });
  const heroAttributes = await fetchHeroAttributes();
  const shortAttributes = heroService.attributesToShortName(heroAttributes);
  const skillRollData: RawSkillRollData =
    (await loadFromStorage(SKILL_ROLLS_STORAGE_KEY)) || {};
  //console.log( {heroAttributes, shortAttributes} );
  //console.log( {header} );
  $(skillRows)
    // @ts-ignore
    .each(async function (): Promise<void> {
      const row = $(this);
      //# Add a click listener that will re-render the skill roll information when increasing/decreasing skill.
      $(row)
        .find('input[type=image]')
        .on('click', async function () {
          await renderRollData($(row), skillRollData, shortAttributes);
        });
      await renderRollData($(row), skillRollData, shortAttributes);
    });
};

const fetchHeroAttributes = async (): Promise<HeroAttributes> => {
  return new Promise((resolve) => {
    GM.xmlHttpRequest({
      url: '/wod/spiel/hero/attributes.php',
      method: 'GET',
      synchronous: false,
      onload: (data) => {
        resolve(heroService.parseHeroAttributes(data.responseText));
      },
    });
  });
};

async function fetchSkillData(link: string): Promise<SkillRoll[]> {
  return new Promise((resolve) => {
    GM.xmlHttpRequest({
      url: link,
      method: 'GET',
      synchronous: false,
      onload: (data) => {
        resolve(skillService.parseSkillRolls(data.responseText));
      },
    });
  });
}

const renderRollData = async (
  row: JQuery,
  skillRollData: RawSkillRollData,
  shortAttributes: HeroAttributesShortName
): Promise<void> => {
  //console.log( "rendering" )
  const a = $(row).find('a');
  const skill = $(a).text();
  const link = $(a).attr('href');
  //console.log( {skill, link} );
  const baseLevel = $(row).find('div[id^=skill_rang_]').text().trim();
  const effectiveLevel = $(row)
    .find('span[id^=skill_eff_rang_]')
    .text()
    .replace(/\D/g, '')
    .trim();
  const skillLevel =
    effectiveLevel.length > 0 ? Number(effectiveLevel) : Number(baseLevel);
  if (!skillLevel || !link) {
    return;
  }

  if (!skillRollData?.[skill]) {
    skillRollData[skill] = await fetchSkillData(link);
    await saveToStorage(SKILL_ROLLS_STORAGE_KEY, skillRollData);
  }
  //console.log( "data", skillRollData[skill] );
  if (skillRollData[skill].length === 0) {
    return;
  }
  const calculatedSkillRolls = skillRollData[skill].map((skillRoll) => {
    return {
      rollType: skillRoll.rollType,
      rollValue: skillService.calculateSkillRoll(
        shortAttributes,
        skill,
        skillLevel,
        skillRoll.rollCalculation,
        skillRoll.modifier
      ),
      rollCalculation: skillRoll.rollCalculation,
      modifier: skillRoll.modifier,
    };
  });
  //console.log( {calculatedSkillRolls} );
  $(row)
    .find('td[class=roll_placeholder]')
    .replaceWith(
      `<td class='roll_placeholder'><table width='100%'><tbody>${calculatedSkillRolls
        .map((x) => {
          const modifierString = x.modifier ? `<b>(${x.modifier})</b>` : '';
          return `<tr onmouseover="return wodToolTip(this, '<b>${x.rollType}</b>: ${x.rollCalculation} ${modifierString}');">
                            <td align='left'>
                                ${x.rollType}
                            </td>
                            <td align='right'>
                                ${x.rollValue}
                            </td>
                            <td align='right'>
                                <img alt='' border='0' src='/wod/css/skins/skin-8/images/icons/inf.gif'>
                            </td>
                        </tr>`;
        })
        .join('')}</tbody></table></td>`
    );
};

main().catch(console.error);
