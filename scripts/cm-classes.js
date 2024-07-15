/************************************UPDATE NATURAL 1 LIST FORM CLASS *********/
export class Updatetxtarraysn1 extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;
        const overrides = {
            id: "critic-msg-form",
            title: "Update text lists",
            template: "modules/critic-message/templates/nat.hbs",
            classes: ["update-txtlist"],
            width: 500,
            height: "fit-content",
            closeOnSubmit: true,
            resizable: true
        }
        return foundry.utils.mergeObject(defaults, overrides);
    }

    getData() {
        const ntl = game.settings.get('critic-message', 'ntext');
        const ntlAtk = game.settings.get('critic-message', 'ntext-attack');
        return {
            natdice: 1,
            ntl: ntl,            
            txtaname: "ntext",
            ntlAtk: ntlAtk,            
            txtanameAtk: "ntext-attack"
        };
    }

    _updateObject(event, formData) {
        const data = foundry.utils.expandObject(formData);
        game.settings.set('critic-message', 'ntext', data.ntext);
    }
}
/************************************UPDATE NATURAL 20 LIST FORM CLASS *********/
export class Updatetxtarraysn20 extends Updatetxtarraysn1 {

    getData() {
        const ntl = game.settings.get('critic-message', 'ptext');
        const ntlAtk = game.settings.get('critic-message', 'ptext-attack');
        return {
            natdice: 20,
            ntl: ntl,
            txtaname: "ptext",
            ntlAtk: ntlAtk,
            txtanameAtk: "ptext-attack"
        };
    }

    _updateObject(event, formData) {
        const data = foundry.utils.expandObject(formData);
        game.settings.set('critic-message', 'ptext', data.ptext);
    }
}

/************************************************** RESET BUTTON CLASS NAT 20 ***********/
export class ResetButton extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;
        const overrides = {
            id: "reset-button",
            title: "Reset to Default",
            template: "modules/critic-message/templates/reset-button.hbs",
            width: 400,
            closeOnSubmit: true
        }
        return foundry.utils.mergeObject(defaults, overrides);
    }

    getData() {
        return {
            btnmessage: "Reset Natural 20 list to defaluts"
        };
    }

    async _updateObject(event, formData) {
        game.settings.set('critic-message', 'ptext', game.settings.settings.get('critic-message.ptext').default);
    }
}

/************************************************** RESET BUTTON CLASS NAT 1 ***********/
export class ResetButton1 extends ResetButton {

    getData() {
        return {
            btnmessage: "Reset Natural 1 list to defaluts"
        };
    }

    async _updateObject(event, formData) {
        game.settings.set('critic-message', 'ntext', game.settings.settings.get('critic-message.ntext').default);
    }
}

/************************************************** RESET ALL SETTINGS TO DEFAULTS ***********/
export class ResetButtonAll extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;
        const overrides = {
            id: "reset-button",
            title: "Reset to Default",
            template: "modules/critic-message/templates/reset-button.hbs",
            width: 200,
            closeOnSubmit: true
        }
        return foundry.utils.mergeObject(defaults, overrides);
    }

    getData() {
        return {
            btnmessage: "RESET ALL SETTINGS TO DEFAULT"
        };
    }

    async _updateObject(event, formData) {
        await game.settings.set('critic-message', 'nimage', game.settings.settings.get('critic-message.nimage').default);
        await game.settings.set('critic-message', 'pimage', game.settings.settings.get('critic-message.pimage').default);
        await game.settings.set('critic-message', 'nat1Checkbox', game.settings.settings.get('critic-message.nat1Checkbox').default);
        await game.settings.set('critic-message', 'nat20Checkbox', game.settings.settings.get('critic-message.nat20Checkbox').default);
        await game.settings.set('critic-message', 'nimagefolder', game.settings.settings.get('critic-message.nimagefolder').default);
        await game.settings.set('critic-message', 'pimagefolder', game.settings.settings.get('critic-message.pimagefolder').default);
        await game.settings.set('critic-message', 'nfolderfiles', game.settings.settings.get('critic-message.nfolderfiles').default);
        await game.settings.set('critic-message', 'pfolderfiles', game.settings.settings.get('critic-message.pfolderfiles').default);
        await game.settings.set('critic-message', 'ptext', game.settings.settings.get('critic-message.ptext').default);
        await game.settings.set('critic-message', 'ntext', game.settings.settings.get('critic-message.ntext').default);

        window.location.reload();

    }
}