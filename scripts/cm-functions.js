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
export function criticalmessage(d20dices, userwhorolled,isAttack) {

    d20dices.forEach((element) => {
        if (element.faces === 20) {

            element.results.forEach((abc) => {

                let diceresult = abc.result;
                let allines;
                let img2show;

                if (diceresult === 1) {

                    allines = isAttack ? game.settings.get('critic-message', 'ntext-attack') : game.settings.get('critic-message', 'ntext');

                    //allines = game.settings.get('critic-message', 'ntext');

                    if (!game.settings.get('critic-message', 'nat1Checkbox')) {
                        img2show = game.settings.get('critic-message', 'nimage');
                    }
                    else {
                        let files = game.settings.get('critic-message', 'nfolderfiles');
                        img2show = files[Math.floor(Math.random() * files.length)];
                    }
                }
                else if (diceresult === 20) {

                    allines = isAttack ? game.settings.get('critic-message', 'ptext-attack') : game.settings.get('critic-message', 'ptext');

                    //allines = game.settings.get('critic-message', 'ptext');
                    
                    if (!game.settings.get('critic-message', 'nat20Checkbox')) {
                        img2show = game.settings.get('critic-message', 'pimage');
                    }
                    else {
                        let files = game.settings.get('critic-message', 'pfolderfiles');
                        img2show = files[Math.floor(Math.random() * files.length)];
                    }
                }

                else {
                    return;
                }

                const showline = allines.split('\n');
                let randomLine = showline[Math.floor(Math.random() * showline.length)];

                if (randomLine.includes("${userwhorolled}")) {
                    let parts = randomLine.split("${userwhorolled}");
                    randomLine = parts[0] + " " + userwhorolled + " " + parts[1];
                }


                let themessage = `
              <table class="chatable">
                  <tbody>
                      <tr>
                          <td colspan="2" class="titleline"><br>${userwhorolled} ROLLED A NATURAL ${diceresult}!</td>
                      </tr>
                      <tr id="msg-bg">
                          <td colspan="1" class="image-cell"><img class="custom-image-size" src="${img2show}"></td>
                          <td colspan="1" class="rline">${randomLine}</td>
                      </tr>
                  </tbody>
              </table>
                   `
                let chatData = {
                    user: game.user._id,
                    speaker: ChatMessage.getSpeaker(),
                    content: themessage
                };
                ChatMessage.create(chatData, {});
            }
            );
        }
    });
}

export function detectroll(chatMessage) {

    let gameSystem = game.system.id;
    let foundryV11 = game.version < 12 ? true : false;
    let msgId = game.version < 12 ? chatMessage.user._id : chatMessage.author._id;

    // If the current user is not the one who rolled the dice, do nothing
    if (msgId !== game.user._id) {
        return;
    }

    let isAttack = false;

    if (gameSystem === 'dnd5e' && chatMessage.rolls[0].options.flavor.includes('Attack')){
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
            if(whisperdto.length === gmids.length){
    
                const a1fus = whisperdto.sort().join('');
                const a2fus = gmids.sort().join('');
                
                if (a1fus === a2fus){
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
    criticalmessage(d20dices, userwhorolled,isAttack);
}