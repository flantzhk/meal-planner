import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SEED_PATH = resolve(__dirname, '../recipes.seed.json');

// Hardcoded translation map: keyed by `${recipe.id}__step_${stepNum}`
const TRANSLATIONS = {
  // salt-and-pepper-squid
  'salt-and-pepper-squid__step_1': {
    tl: 'Durugin ang Szechuan peppercorns at black peppercorns sa mortar hanggang medium-fine — gusto mo ng texture, hindi pulbos.',
    il: 'Digulen ti Szechuan peppercorns ken black peppercorns iti mortar agingga medium-fine — kayatmo ti texture, saan nga polvo.',
  },
  'salt-and-pepper-squid__step_2': {
    tl: 'Hiwain ang mga squid tube sa rings. Balutan ng flaky salt at durog na paminta.',
    il: 'Idadansen ti squid tubes nga aniyas. Balutan ti flaky salt ken naidiges nga paminta.',
  },
  'salt-and-pepper-squid__step_3': {
    tl: 'Ihalo ang plain flour at cornflour sa isang patag na plato.',
    il: 'Ikombina ti plain flour ken cornflour iti napatag nga plato.',
  },
  'salt-and-pepper-squid__step_4': {
    tl: 'Talunin ang itlog sa isang mangkok. Ilublob ang mga squid ring sa itlog para mabuo ang balot.',
    il: 'Batbaten ti itlog iti bowl. Iluto ti squid rings iti itlog tapno mabalotan.',
  },
  'salt-and-pepper-squid__step_5': {
    tl: 'Balutan ang mga squid ring sa harina nang isa-isang batch. Alugin ang sobra at ilagay sa tray para hindi magdikit.',
    il: 'Balotan ti squid rings iti pinagsamang harina. Iyugdog ti labas ken ilatag iti tray tapno saan nga agtitipon.',
  },
  'salt-and-pepper-squid__step_6': {
    tl: 'Initin ang mantika sa 180°C. Iprito sa apat na batch nang mga 3 minuto hanggang gintuan at malutong. Patunawing sa rack.',
    il: 'Initin ti lana iti 180°C. Iprito iti uppat nga batch iti nasurok 3 minuto agingga nagasan ken nalagtiit. Patulogen iti rack.',
  },
  'salt-and-pepper-squid__step_7': {
    tl: 'Sa mainit na kawali, lagyan ng olive oil at bawang. Kapag nag-sizzle, ihagis ang pritong pusit at perehil. Haluin ng 30 segundo.',
    il: 'Iti napudot nga kawali, iteddu ti olive oil ken ahos. No nagkuliab na, itirpon ti prito nga pusit ken parsley. Ikuting iti 30 segundo.',
  },
  'salt-and-pepper-squid__step_8': {
    tl: 'Ihain agad kasama ang mga hiwa ng limon.',
    il: 'Iserbi dagus nga adda limon a napipigsa.',
  },

  // garlic-soup-italian-style
  'garlic-soup-italian-style__step_1': {
    tl: 'Talupan at tadtarin ang sibuyas. Talupan ang mga bawang. Hugasan at tadtarin ang leek.',
    il: 'Talupen ken tadtaren ti sibuyas. Talupen ti ahos. Hugasan ken tadtaren ti leek.',
  },
  'garlic-soup-italian-style__step_2': {
    tl: 'Initin ang olive oil sa mabigat na kaldero sa katamtamang init. Ilagay ang sibuyas, leek at tuyong thyme. Lutuin nang dahan-dahan — huwag pabrownin. Ilagay ang bawang at ibaba ang init. Lutuin nang 15 minuto.',
    il: 'Initin ti olive oil iti naug-uges nga kolon iti metiod nga init. Iteddu ti sibuyas, leek ken nalawaan nga thyme. Lutuem nang dallus — saan nga brown. Iteddu ti ahos ken ibaba ti init. Lutuem iti 15 minuto.',
  },
  'garlic-soup-italian-style__step_3': {
    tl: 'Talupan at i-dice ang mga patatas. Ilagay sa kaldero kasama ang lahat ng chicken stock. Timplahan ng asin at paminta. Pakuluin nang dahan-dahan ng 25–30 minuto.',
    il: 'Talupen ken i-dice ti patatas. Iteddu iti kolon a kaiwasan ti chicken stock. Timbangen ti asin ken paminta. Simutten nang dallus iti 25–30 minuto.',
  },
  'garlic-soup-italian-style__step_4': {
    tl: 'Ilagay ang cream at i-blend nang maayos gamit ang stick blender o regular blender. Tikman at ayusin ang timpla.',
    il: 'Iteddu ti cream ken blenderen nang nalinis gamit ti stick blender wenno regular blender. Tikman ken ayosen ti timbre.',
  },
  'garlic-soup-italian-style__step_5': {
    tl: 'Para sa mga crouton, tadtarin ang tinapay at iprito sa olive oil sa mababang init hanggang umitim at maging malutong — ang mabagal na pagpiprito ay nagpapanatiling malutong sa sabaw.',
    il: 'Para iti croutons, tadtaren ti tinapay ken iprito iti olive oil iti nalubos nga init agingga nagpuyot ken nalagtiit — ti nadalus nga prito ket agpanatili nga nalagtiit iti sopas.',
  },
  'garlic-soup-italian-style__step_6': {
    tl: 'Ilagay ang sabaw sa mga mangkok na may mga crouton at tinadtad na perehil sa itaas.',
    il: 'Iserbi ti sopas iti mga bowl nga adda croutons ken nadinagsen nga parsley iti ngato.',
  },

  // sheet-pan-greek-chicken
  'sheet-pan-greek-chicken__step_1': {
    tl: 'Painitin ang oven sa 220°C na may pinakamalaking tray sa loob — dapat napakainit bago ilagay ang pagkain.',
    il: 'Iinit ti oven iti 220°C a kas adda ti pinaka dakkel nga tray iti uneg — masapul nga napudot unay sakbay ti agserrek ti kanen.',
  },
  'sheet-pan-greek-chicken__step_2': {
    tl: 'Kurutin ang balat at kunin ang katas ng dalawang limon. Haluin kasama ang olive oil, bawang, oregano, Dijon, smoked paprika, asin at paminta para gumawa ng dressing. Itabi ang isang-katlo para sa mga gulay.',
    il: 'Kurutin ti barat ken kuannen ti katas ti dua nga limon. Ikutin kaiwasan ti olive oil, ahos, oregano, Dijon, smoked paprika, asin ken paminta tapno agmano ti dressing. Itikag ti maysa-kadua-tulo para iti mga nateng.',
  },
  'sheet-pan-greek-chicken__step_3': {
    tl: 'Ihalo lang ang manok at patatas sa dalawang-katlo ng dressing. Ayusin sa mainit na tray, manok na balat sa itaas at patatas na hiwa sa ibaba. Iluto ng 20–25 minuto hanggang magkulay ang gilid ng patatas.',
    il: 'Ikuting laeng ti manok ken patatas iti dua-katlo ti dressing. Iaregar iti napudot nga tray, manok nga kublit iti ngato ken patatas nga naputol iti baba. Ilauto iti 20–25 minuto agingga nagpuyot ti gibus ti patatas.',
  },
  'sheet-pan-greek-chicken__step_4': {
    tl: 'Habang niluluto iyon, ihalo ang pulang sibuyas, capsicum, broccoli, cherry tomato at olibo sa natitirang dressing.',
    il: 'Bayat ti aglauto, ikuting ti nalabbaga nga sibuyas, capsicum, broccoli, cherry tomatoes ken olibo iti nabilin nga dressing.',
  },
  'sheet-pan-greek-chicken__step_5': {
    tl: 'Ilabas ang tray sa oven. Ikalat ang mga gulay sa mga puwang sa paligid ng manok. Ibalik sa oven ng 30–35 minutong dagdag hanggang ang manok ay gintuan at umabot ng 75°C sa loob.',
    il: 'Ipugas ti tray manipud iti oven. Ipugas ti mga nateng iti mga lukong a paliudan ti manok. Isubli iti oven iti 30–35 nga minuto pay agingga ti manok nga nagasan ken nagtungtong iti 75°C iti uneg.',
  },
  'sheet-pan-greek-chicken__step_6': {
    tl: 'Ilabas sa oven. Ikalat ang feta sa lahat habang mainit pa. Tapusin ng perehil at dill bago ihain.',
    il: 'Ipugas manipud iti oven. Ipugas ti feta iti amin a nag-iinit pay. Taposen ti parsley ken dill sakbay ti pag-serbi.',
  },

  // red-lentil-soup
  'red-lentil-soup__step_1': {
    tl: 'Initin ang olive oil sa malaking kaldero sa katamtamang init. Ilagay ang sibuyas at lutuin hanggang malambot at bahagyang gintuan, mga 6 minuto.',
    il: 'Initin ti olive oil iti dakkel nga kolon iti metiod nga init. Iteddu ti sibuyas ken lutuem agingga nalemlemek ken bassit nga nagasan, nasurok iti 6 minuto.',
  },
  'red-lentil-soup__step_2': {
    tl: 'Ilagay ang cumin at black pepper. Haluin ng 20 segundo hanggang mabango.',
    il: 'Iteddu ti cumin ken black pepper. Ikuting iti 20 segundo agingga nabanglo.',
  },
  'red-lentil-soup__step_3': {
    tl: 'Ilagay ang kudkurang karot at patatas. Haluin ng 1 minuto para mabuo ang balot ng pampalasa.',
    il: 'Iteddu ti nakudkod nga karot ken patatas. Ikuting iti 1 minuto tapno mabalotan iti pampalasa.',
  },
  'red-lentil-soup__step_4': {
    tl: 'Ilagay ang hinugasang lentil at stock. Timplahan ng asin. Pakuluan, tapos bawasan sa mahinang kumukulo ng 18–20 minuto hanggang malambot na ang mga lentil.',
    il: 'Iteddu ti nahugas nga lentil ken stock. Timbangen ti asin. Pabukel, kalpasan ibaba iti nadalus nga agkulikulo iti 18–20 minuto agingga nalemlemek unay ti lentil.',
  },
  'red-lentil-soup__step_5': {
    tl: 'Para sa mga crouton: tadtarin ang sourdough at iprito sa olive oil sa katamtamang init hanggang gintuan, 3–4 minuto. Sa huling 10 segundo, ilagay ang tinadtad na bawang at ihalo.',
    il: 'Para iti croutons: i-cube ti sourdough ken iprito iti olive oil iti metiod nga init agingga nagasan, 3–4 minuto. Iti maudi nga 10 segundo, iteddu ti nadinagsen nga ahos ken ikutin.',
  },
  'red-lentil-soup__step_6': {
    tl: 'I-blend ang sabaw hanggang maayos na makinis. Haluin ang sumac. Tikman at ayusin ang timpla.',
    il: 'Blenderen ti sopas agingga nalemlemek. Isabet ti sumac. Tikman ken ayosen ti timbre.',
  },
  'red-lentil-soup__step_7': {
    tl: 'Ihain sa mga mangkok na may perehil, garlic crouton, puwder ng sumac at mga kalahating limon para pigain.',
    il: 'Iserbi iti mga bowl nga adda parsley, garlic croutons, bassit nga sumac ken kagudua nga limon para pirimitten.',
  },

  // cinderella-potatoes
  'cinderella-potatoes__step_1': {
    tl: 'Painitin ang oven sa 220°C. Pahiran ang mga patatas ng olive oil at asin. Turukan ang bawat patatas ng ilang beses. Iluto ng 55–65 minuto na iikot nang isang beses hanggang matuyo ang balat at malambot sa loob — ang kutsilyo ay dapat na madaling makapasok.',
    il: 'Iinit ti oven iti 220°C. Suroten ti patatas ti olive oil ken asin. Dutduten ti tunggal patatas iti pigagay. Ilauto iti 55–65 minuto nga maika-isa nga agbalin agingga malawaan ti kublit ken naluto iti uneg — masapul nga nalaka nga agtutdo ti kutsilyo.',
  },
  'cinderella-potatoes__step_2': {
    tl: 'Palamigin ng 10–15 minuto. Hiwaing ang tuktok na ¼ pulgada (itabi ang balat para maging meryenda). Kumuhanin ang laman na nag-iiwan ng ¼ pulgadang balat sa paligid.',
    il: 'Palamisen iti 10–15 minuto. Putolen ti ngato nga ¼ pulgada (itikag ti kublit para makan). Kuanen ti uneg nga matikag ti ¼ pulgada nga kublit iti paliudan.',
  },
  'cinderella-potatoes__step_3': {
    tl: 'Ilagay ang laman ng patatas sa ricer at ibuhos sa kawaling palayok. HUWAG gumamit ng blender.',
    il: 'Ipan ti uneg ti patatas iti ricer iti saucepan. SAAN nga agusar ti blender.',
  },
  'cinderella-potatoes__step_4': {
    tl: 'Sa katamtaman-mababang init, haluin ang potato purée kasama ang butter, cream, asin, paminta at kaunting nutmeg hanggang malambot at maayos. Alisin sa init at ihaluin ang mga chive. Tikman — dapat masarap na ito.',
    il: 'Iti metiod-nalubos nga init, ikuting ti potato purée kaiwasan ti butter, cream, asin, paminta ken bassit nga nutmeg agingga nalinis ken nalemlemek. Ilikkar manipud iti init ken isabot ti chives. Tikman — masapul nga naan-anay nga naluto.',
  },
  'cinderella-potatoes__step_5': {
    tl: 'Sa maliit na mangkok, haluin ang natitirang cream, pula ng itlog, Gruyère, paminta at nutmeg para gumawa ng maluwag na custard.',
    il: 'Iti bassit nga bowl, ikkombina ti nabilin nga cream, pula ti itlog, Gruyère, paminta ken nutmeg agingga nabalin ti maluwag nga custard.',
  },
  'cinderella-potatoes__step_6': {
    tl: 'Ilagay muli ang purée sa mga patatas na balat, medyo nakaambuloy. Gamitin ang likod ng kutsara para gumawa ng mababang kanal sa gitna. Maingat na ilagay ang custard sa kanal.',
    il: 'Isao manen ti purée iti mga patatas nga kublit, bassit nga nakatakder. Gamitten ti likud ti kutsara tapno agmano ti nalubos nga aglayus iti tengnga. Nainget nga isao ti custard iti aglaayus.',
  },
  'cinderella-potatoes__step_7': {
    tl: 'Iluto sa 180°C ng 12–15 minuto hanggang maayos na set ang custard at bahagyang gintuan. Kung hindi pa kayumanggi, i-grill ng mabilis ng 1–2 minuto — abangan nang mabuti.',
    il: 'Ilauto iti 180°C iti 12–15 minuto agingga naset ti custard ken bassit nga nagasan. No saan pay nga nagpuyot, igrilen iti 1–2 minuto — agserserbi nang ado.',
  },

  // spiced-indian-roast-potatoes
  'spiced-indian-roast-potatoes__step_1': {
    tl: 'Painitin ang oven sa 200°C. Ilagay ang walang laman na roasting tray sa oven para mainit.',
    il: 'Iinit ti oven iti 200°C. Iruot ti nalpes nga roasting tray iti oven tapno maiinit.',
  },
  'spiced-indian-roast-potatoes__step_2': {
    tl: 'Pakuluan ang mga patatas sa tubig na may asin, turmeric at baking soda ng 10 minuto hanggang malambot. Patunawing sa colander at ihagis para maging magaspang ang mga gilid. Budburan ng cornstarch at ihagis muli.',
    il: 'Bukelen ti patatas iti danum a kas adda asin, turmeric ken baking soda iti 10 minuto agingga nalemlemek. Patulogen iti colander ken ikuting tapno mabatok ti mga gibus. Budboran ti cornstarch ken ikuting manen.',
  },
  'spiced-indian-roast-potatoes__step_3': {
    tl: 'Initin ang mantika sa maliit na kasirola sa katamtamang init. Ilagay ang bawang at sili, iprito hanggang bahagyang gintuan. Ilagay ang cumin at mustard seeds at hayaang mag-crackle. Salain ang mantika sa mangkok — itabi ang malutong na bawang at pampalasa.',
    il: 'Initin ti lana iti bassit nga saucepan iti metiod nga init. Iteddu ti ahos ken sili, iprito agingga bassit nga nagasan. Iteddu ti cumin ken mustard seeds ken buyogen dagiti aglalagtiit. Salaan ti lana iti bowl — itikag ti nalagtiit nga ahos ken pampalasa.',
  },
  'spiced-indian-roast-potatoes__step_4': {
    tl: 'Ibuhos ang mainit-mainit na mantika sa mainit na tray. Ikalat ang mga patatas sa isang patong at ihalo para mabuo ang balot. Iluto ng 40 minuto, i-ikot ng dalawang beses para pantay ang pagkakulay.',
    il: 'Agusaren ti napalasa nga lana iti napudot nga roasting tray. Ipugas ti patatas iti maysa nga layer ken ikuting tapno mabalotan. Ilauto iti 40 minuto, agpabalin iti dua nga daras tapno naiyanay ti pagasan.',
  },
  'spiced-indian-roast-potatoes__step_5': {
    tl: 'Kapag gintuan at malutong, ilabas sa oven. Tunawin ang butter sa mainit na mga patatas, buhusan ng lemon juice, at timplahan. Ilagay ang napanatiling malutong na bawang at pampalasa, tapos tapusin ng mint at kulantro.',
    il: 'No nagasan ken nalagtiit na, ipugas manipud iti oven. Tunawem ti butter iti napudot nga patatas, agtulbok ti lemon juice, ken timbangen. Iteddu ti itikag nga nalagtiit nga ahos ken pampalasa, kalpasan taposen ti mint ken coriander.',
  },

  // potato-dauphinoise
  'potato-dauphinoise__step_1': {
    tl: 'Painitin ang oven sa 180°C.',
    il: 'Iinit ti oven iti 180°C.',
  },
  'potato-dauphinoise__step_2': {
    tl: 'Pagsamahin ang cream, gatas, nutmeg, asin at paminta sa isang pitsel.',
    il: 'Ikkombina ti cream, gatas, nutmeg, asin ken paminta iti pitsel.',
  },
  'potato-dauphinoise__step_3': {
    tl: 'Ilagay ang tinadtad na bawang sa malaking kasirola at ibuhos ang halo ng gatas at cream. Initin nang dahan-dahan.',
    il: 'Iteddu ti nadinagsen nga ahos iti dakkel nga saucepan ken agus-usar ti pinagsamang gatas ken cream. Initin nang dallus.',
  },
  'potato-dauphinoise__step_4': {
    tl: 'Talupan at hiwain ang mga patatas sa may 2mm na kapal gamit ang mandoline o matalas na kutsilyo. Ilagay ang mga hiwa direkta sa mainit na cream — huwag hugasan, ang starch ang nagpapakapal ng sarsa.',
    il: 'Talupen ken hiwaten ti patatas iti nasurok iti 2mm ti kapal gamit ti mandoline wenno natiging nga kutsilyo. Iteddu ti mga hiwa direkta iti napudot nga cream — saan nga hugasan, ti starch ti agpakapal ti sarsa.',
  },
  'potato-dauphinoise__step_5': {
    tl: 'Pakuluin nang dahan-dahan, haluin para hindi masunog ang ibaba. Pakuluin ng 8 minuto hanggang bahagyang malambot. Tikman at ayusin ang timpla.',
    il: 'Simutten nang dallus, ikuting tapno saan nga masunog ti baba. Simutten iti 8 minuto agingga bassit nga nalemlemek. Tikman ken ayosen ti timbre.',
  },
  'potato-dauphinoise__step_6': {
    tl: 'Ilipat ang kalahati ng mga patatas sa baking dish. Ikalat ang thyme at isang dakot ng keso. Ilagay ang natitirang patatas sa maayos na patong sa itaas. Ibuhos ang natitirang likido. Budburan ng natitirang keso.',
    il: 'Illaog ti kagudua ti patatas iti baking dish. Ipugas ti thyme ken maysa nga aggem nga keso. Iteddu ti nabilin nga patatas iti naiorder nga ngato nga layer. Agus-usar ti nabilin nga likido. Ngatan ti nabilin nga keso.',
  },
  'potato-dauphinoise__step_7': {
    tl: 'Takluban nang maluwag ng foil. Iluto ng 40 minuto. Alisin ang foil at iluto nang walang takip ng 25–30 minutong dagdag hanggang kumulo, gintuan at madaling mapasukan ng kutsilyo.',
    il: 'Takuban nang maluwag ti foil. Ilauto iti 40 minuto. Ilikkar ti foil ken ilauto nga awanan takup iti 25–30 nga minuto pay agingga agkulikulo, nagasan ken nalaka nga masuot ti kutsilyo.',
  },
  'potato-dauphinoise__step_8': {
    tl: 'Pahingahin na nakatakip ng foil at towel sa kusina ng 60 minuto — ang cream ay nagseset at ang mga patong ay magkakasama. Nananatiling mainit ang mga patatas.',
    il: 'Painasen nga natakuban ti foil ken napkin iti 60 minuto — ti cream ket agset ken ti mga layer ket agtitinnulong. Nag-iinit pay ti patatas.',
  },

  // hot-honey-harissa-shrimp-flatbreads
  'hot-honey-harissa-shrimp-flatbreads__step_1': {
    tl: 'Pagsamahin ang olive oil, harissa, mainit na pulot-pukyutan, smoked paprika, lemon juice at asin. Ilagay ang mga hipon, haluin para mabuo ang balot, at mag-marinate ng 10–15 minuto.',
    il: 'Ikkombina ti olive oil, harissa, napudot nga pugas, smoked paprika, lemon juice ken asin. Iteddu ti hipon, ikutin tapno mabalotan, ken marinaten iti 10–15 minuto.',
  },
  'hot-honey-harissa-shrimp-flatbreads__step_2': {
    tl: 'Para sa tabbouleh: haluin ang lemon juice, olive oil, sumac at asin. Ilagay ang bulgur, perehil, kamatis, pipino at pulang sibuyas. Ihalo at itabi.',
    il: 'Para iti tabbouleh: ikkombina ti lemon juice, olive oil, sumac ken asin. Iteddu ti bulgur, parsley, kamatis, pepino ken nalabbaga nga sibuyas. Ikuting ken itikag.',
  },
  'hot-honey-harissa-shrimp-flatbreads__step_3': {
    tl: 'Para sa sarsa ng tahini: haluin ang tahini, lemon juice, malamig na tubig, bawang at cumin hanggang maayos. Dagdag ng tubig kung kailangan para maging tamang konsistensya sa pagbuhos.',
    il: 'Para iti sarsa ti tahini: ikutin ti tahini, lemon juice, nalamiis nga danum, ahos ken cumin agingga nalemlemek. Iteddu ti adu nga danum no kasapulan tapno agbalin ti nainayad nga tiris.',
  },
  'hot-honey-harissa-shrimp-flatbreads__step_4': {
    tl: 'Initin ang kawali sa katamtaman-mataas na init. Lutuin ang mga hipon ng 1–2 minuto bawat gilid hanggang bahagyang maputi at medyo nasunog.',
    il: 'Initin ti kawali iti metiod-nangato nga init. Lutuem ti hipon iti 1–2 minuto iti tunggal gibus agingga bassit nga naalburador ken bassit nga nagkidom.',
  },
  'hot-honey-harissa-shrimp-flatbreads__step_5': {
    tl: 'Initin ang mga flatbread sa tuyong kawali. Pahiran ng tahini sauce, ilagay ang tabbouleh, tapos ang mga hipon, manipis na hiwa ng pipino at sariwang dill.',
    il: 'Initin ti flatbreads iti nalawaan nga kawali. Ilugit ti tahini sauce, ngatan ti tabbouleh, kalpasan ti hipon, manipis nga hiwa ti pepino ken sariwa nga dill.',
  },

  // spanish-garlic-shrimp
  'spanish-garlic-shrimp__step_1': {
    tl: 'Sa kawali sa mababang init, ilagay ang olive oil na may mga hiwa ng bawang at sili. Lutuin nang dahan-dahan ng 2 minuto hanggang mabango — huwag pabrownin ang bawang o magiging mapait ito.',
    il: 'Iti kawali iti nalubos nga init, iteddu ti olive oil a kas adda mga hiwa ti ahos ken sili. Lutuem nang dallus iti 2 minuto agingga nabanglo — saan nga pabrownin ti ahos wenno agbalin nga naapgad.',
  },
  'spanish-garlic-shrimp__step_2': {
    tl: 'Ilagay ang mga hipon sa isang patong. Budburan ng asin at smoked paprika. Lutuin ng 1–2 minuto bawat gilid hanggang bahagyang maputi.',
    il: 'Iteddu ti hipon iti maysa nga layer. Budboran ti asin ken smoked paprika. Lutuem iti 1–2 minuto iti tunggal gibus agingga bassit nga naalburador.',
  },
  'spanish-garlic-shrimp__step_3': {
    tl: 'Ilagay ang lemon juice at perehil. Ihalo at agad alisin sa init.',
    il: 'Iteddu ti lemon juice ken parsley. Ikuting ken dagus ilikkar manipud iti init.',
  },
  'spanish-garlic-shrimp__step_4': {
    tl: 'Ihain na mainit pa mula sa kawali kasama ang tinapay na malutong para ibabad.',
    il: 'Iserbi nga napudot-napudot manipud iti kawali a kas adda nalagtiit nga tinapay para isalodong.',
  },

  // roasted-carrot-ginger-soup
  'roasted-carrot-ginger-soup__step_1': {
    tl: 'Painitin ang oven sa 200°C. Ilagay ang mga karot, sibuyas at bawang na hindi pa natalupan sa roasting tray. Buhusan ng olive oil, timplahan ng asin at iluto ng 25–30 minuto hanggang malambot at bahagyang nakaramelo.',
    il: 'Iinit ti oven iti 200°C. Iruot ti karot, sibuyas ken saan pay nataltarupen nga ahos iti roasting tray. Agus-usar ti olive oil, timbangen ti asin ken ilauto iti 25–30 minuto agingga nalemlemek ken bassit nga nag-karamelo.',
  },
  'roasted-carrot-ginger-soup__step_2': {
    tl: 'Pigutin ang inihaw na bawang mula sa balat nito. Ilipat ang lahat ng inihaw na gulay sa malaking palayok ng sabaw. Ilagay ang luya, turmeric, cumin, kulantro, paprika, nutmeg at dahon ng laurel.',
    il: 'Pirimitten ti natuno nga ahos manipud iti kublit na. Illaog ti amin nga natuno nga nateng iti dakkel nga kolon ti sopas. Iteddu ti laya, turmeric, cumin, coriander, paprika, nutmeg ken dahon ti laurel.',
  },
  'roasted-carrot-ginger-soup__step_3': {
    tl: 'Ibuhos ang stock at pakuluin nang dahan-dahan ng 25–30 minuto. Alisin ang dahon ng laurel.',
    il: 'Agus-usar ti stock ken simutten nang dallus iti 25–30 minuto. Ilikkar ti dahon ti laurel.',
  },
  'roasted-carrot-ginger-soup__step_4': {
    tl: 'I-blend hanggang makinis at malambot. Ibalik sa mababang init at haluin ang gatas ng niyog. Ayusin ang timpla. Dagdag ng lemon juice para sa sariwang lasa kung gusto.',
    il: 'Blenderen agingga nalemlemek ken nalinis. Isubli iti nalubos nga init ken isabet ti gatang ti niyog. Ayosen ti timbre. Iteddu ti lemon juice para iti sariwa no kayat.',
  },
  'roasted-carrot-ginger-soup__step_5': {
    tl: 'Ihain na mainit, may sariwang kulantro o perehil para pampalamutis.',
    il: 'Iserbi nga napudot, nailalaban ti sariwa nga coriander wenno parsley.',
  },

  // mediterranean-salad
  'mediterranean-salad__step_1': {
    tl: 'Gumawa ng dressing: durugin ang bawang at mga anchovy hanggang maging paste. Ilagay ang lemon juice, dalawang uri ng suka, oregano at olive oil. Haluin nang mabuti.',
    il: 'Mano ti dressing: digulen ti ahos ken anchovies agingga nabalin nga paste. Iteddu ti lemon juice, dua nga suka, oregano ken olive oil. Ikutin nang nainget.',
  },
  'mediterranean-salad__step_2': {
    tl: 'Pakuluan ang mga patatas sa inasnan na tubig hanggang malambot. Palamigin at talupan.',
    il: 'Bukelen ti patatas iti nasinaan nga danum agingga nalemlemek. Palamisen ken talupen.',
  },
  'mediterranean-salad__step_3': {
    tl: 'Ilagay ang 4 kutsarang dressing sa malaking mangkok. Ilagay ang mga kamatis, kudkurang karot, kalahating artichoke hearts, rocket at tuna. Hiwain ang mga patatas at ilagay. Ihalo nang mabuti.',
    il: 'Iteddu ti 4 nga kutsara ti dressing iti dakkel nga bowl. Iteddu ti kamatis, nakudkod nga karot, kagudua nga artichoke hearts, rocket ken tuna. Hiwaten ti patatas ken iteddu. Ikuting nang nainget.',
  },
  'mediterranean-salad__step_4': {
    tl: 'Ilagay sa itaas ang pinunit na mozzarella, mga olibo, konting olive oil at sariwang basil na pinunit. Ihain na may mga anchovy sa gilid kung gusto.',
    il: 'Ngatan ti napunit nga mozzarella, olibo, bassit nga olive oil ken sariwa nga napunit nga basil. Iserbi a kas adda anchovies iti gilir no kayat.',
  },

  // salmon-lemon-butter-cream
  'salmon-lemon-butter-cream__step_1': {
    tl: 'Alisin ang balat ng salmon kung gusto. Tadtarin nang pino ang mga shallot at dahon ng perehil.',
    il: 'Ilikkar ti kublit ti salmon no kayat. Nadinagsen nga tadtaren ti shallots ken dahon ti parsley.',
  },
  'salmon-lemon-butter-cream__step_2': {
    tl: 'Tunawin ang butter sa kawali sa katamtamang init. Ilagay ang salmon na tuktok naka-harap sa ibaba at lutuin hanggang bahagyang gintuan. I-flip nang dahan-dahan at lutuin hanggang ang butter ay maging kayumanggi.',
    il: 'Tunawem ti butter iti kawali iti metiod nga init. Iruot ti salmon nga ngato iti baba ken lutuem agingga bassit nga nagasan. Balikiten nang dallus ken lutuem agingga ti butter ket nagpuyot.',
  },
  'salmon-lemon-butter-cream__step_3': {
    tl: 'I-deglaze ng white wine, ilagay ang lemon juice at shallots. Ilagay ang cream. Timplahan. Lutuin ang isda sa sarsa ng mga 3 minuto hanggang sa iyong gusto ang luto.',
    il: 'Deglazen ti white wine, iteddu ti lemon juice ken shallots. Iteddu ti cream. Timbangen. Ilauto ti ikan iti sarsa iti nasurok 3 minuto agingga ti kayat mo ti luto.',
  },
  'salmon-lemon-butter-cream__step_4': {
    tl: 'Alisin nang maingat ang salmon at ilagay sa mainit na plato. Palapitan ang sarsa sa mataas na init hanggang lumapot. Haluin ang perehil at ibuhos sa isda.',
    il: 'Ilikkar nang nainget ti salmon ken iruot iti napudot nga plato. Pakuransen ti sarsa iti nangato nga init agingga nalapot. Isabet ti parsley ken agus-usar iti ikan.',
  },

  // chicken-vegetable-stir-fry
  'chicken-vegetable-stir-fry__step_1': {
    tl: 'Initin ang mantika sa malaking wok o kawali sa katamtaman-mataas na init. Ilagay ang mga cubed na manok at igisa ng 5–7 minuto hanggang maluto.',
    il: 'Initin ti lana iti dakkel nga wok wenno kawali iti metiod-nangato nga init. Iteddu ti cubed nga manok ken igisa iti 5–7 minuto agingga naluto.',
  },
  'chicken-vegetable-stir-fry__step_2': {
    tl: 'Ilagay ang sibuyas, puting bahagi ng spring onion, bawang at luya. Lutuin ng 1–2 minuto hanggang mabango.',
    il: 'Iteddu ti sibuyas, puraw nga parte ti spring onion, ahos ken laya. Lutuem iti 1–2 minuto agingga nabanglo.',
  },
  'chicken-vegetable-stir-fry__step_3': {
    tl: 'Ilagay ang mga capsicum, karot at broccoli. Igisa ng 4–5 minuto hanggang malambot at malutong. Dagdag ng kaunting tubig kung kailangan para maluto ng singaw.',
    il: 'Iteddu ti capsicum, karot ken broccoli. Igisa iti 4–5 minuto agingga nalemlemek-nalagtiit. Iteddu ti bassit nga danum no kasapulan tapno maluto iti pabor.',
  },
  'chicken-vegetable-stir-fry__step_4': {
    tl: 'Ibalik ang manok sa kawali. Ilagay ang oyster sauce, toyo at sarsa ng sili. Haluin, tapos ilagay ang cornstarch slurry. Lutuin ng 2–3 minuto hanggang makintab.',
    il: 'Isubli ti manok iti kawali. Iteddu ti oyster sauce, toyo ken sarsa ti sili. Ikuting, kalpasan iteddu ti cornstarch slurry. Lutuem iti 2–3 minuto agingga nag-gloss.',
  },
  'chicken-vegetable-stir-fry__step_5': {
    tl: 'Tapusin ng sesame oil. Ihain sa kanin o pancit. Palamutian ng berdeng bahagi ng spring onion at sesame seeds.',
    il: 'Taposen ti sesame oil. Iserbi iti bagas wenno pancit. Ilalaban ti berde nga parte ti spring onion ken sesame seeds.',
  },

  // chicken-stuffed-peppers
  'chicken-stuffed-peppers__step_1': {
    tl: 'Painitin ang oven sa 180°C. Initin ang olive oil at butter sa malaking kawali sa katamtamang init. Ilagay ang sibuyas na may kurot ng asin at lutuin hanggang malambot.',
    il: 'Iinit ti oven iti 180°C. Initin ti olive oil ken butter iti dakkel nga kawali iti metiod nga init. Iteddu ti sibuyas a kas adda bassit nga asin ken lutuem agingga nalemlemek.',
  },
  'chicken-stuffed-peppers__step_2': {
    tl: 'Ilagay ang bawang at oregano. Ilagay ang tomato paste at lutuin ng 1–2 minuto. Ilagay ang giniling na manok at sirain, lutuin hanggang maluto na may bahagyang pagkulay.',
    il: 'Iteddu ti ahos ken oregano. Iteddu ti tomato paste ken lutuem iti 1–2 minuto. Iteddu ti nadinagsen nga manok ken buaten, lutuem agingga naluto a kas adda bassit nga nagpuyot.',
  },
  'chicken-stuffed-peppers__step_3': {
    tl: 'Ibuhos ang passata. Pakuluin na walang takip ng 12–15 minuto hanggang lumapot. Alisin sa init at haluin ang kanin, Parmesan at perehil. Tikman at ayusin ang timpla.',
    il: 'Agus-usar ti passata. Simutten nga awanan takup iti 12–15 minuto agingga nalapot. Ilikkar manipud iti init ken isabet ti bagas, Parmesan ken parsley. Tikman ken ayosen ti timbre.',
  },
  'chicken-stuffed-peppers__step_4': {
    tl: 'Hiwain ang mga bell pepper sa kalahati nang haba mula sa tangkay. Alisin ang mga butil at gulugod. Timplahan ang loob ng asin at paminta.',
    il: 'Hiwaten ti bell pepper iti kagudua iti taas-baba manipud iti tangkay. Ilikkar ti mga buto ken ribas. Timbangen ti uneg ti asin ken paminta.',
  },
  'chicken-stuffed-peppers__step_5': {
    tl: 'Ilagay ang palaman sa mga kalahating bell pepper gamit ang kutsara. Budburan ng kudkurang mozzarella. Ibuhos ang 3 kutsarang tubig sa ilalim ng baking dish. Takluban nang mahigpit ng foil at iluto ng 20 minuto.',
    il: 'Isao ti pamuno iti mga kagudua nga bell pepper. Ngatan ti nakudkod nga mozzarella. Agus-usar ti 3 nga kutsara nga danum iti baba ti baking dish. Takuban nang nainget ti foil ken ilauto iti 20 minuto.',
  },
  'chicken-stuffed-peppers__step_6': {
    tl: 'Alisin ang foil at iluto na walang takip ng 10–15 minutong dagdag hanggang malambot ang mga bell pepper at matunaw at maging gintuan ang keso.',
    il: 'Ilikkar ti foil ken ilauto nga awanan takup iti 10–15 nga minuto pay agingga nalemlemek ti bell pepper ken natunaw ken nagasan ti keso.',
  },

  // potato-rosti-bacon
  'potato-rosti-bacon__step_1': {
    tl: 'Kudkurin nang pino ang mga patatas. Pigain nang kamay ang pinakamaraming likido at ilagay sa mangkok.',
    il: 'Kudkoden nang nainget ti patatas. Pirimitten ti adu nga likido gamit ti ima ken iruot iti bowl.',
  },
  'potato-rosti-bacon__step_2': {
    tl: 'Ilagay ang pinong hiwang sibuyas, dinurog na bawang, thyme, rosemary. Timplahan ng asin at paminta. Haluin nang mabuti.',
    il: 'Iteddu ti nadinagsen nga hiwa ti sibuyas, nadiges nga ahos, thyme, rosemary. Timbangen ti asin ken paminta. Ikuting nang nainget.',
  },
  'potato-rosti-bacon__step_3': {
    tl: 'Tunawin ang clarified butter. Initin ang mabigat na kawali sa katamtamang init na may butter. Hatiin ang halo ng patatas sa apat na bahagi. Pindutin nang dahan-dahan sa kawali. Ibaba ang init at lutuin ng 10–12 minuto hanggang gintuan ang ibaba.',
    il: 'Tunawem ti clarified butter. Initin ti naug-uges nga kawali iti metiod nga init a kas adda butter. Idibide ti pinagsamang patatas iti uppat nga parte. Pigsen nang dallus iti kawali. Ibaba ti init ken lutuem iti 10–12 minuto agingga nagpuyot ti baba.',
  },
  'potato-rosti-bacon__step_4': {
    tl: 'I-flip at lutuin ang kabilang gilid ng 10–12 minuto hanggang gintuan.',
    il: 'Balikiten ken lutuem ti sabali nga gibus iti 10–12 minuto agingga nagasan.',
  },
  'potato-rosti-bacon__step_5': {
    tl: 'Lutuin ang bacon sa tuyong kawali hanggang malutong. Hiwain ang mga spring onion.',
    il: 'Lutuem ti bacon iti nalawaan nga kawali agingga nalagtiit. Hiwaten ti spring onions.',
  },
  'potato-rosti-bacon__step_6': {
    tl: 'Ihain ang rosti na may goat yogurt, malutong na bacon at spring onion sa itaas.',
    il: 'Iruot ti rosti nga adda goat yogurt, nalagtiit nga bacon ken spring onion iti ngato.',
  },

  // chicken-cheese-toastie
  'chicken-cheese-toastie__step_1': {
    tl: 'Haluin ang malambot na butter kasama ang tinadtad na bawang at perehil para gumawa ng garlic butter.',
    il: 'Ikuting ti nalemlemek nga butter kaiwasan ti nadinagsen nga ahos ken parsley tapno mangmano ti garlic butter.',
  },
  'chicken-cheese-toastie__step_2': {
    tl: 'Patayain ang mga hita ng manok. I-grill sa kawali na may olive oil, asin at paminta hanggang maluto.',
    il: 'Papatayan ti paa ti manok. Igrilen iti kawali a kas adda olive oil, asin ken paminta agingga naluto.',
  },
  'chicken-cheese-toastie__step_3': {
    tl: 'Pahiran ng garlic butter ang isang gilid ng bawat hiwa ng tinapay. Pahiran ng cream cheese ang kabilang gilid. Ilagay ang Gruyère, mga lutong manok at dagdag na Gruyère. Lagyan ng pangalawang hiwa ng tinapay, garlic butter na nakaharap sa labas.',
    il: 'Ilugit ti garlic butter iti maysa nga gibus ti tunggal hiwa ti tinapay. Ilugit ti cream cheese iti sabali nga gibus. Layer-en ti Gruyère, naluto nga manok ken ad-adu pa nga Gruyère. Ngatan ti maika-dua nga hiwa ti tinapay, garlic butter iti ruar.',
  },
  'chicken-cheese-toastie__step_4': {
    tl: 'Ilagay ang mga sandwich na garlic-butter ang nasa ibaba sa malaking kawali sa mababang init na may takip. I-grill hanggang gintuan, 3–4 minuto bawat gilid. I-flip at lutuin ang kabilang gilid.',
    il: 'Iruot ti mga sandwich nga garlic-butter iti baba iti dakkel nga kawali iti nalubos nga init a kas adda takup. Igrilen agingga nagasan, 3–4 minuto iti tunggal gibus. Balikiten ken lutuem ti sabali nga gibus.',
  },
  'chicken-cheese-toastie__step_5': {
    tl: 'Hiwain sa tatsulok at ihain na mainit.',
    il: 'Hiwaten iti tatsulok ken iserbi nga napudot.',
  },

  // steamed-fish-beurre-blanc
  'steamed-fish-beurre-blanc__step_1': {
    tl: 'Timplahan ang isda ng asin, paminta at konting olive oil.',
    il: 'Timbangen ti ikan ti asin, paminta ken bassit nga olive oil.',
  },
  'steamed-fish-beurre-blanc__step_2': {
    tl: 'Punuin ang palayok ng 2 pulgada ng tubig at pakuluan nang bahagya. Ilagay ang steaming basket sa ibabaw ng tubig. Ilagay ang isda sa basket. Takluban at singawan ng 8–10 minuto hanggang maputi at madurog.',
    il: 'Punuen ti kolon iti 2 pulgada ti danum ken isubli iti simut. Iruot ti steaming basket iti ngato ti danum. Iruot ti ikan iti basket. Takuban ken paboruen iti 8–10 minuto agingga naalburador ken agburabor.',
  },
  'steamed-fish-beurre-blanc__step_3': {
    tl: 'Habang niluluto ng singaw ang isda, pagsamahin ang white wine, lemon juice at shallots sa maliit na kasirola. Pakuluin hanggang mabawasan ng kalahati.',
    il: 'Bayat ti agpabor ti ikan, ikkombina ti white wine, lemon juice ken shallots iti bassit nga saucepan. Simutten agingga makuransen iti kagudua.',
  },
  'steamed-fish-beurre-blanc__step_4': {
    tl: 'Ibaba ang init sa mababa. Haluin ang mga cubed na malamig na butter nang isa-isa, laging naghahaluin para mag-emulsify ang sarsa. Huwag pakuluin.',
    il: 'Ibaba ti init iti nalubos. Ikutin ti mga cubed nga nalamiis nga butter iti maymaysa, naiyan nga agikuting tapno mag-emulsify ti sarsa. Saan nga pabukel.',
  },
  'steamed-fish-beurre-blanc__step_5': {
    tl: 'Haluin ang mga caper at dill. Timplahan ayon sa panlasa. Ibuhos nang sagana ang sarsa sa inisda ng singaw. Ihain agad.',
    il: 'Isabet ti capers ken dill. Timbangen nga ayon ti tikod. Isao nang nabayag ti sarsa iti nalpabor nga ikan. Iserbi dagus.',
  },

  // pan-fried-halloumi-salad
  'pan-fried-halloumi-salad__step_1': {
    tl: 'Gumawa ng dressing: haluin ang olive oil, lemon juice, red wine vinegar, Dijon mustard, kudkurang bawang, asin at paminta sa malaking mangkok.',
    il: 'Mano ti dressing: ikutin ti olive oil, lemon juice, red wine vinegar, Dijon mustard, nakudkod nga ahos, asin ken paminta iti dakkel nga bowl.',
  },
  'pan-fried-halloumi-salad__step_2': {
    tl: 'Ilagay ang mga kamatis, pipino, pulang sibuyas, olibo, capsicum, basil at perehil sa mangkok. Ihalo nang mabuti. Itabi ang kaunting dressing para ibuhos sa katapusan.',
    il: 'Iteddu ti kamatis, pepino, nalabbaga nga sibuyas, olibo, capsicum, basil ken parsley iti bowl. Ikuting nang nainget. Itikag ti bassit nga dressing para tiris iti maudi.',
  },
  'pan-fried-halloumi-salad__step_3': {
    tl: 'I-toast ang mga pine nut sa tuyong kawali sa katamtamang init ng 1–2 minuto hanggang gintuan. Itabi.',
    il: 'I-toast ti pine nuts iti nalawaan nga kawali iti metiod nga init iti 1–2 minuto agingga nagasan. Itikag.',
  },
  'pan-fried-halloumi-salad__step_4': {
    tl: 'Patuyuin ang halloumi gamit ang tissue at hiwain sa makapal na piraso.',
    il: 'Patuyuen ti halloumi gamit ti tisyu ken hiwaten iti nalukmeg nga piyeso.',
  },
  'pan-fried-halloumi-salad__step_5': {
    tl: 'Lutuin ang halloumi sa tuyong kawali sa katamtamang init ng 1–2 minuto bawat gilid para malabas ang tubig. Dagdag ng kaunting olive oil at lutuin ng 30–60 segundo bawat gilid hanggang gintuan at malutong.',
    il: 'Lutuem ti halloumi iti nalawaan nga kawali iti metiod nga init iti 1–2 minuto iti tunggal gibus tapno pumayas ti danum. Iteddu ti bassit nga olive oil ken lutuem iti 30–60 segundo iti tunggal gibus agingga nagasan ken nalagtiit.',
  },
  'pan-fried-halloumi-salad__step_6': {
    tl: 'Ayusin ang salad sa mga plato. Ikalat ang mga pine nut sa itaas. Ilagay ang mainit na halloumi sa salad, buhusan ng natitirang dressing. Ihain agad.',
    il: 'Iaregar ti ensalada iti mga plato. Ipugas ti pine nuts iti ngato. Iruot ti napudot nga halloumi iti ensalada, agus-usar ti nabilin nga dressing. Iserbi dagus.',
  },

  // potato-rosti-smoked-salmon
  'potato-rosti-smoked-salmon__step_1': {
    tl: 'Singawan ang mga patatas ng mga 20 minuto hanggang matigas sa gitna na may malambot na gilid. Palamigin nang bahagya, tapos talupan.',
    il: 'Paboruen ti patatas iti nasurok iti 20 minuto agingga natibker iti tengnga a kas adda nalemlemek nga gibus. Palamisen nang bassit, kalpasan talupen.',
  },
  'potato-rosti-smoked-salmon__step_2': {
    tl: 'Kudkurin ang mga patatas gamit ang magaspang na kudkuran. Ilagay sa mangkok.',
    il: 'Kudkoden ti patatas gamit ti nabaskog nga kudkuran. Iruot iti bowl.',
  },
  'potato-rosti-smoked-salmon__step_3': {
    tl: 'Ilagay ang pinong tinadtad na shallot, dinurog na bawang, pula ng itlog, tinadtad na thyme at rosemary. Timplahan ng asin at paminta. Ilagay ang natunaw na clarified butter. Haluin nang magkasama.',
    il: 'Iteddu ti nadinagsen nga shallot, nadiges nga ahos, pula ti itlog, nadinagsen nga thyme ken rosemary. Timbangen ti asin ken paminta. Iteddu ti natunaw nga clarified butter. Ikkombina.',
  },
  'potato-rosti-smoked-salmon__step_4': {
    tl: 'Initin ang bahagyang may mantikang non-stick na kawali sa katamtamang init. Gumamit ng cutter o hulma para hugisan ang mga bahagi ng halo. Lutuin hanggang gintuan ang ibaba, tapos i-flip at lutuin ang kabilang gilid hanggang katulad na gintuan.',
    il: 'Initin ti bassit nga nalana nga non-stick nga kawali iti metiod nga init. Agusar ti cutter wenno mold tapno humugis ti mga parte ti pinagsamang. Lutuem agingga nagasan ti baba, kalpasan balikiten ken lutuem ti sabali nga gibus agingga naiyanay nga nagasan.',
  },
  'potato-rosti-smoked-salmon__step_5': {
    tl: 'Ihain ang rosti na mainit na may sour cream, hiwa ng avocado at smoked salmon sa itaas.',
    il: 'Iserbi ti rosti nga napudot nga adda sour cream, hiwa ti avocado ken smoked salmon iti ngato.',
  },
};

// Read the seed file
const recipes = JSON.parse(readFileSync(SEED_PATH, 'utf-8'));

let updatedCount = 0;

for (const recipe of recipes) {
  if (!recipe.steps) continue;
  for (const step of recipe.steps) {
    const key = `${recipe.id}__step_${step.step}`;
    const translation = TRANSLATIONS[key];
    if (translation) {
      step.instruction_tl = translation.tl;
      step.instruction_il = translation.il;
      updatedCount++;
    }
  }
}

writeFileSync(SEED_PATH, JSON.stringify(recipes, null, 2), 'utf-8');

console.log(`Done. ${updatedCount} steps updated. File written to ${SEED_PATH}`);
