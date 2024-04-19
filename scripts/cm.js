import { Updatetxtarraysn1, Updatetxtarraysn20, ResetButton, ResetButton1, ResetButtonAll } from './cm-classes.js';
import { verifyimgfolders, criticalmessage, detectroll } from './cm-functions.js';


/************************************************** CHAT DICE HOOKS ***********
// If dice so nice is not active    
Hooks.on("createChatMessage", (chatMessage) => {
    if (!game.modules.get("dice-so-nice")?.active) {

        if (!chatMessage.rolls[0]) {
            return;
        }
        if ((chatMessage.user._id == game.user._id)) {
            let d20dices = chatMessage.rolls[0].dice;
            let userwhorolled = chatMessage.user.name;
            verifyimgfolders();
            criticalmessage(d20dices, userwhorolled);
        }
    }
});

// If dice so nice is active
Hooks.on('diceSoNiceRollComplete', (data) => {

    let rchatMessage = game.messages.get(data);

    // If the current user is not the one who rolled the dice, do nothing
    if (rchatMessage.user._id == game.user._id) {
        let d20dices = rchatMessage.rolls[0].dice;
        let userwhorolled = rchatMessage.user.name;
        verifyimgfolders();
        criticalmessage(d20dices, userwhorolled);
    }
});


/************************************************** CHAT DICE HOOKS ***********/
// If dice so nice is not active    
Hooks.on("createChatMessage", (chatMessage) => {

    if (game.modules.get("dice-so-nice")?.active){ //If dice so nice is active but the roll is blind and ghost dice is not enabled
        if(!game.settings.get("dice-so-nice", "showGhostDice") && chatMessage.blind && !game.settings.get('critic-message', 'disablemodule') && chatMessage.isRoll){

            detectroll(chatMessage);            
        }
    }

    if (!game.modules.get("dice-so-nice")?.active && !game.settings.get('critic-message', 'disablemodule') && chatMessage.isRoll ) { 

        detectroll(chatMessage);
    }

});

// If dice so nice is active wait for animation to finish
Hooks.on('diceSoNiceRollComplete', (data) => {

    let chatMessage = game.messages.get(data);

     if (game.settings.get('critic-message', 'disablemodule') || (chatMessage.blind && !game.settings.get("dice-so-nice", "showGhostDice"))) {// if the roll is blind it was registered like dice so nice is not installed and evaluated before
        return;
    } 

    detectroll(chatMessage);
});
/****************************************************************************** */

 /***************************** INIT SETTINGS ************************************ */
