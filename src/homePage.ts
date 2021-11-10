import { assets } from './assets';
import { imageLoader } from './imageLoader';
import { sample } from 'lodash';

const words = [
    'waking',
    'fapping',
    'masturbation',
    'soup making',
    'waffle maker',
    'jerk off',
    'manual override',
    'self abuse',
    'wite liquid dispatcher',

];
const sentences = [
    'Select your gender and get your hands dirty.',
    'Select your gender and express your liquid dispatching',
    'Select your symbol and start the adventure.',
    'Select your button and check your todo list',
    'You might\'ve not completed all the achievement. Click the gender button to start your adventure.',

]

export async function homePage() {
    const h = document.createElement('h1');
    h.textContent = "The Cum Zone";
    const p = document.createElement('p');
    p.textContent = `The world first ${sample(words)} calculator. ${sample(sentences)}`;
    const female = await imageLoader(assets.female);
    const male = await imageLoader(assets.male);
    const femaleButton = document.createElement('button');
    const maleButton = document.createElement('button');
    female.style.width = 'inherit';
    male.style.width = 'inherit';
    femaleButton.appendChild(female);
    maleButton.appendChild(male);
    maleButton.classList.add('gender-button')
    femaleButton.classList.add('gender-button')
    const div = document.createElement('div');
    div.classList.add('gender-button-div')
    div.appendChild(h);
    div.appendChild(p);

    const p2 = document.createElement('p');
    p2.textContent = "You are using this website on your own risk. Authors of this webpage are not responsible for the damage that you might do to yourself!";
    p2.classList.add('notice')
    const divButton = document.createElement('div');
    divButton.appendChild(femaleButton);
    divButton.appendChild(maleButton);
    divButton.appendChild(p2);
    div.appendChild(divButton);

    const ref = {
        div,
        onMale: () => { },
        onFemale: () => { },
    }
    femaleButton.addEventListener('click', () => ref.onFemale());
    maleButton.addEventListener('click', () => ref.onMale());
    return ref;
}
