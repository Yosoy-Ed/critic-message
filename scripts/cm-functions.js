/************************************************* SAVING AN ARRAY OF FILES FUNCTION ******/
export function verifyimgfolders() {

    let dirn = game.settings.get('critic-message', 'nimagefolder');
    FilePicker.browse("user", dirn).then(resp => {
        let filesn = resp.files;
        game.settings.set('critic-message', 'nfolderfiles', filesn);
    });

    let dirp = game.settings.get('critic-message', 'pimagefolder');
    FilePicker.browse("user", dirp).then(resp => {
        let filesp = resp.files;
        game.settings.set('critic-message', 'pfolderfiles', filesp);
    });
}
/***************************** SEND TO CHAT FUNCTION ************************/
export function natcounter(d20dices, userwhorolled, isAttack,kH,kL) {

    let numberOf20s = 0;
    let numberOfNat1 = 0;
    let numberOfNat20 = 0;

    for (const element of d20dices) {
        if (element.faces !== 20) continue;

        for (const resultObj of element.results) {
            const diceresult = resultObj.result;
            numberOf20s++;
            if (diceresult !== 1 && diceresult !== 20) continue;

            if (diceresult === 20) {
                numberOfNat20++;
            } else {
                numberOfNat1++;
            }
        }
    }

    //If advantage (kh) only one nat20 message if there's any, or one nat1 message if all results are 1s.
    //if disadvantage (kl) only one nat1 message if there's any, or one nat20 message if all results are 20s.
    if (game.settings.get('critic-message', 'advantage-disadvantage')) {

        if (kH && numberOfNat20 >= 1) sendChatMessage(20, 1, userwhorolled, isAttack);
        if (kH && numberOfNat20 === 0 && numberOfNat1 === numberOf20s) sendChatMessage(1, 1, userwhorolled, isAttack);

        if (kL && numberOfNat1 >= 1) sendChatMessage(1, 1, userwhorolled, isAttack);
        if (kL && numberOfNat1 === 0 && numberOfNat20 === numberOf20s) sendChatMessage(20, 1, userwhorolled, isAttack);

        if (!kL && !kH){
            if (numberOfNat1 > 0) sendChatMessage(1, numberOfNat1, userwhorolled, isAttack);
            if (numberOfNat20 > 0) sendChatMessage(20, numberOfNat20, userwhorolled, isAttack);
        }

    } else {

        if (game.settings.get('critic-message', 'single-on-multidice')) {
            if (numberOfNat1 > 0) sendChatMessage(1, 1, userwhorolled, isAttack);
            if (numberOfNat20 > 0) sendChatMessage(20, 1, userwhorolled, isAttack);
        } else {
            if (numberOfNat1 > 0) sendChatMessage(1, numberOfNat1, userwhorolled, isAttack);
            if (numberOfNat20 > 0) sendChatMessage(20, numberOfNat20, userwhorolled, isAttack);
        }
    }
}

export function sendChatMessage(nat1OrNat20, numberOfCards, userwhorolled, isAttack) {

    // Cache settings to avoid repeated lookups
    const settings = {
        nat1: {
            text: game.settings.get('critic-message', isAttack ? 'ntext-attack' : 'ntext'),
            defaultImg: game.settings.get('critic-message', 'nimage'),
            randomFiles: game.settings.get('critic-message', 'nfolderfiles'),
            useRandom: game.settings.get('critic-message', 'nat1Checkbox')
        },
        nat20: {
            text: game.settings.get('critic-message', isAttack ? 'ptext-attack' : 'ptext'),
            defaultImg: game.settings.get('critic-message', 'pimage'),
            randomFiles: game.settings.get('critic-message', 'pfolderfiles'),
            useRandom: game.settings.get('critic-message', 'nat20Checkbox')
        }
    };

    // Pre-compile template for better performance
    const messageTemplate = (user, result, img, line) => `
            <table class="chatable">
                <tbody>
                    <tr>
                        <td colspan="2" class="titleline"><br>${user} ROLLED A NATURAL ${result}!</td>
                    </tr>
                    <tr id="msg-bg">
                        <td colspan="1" class="image-cell"><img class="custom-image-size" src="${img}"></td>
                        <td colspan="1" class="rline">${line}</td>
                    </tr>
                </tbody>
            </table>
        `;

    const isCritical = nat1OrNat20 === 20;

    const setting = isCritical ? settings.nat20 : settings.nat1;

    for (let i = 0; i < numberOfCards; i++) {

        // Get random line from text
        const lines = setting.text.split('\n');
        let randomLine = lines[Math.floor(Math.random() * lines.length)];

        // Process user placeholder
        randomLine = randomLine.includes("${userwhorolled}")
            ? randomLine.replace("${userwhorolled}", ` ${userwhorolled} `)
            : randomLine;

        // Determine image to show
        const img2show = setting.useRandom
            ? setting.randomFiles[Math.floor(Math.random() * setting.randomFiles.length)]
            : setting.defaultImg;

        // Create chat message
        const chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: messageTemplate(userwhorolled, nat1OrNat20, img2show, randomLine)
        };

        ChatMessage.create(chatData, {});
    }
}


export function detectroll(chatMessage) {

    let gameSystem = game.system.id;
    let foundryV11 = game.version < 12 ? true : false;
    let msgId = game.version < 12 ? chatMessage.user._id : chatMessage.author._id;
    let kL = chatMessage.rolls[0].formula.includes("20kl")
    let kH = chatMessage.rolls[0].formula.includes("20kh")

    // If the current user is not the one who rolled the dice, do nothing
    if (msgId !== game.user._id) {
        return;
    }

    let isAttack = false;

    if (gameSystem === 'dnd5e' && chatMessage.rolls[0].options.flavor !== undefined && chatMessage.rolls[0].options.flavor.includes('Attack')) {

        isAttack = true;
    }

    if (gameSystem === 'pf2e' && chatMessage.rolls[0]['type'] === 'attack-roll') {
        isAttack = true;
    }

    let rolltype = 0; // 0-Public, 1-Blind , 2-PrivateGM, 3-Self

    // If the roll is not public it is whisper 
    if (chatMessage.whisper.length !== 0) {

        let whisperdto = chatMessage.whisper;
        let gmids = game.users.contents.filter(user => user.isGM).map(gm => gm.id);

        // The roll is blind
        if (chatMessage.blind) {
            rolltype = 1; // Blind Roll 
        } else {
            //The roll was whispered to the GM      
            if (whisperdto.length === gmids.length) {

                const a1fus = whisperdto.sort().join('');
                const a2fus = gmids.sort().join('');

                if (a1fus === a2fus) {
                    rolltype = 2; //Private GM
                }
            }
            //The roll was whispered to himself
            if (chatMessage.whisper[0] === msgId && chatMessage.whisper.length === 1) {
                rolltype = 3; // selfRoll
            }
        }
    }

    if (rolltype !== 0 && !game.settings.get('critic-message', 'allowhiddenrolls')) {
        return;
    }

    let d20dices = chatMessage.rolls[0].dice;
    //let userwhorolled = chatMessage.author.name;
    let userwhorolled = game.version < 12 ? chatMessage.user.name : chatMessage.author.name;
    if (game.user.isGM) {
        verifyimgfolders();
    }
    natcounter(d20dices, userwhorolled, isAttack,kH,kL);
}