Hooks.once('init', function () {

    //Option to stop detecting Natural dices
    game.settings.register('critic-message', 'disablemodule', {
        name: 'disable module',
        hint: 'While this is enabled, critical messages will not be shown',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        restricted: true
    });

    //Avoid showing data if not selected
    game.settings.register('critic-message', 'allowhiddenrolls', {
        name: 'Allow to show message on hidden rolls',
        hint: 'MESSAGES WILL APPEAR ONLY WITH PUBLIC ROLLS.',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        restricted: true
    });

    // RESET  ALL SETTINGS TO DEFAULT
    game.settings.registerMenu('critic-message', 'reset-all-button', {
        name: "WARNING: Reset All defaults requires reload!",
        label: "RESET TO DEFAULTS",
        hint: "",
        //requiresReload: true,
        icon: "fas fa-undo",
        type: ResetButtonAll,
        restricted: true,
    });

    //negative image
    game.settings.register('critic-message', 'nimage', {
        name: 'Image for natural 1',
        hint: 'Choose a single image for natural 20 rolls',
        scope: 'world', // This specifies a world-level setting
        config: true, // This specifies that the setting appears in the configuration view
        type: String,
        filePicker: true, // This enables the file picker, which allows the user to select an image
        default: 'modules/critic-message/artwork/n1/sadchems.png' // Default value for the setting
    });

    //positive image
    game.settings.register('critic-message', 'pimage', {
        name: 'Image for natural 20',
        hint: 'Choose a single image for natural 20 rolls',
        scope: 'world', // This specifies a world-level setting
        config: true, // This specifies that the setting appears in the configuration view
        type: String,
        filePicker: true, // This enables the file picker, which allows the user to select an image
        default: 'modules/critic-message/artwork/n20/swoledoge.png' // Default value for the setting
    });

    //Checkbox to enable folder for nat1 images
    game.settings.register('critic-message', 'nat1Checkbox', {
        name: 'Use a folder for natural 1 images instead of a single image',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        restricted: true
    });  //game.settings.get('critic-message', 'nat1Checkbox'); // false


    //negative image folder
    game.settings.register('critic-message', 'nimagefolder', {
        name: 'Image folder with natural 1 images',
        hint: 'Choose a folder with your images for natural 1 rolls',
        scope: 'world', // This specifies a world-level setting
        config: true, // This specifies that the setting appears in the configuration view
        type: String,
        filePicker: 'folder', // 
        default: 'modules/critic-message/artwork/n1' // Default value for the setting
    });

    //Checkbox to enable folder for nat20 images
    game.settings.register('critic-message', 'nat20Checkbox', {
        name: 'Use a folder for natural 20 images instead of a single image',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        restricted: true
    });  //game.settings.get('critic-message', 'nat20Checkbox'); // false


    //positive image folder
    game.settings.register('critic-message', 'pimagefolder', {
        name: 'Image folder with natural 20 images',
        hint: 'Choose a folder with your images for natural 20 rolls',
        scope: 'world', // This specifies a world-level setting
        config: true, // This specifies that the setting appears in the configuration view
        type: String,
        filePicker: 'folder', // 
        default: 'modules/critic-message/artwork/n20' // Default value for the setting
    });

    //Array of filelist for nat1
    game.settings.register('critic-message', 'nfolderfiles', {
        scope: 'world', // This specifies a world-level setting
        config: false, // This specifies that the setting appears in the configuration view
        type: Array
    });

    //Array of filelist for nat20
    game.settings.register('critic-message', 'pfolderfiles', {
        scope: 'world', // This specifies a world-level setting
        config: false, // This specifies that the setting appears in the configuration view
        type: Array
    });

    //Natural 1 list Menu
    game.settings.registerMenu("critic-message", "listform1", {
        name: "Natural 1 list",
        label: "Edit natural 1 list", // The text label used in the button
        hint: "Edit the list of natural 1 text appearing along the image",
        icon: "fas fa-bars", // A Font Awesome icon used in the submenu button
        type: Updatetxtarraysn1, // A FormApplication subclass
        restricted: true // Restrict this submenu to gamemaster only?
    });

    //Natural 1 list variable
    game.settings.register('critic-message', 'ntext', {
        scope: 'world', // This specifies a world-level setting
        config: false, // This setting should not appear in the settings menu
        default: "Is anyone surprised?\nYou meant to do that.\nYour true skill shines through!\nOn a scale of 1 to 20, how confident are you feeling right now?\nThe very fabric of reality seems to mock your attempt.\nOn the bright side, at least it's memorable!\nThe dice have spoken, and they sound disappointed.\nLooks like I need to adjust the difficulty... to 'breathing'.\nI’ve seen better rolls at a bakery\nYour character’s performance was so bad, even the dice are embarrassed\nTell the poor monster you are sorry for wasting its time\nSeriously?\nAnother one added to the collection", // The default value for the setting
        type: String,
        onChange: value => {
            console.log(value);
        }
    });

    //Natural 20 list Menu
    game.settings.registerMenu("critic-message", "listform20", {
        name: "Natural 20 list",
        label: "Edit natural 20 list", // The text label used in the button
        hint: "Edit the list of natural 20s text appearing along the image",
        icon: "fas fa-bars", // A Font Awesome icon used in the submenu button
        type: Updatetxtarraysn20, // A FormApplication subclass
        restricted: true // Restrict this submenu to gamemaster only?
    });

    //Natural 20 list variable
    game.settings.register('critic-message', 'ptext', {
        scope: 'world', // This specifies a world-level setting
        config: false, // This setting should not appear in the settings menu
        default: "Did you hear that? That was the sound of destiny applauding!\nDid you hear that? The dice themselves are cheering for you!\nThat roll was as bright as a cleric’s holy symbol\nWell, it's about time! The dice finally remembered you exist\nDid you just... succeed? \nHold on, let me take a screenshot. This doesn't happen every day.\nGreat! but, you know, the odds of that happening are... the same for rolling a 1 next time!\nThat roll was higher than a bard’s ego!\nAlright, alright, fine! You succeed... this time.\n${userwhorolled} has been banned for hacking", // The default value for the setting
        type: String,
        onChange: value => {
            console.log(value);
        }
    });

    //Reset Natural 1 list variable to default
    game.settings.registerMenu('critic-message', 'reset-n1-button', {
        name: "Reset Natural 1 list",
        label: "Reset Natural 1 list",
        hint: "Reset the list of Natural 1 Messages to its default value",
        icon: "fas fa-undo",
        type: ResetButton1,
        restricted: true,
    });

    //Reset Natural 20 list variable to default
    game.settings.registerMenu('critic-message', 'reset-n20-button', {
        name: "Reset Natural 20 list",
        label: "Reset Natural 20 list",
        hint: "Reset the list of Natural 20 Messages to its default value",
        icon: "fas fa-undo",
        type: ResetButton,
        restricted: true,
    });
});

Hooks.once('ready', function () {
    verifyimgfolders();
}
);

Hooks.on('closeSettingsConfig', function () {
    verifyimgfolders();
}
);

/* 
To reset a variable:
game.settings.set('critic-message', 'mytext', game.settings.settings.get('critic-message.mytext').default);
*/

