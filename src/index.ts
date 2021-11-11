/// <reference path="fix.d.ts" />

import { ACHIEVEMENTS_MALE, ACHIEVEMENTS_FEMALE } from './constants';
import { homePage } from './homePage';
import { AchievementComponents, decodePayload } from './achievementComponent';
import { NNNTimer } from './NNN';
import { Asset, assets } from './assets';
import { imageLoader } from './imageLoader';
import { sample } from 'lodash';
import { saveAs } from 'file-saver';


(async () => {
    const ref = document.getElementsByTagName('html')[0].innerHTML;
    console.log('%c Looking how website is built? ', 'background: #222; color: #bada55');
    console.log('We take yours and my privacy very serious this webpage won\'t send any data to any server!');
    console.log('There is no need for cookies. If you would like to accept cookies execute function "cookiesPrompt()"');
    console.log('If you still don\'t trust us you can download this page with function download()');


    (window as any).cookiesPrompt = () => {
        const result = prompt('Our side doesn\'t use cookies. Would you like to accept them?');
        if (result) {
            console.log('Oh. That wasn\'t expected but okay thanks i guess');
        }

    }
    (window as any).download = () => {
        const blob = new Blob([ref], {type: 'text/plain;charset=utf-8;'});
        saveAs(blob, `${document.title}.html`);
    }

    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    const random = Object.keys(assets).filter(a => !isNaN(parseInt(a)));
    const randomKey = sample(random);
    //@ts-ignore
    const a = assets[randomKey] as Asset;
    const loadRandom = await imageLoader(a);
    link.href = loadRandom.src;

    const data = await decodePayload()


    const male = new AchievementComponents(ACHIEVEMENTS_MALE, "Male achievements", "m", onBack, data);
    const female = new AchievementComponents(ACHIEVEMENTS_FEMALE, "Female achievements", "f", onBack, data);
    if (data) {
        if (data.type === "m") {
            male.append(document.body);
            return;
        } else if (data.type === "f") {
            female.append(document.body);
            return;
        }
    }

    const nnn = new NNNTimer();
    nnn.start();
    document.body.appendChild(nnn.component);

    const buttons = await homePage();


    function onBack() {
        female.remove()
        male.remove()
        document.body.appendChild(buttons.div);
    }

    buttons.onFemale = () => {
        document.body.removeChild(buttons.div);
        female.append(document.body);
    }
    buttons.onMale = () => {
        document.body.removeChild(buttons.div);
        male.append(document.body);
    }

    document.body.appendChild(buttons.div);
})()
