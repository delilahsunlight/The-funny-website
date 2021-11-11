
import { imageLoader } from './imageLoader';
import { Achievement, QueryPayload } from './interfaces'
import { RANKS } from './constants'
import { bindToWindow, unbindToWindow } from './utils'
import { clamp } from 'lodash';
import * as compress from 'compress-str';

class AchievementComponent {
    private _on = false;
    private container = document.createElement('div');
    constructor(private _achievement: Achievement, private locked: boolean) {
        const score = document.createElement('div');
        score.classList.add('achievement-score');
        score.textContent = _achievement.score.toString();

        const div1 = document.createElement('div');
        const div2 = document.createElement('div');

        const image = document.createElement('img');

        const h1 = document.createElement('h1');
        const p = document.createElement('p');
        h1.textContent = _achievement.title;
        p.textContent = _achievement.description;
        imageLoader(_achievement.icon).then(img => {
            image.src = img.src;
        });

        [this.container, h1, p, image].forEach(e => e.classList.add(`achievement`));
        div1.appendChild(image);
        div1.appendChild(score);
        div2.appendChild(h1);
        div2.appendChild(p);
        this.container.appendChild(div1);
        this.container.appendChild(div2);
        this.container.classList.add('achievement-container')
        this.container.addEventListener('click', () => this.setValue(!this._on));
        if (locked) {
            this.container.classList.add('locked');
        }
    };

    onChange() { };
    get totalScore() {
        return this._achievement.score;
    }
    get score() {
        return this._on ? this._achievement.score : 0;
    }
    get achieved() {
        return this._on;
    }
    setValue(value: boolean) {
        this._on = value;
        if (this._on) {
            this.container.classList.add('achievement-active')
        } else {
            this.container.classList.remove('achievement-active')
        }
        this.onChange();
    }
    calculate(score: number) {
        return this.score + score;
    }
    get component() {
        return this.container;
    }
    get achievement() {
        return this._achievement;
    }
}

export class AchievementComponents {
    private achievements: AchievementComponent[] = [];
    private component = document.createElement('div');
    private scoreDisplay: ScoreDisplay;
    constructor(achievements: Achievement[], title: string, identifier: string, backCb: () => void, payload?: QueryPayload) {
        const h = document.createElement('h1');
        const list = document.createElement('div');
        h.textContent = title;

        let lock = false;

        let achievementQuery: string[] =  payload ? payload.achievements : []
        if (achievementQuery.length) {
            lock = true;
        }


        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('achievement-buttons');
        const back = document.createElement('button');
        back.textContent = 'Back';
        const home = document.createElement('button');
        home.textContent = "Home";
        const generateLink = document.createElement('button');
        generateLink.textContent = 'Get link';
        [back, generateLink, home].forEach(e => {
            e.classList.add('achievement-button');

        });
        if (lock) {
            buttonsDiv.appendChild(home);
            home.addEventListener('click', () => {
                location.href = location.origin;
            })
        } else {
            buttonsDiv.appendChild(back);
            buttonsDiv.appendChild(generateLink);

        }

        back.addEventListener('click', () => backCb());
        generateLink.addEventListener('click', async () => {
            const name = prompt('Name (optional)');
            const builder: string[] = [];
            for (const ach of this.achievements) {
                if (ach.achieved) {
                    builder.push(ach.achievement.uniqueId);
                }
            }
            
            const buffer = builder.join(';');
            const string = `${buffer}:${identifier}${name ? `:${name}` :''}`;
            const queryData = await compressString(string);
            console.log(queryData)

            const url = `${location.origin}?d=${queryData}`;

            const result = writeClipboardHack(url);
            if (result) {
                generateLink.textContent = "Copied to clipboard"
                setTimeout(() => {
                    generateLink.textContent = "Get link"
                }, 5000);
            } else {
                generateLink.textContent = "Opening in new tab in 3";
                await holdOn(1000);
                generateLink.textContent = "Opening in new tab in 2";
                await holdOn(1000);
                generateLink.textContent = "Opening in new tab in 1";
                holdOn(1000);
                try {
                    window.open(url, '_blank');
                } catch (error) {
                    generateLink.textContent = "Unable to open new tab";
                    await holdOn(1000);
                    generateLink.textContent = "Opening in current tab";
                    await holdOn(1000);
                    try {
                        window.open(url);
                        window.open(url);
                    } catch (error) {
                        await holdOn(1000);
                        generateLink.textContent = "Unable to open in current tab";
                        try {
                            const blob = new Blob([url], {type: 'text/plain;charset=utf-8;'});
                            saveAs(blob, `${document.title}.txt`);
                        } catch (error) {
                            alert(url);
                        }
                    }
                }
                holdOn(5000);
                console.log(url);
                generateLink.textContent = "Get link";
            }
        })

        this.component.classList.add('achievements');
        h.classList.add('achievements-header');
        list.classList.add('achievements-list');
        const achs = [...achievements].sort(() => Math.random() > 0.5 ? 1 : -1);
        for (const achievement of achs) {
            const ach = new AchievementComponent(achievement, lock);
            if (lock) {
                if (achievementQuery.includes(achievement.uniqueId)) {
                    ach.setValue(true);
                }
                ach.setValue = () => { };
            }

            this.achievements.push(ach);
            list.appendChild(ach.component);
            ach.onChange = this.update;
        }
        this.scoreDisplay = new ScoreDisplay(this.score.toString(), '0', this.achievements.length.toString(), RANKS[0], lock ? payload.name : undefined);

        this.component.appendChild(h);
        this.component.appendChild(buttonsDiv);
        this.component.appendChild(list);
        this.component.appendChild(this.scoreDisplay.component);

        this.scoreDisplay.component.classList.add('achievements-score')
        this.update();
    }
    update = () => {
        const percent = this.score / this.totalScore;
        const index = Math.floor(RANKS.length * percent);
        this.scoreDisplay.setRank(RANKS[clamp(index, 0, RANKS.length - 1)]);
        this.scoreDisplay.setScore(this.score.toString());
        this.scoreDisplay.setSelected(this.selected.toString());
        this.scoreDisplay.setProgress(percent);

    }
    append(div: HTMLElement) {
        this.remove();
        div.appendChild(this.component);
        bindToWindow('achievementsComponent', this);
    }
    remove() {
        if (this.component.parentElement) {
            this.component.parentElement.removeChild(this.component);
        }
        unbindToWindow('achievementsComponent');
    }

    get totalScore() {
        let totalScore = 0;
        for (let i = 0; i < this.achievements.length; i++) {
            totalScore += this.achievements[i].totalScore;
        }
        return totalScore;
    }
    get score() {
        let score = 0;
        for (let i = 0; i < this.achievements.length; i++) {
            score = this.achievements[i].calculate(score);
        }
        return score;
    }
    get selected() {
        let selected = 0;
        for (let i = 0; i < this.achievements.length; i++) {
            if (this.achievements[i].achieved) {
                selected++
            }
        }
        return selected;
    }
}

export class ScoreDisplay {
    private container = document.createElement('div');
    private score: KeyValueNode;
    private selected: KeyValueNode;
    private rank: KeyValueNode;
    private scrollbarOuter = document.createElement('div');
    private scrollbarInner = document.createElement('div');
    constructor(score: string, selected: string, private totalScore: string, rank: string, author?: string) {
        const authorNode = new KeyValueNode('', author);
        this.score = new KeyValueNode('Your fap score is:', score);
        this.selected = new KeyValueNode('Selected:', `${selected}/${totalScore}`);
        this.rank = new KeyValueNode('Rank:', rank);
        this.scrollbarOuter.appendChild(this.scrollbarInner);
        this.scrollbarOuter.classList.add('score-progress-outer');
        this.scrollbarInner.classList.add('score-progress-inner');
        if (authorNode && author) {
            this.container.appendChild(authorNode.component);
        }
        this.container.appendChild(this.score.component);
        this.container.appendChild(this.selected.component);
        this.container.appendChild(this.rank.component);
        this.container.appendChild(this.scrollbarOuter);
    }
    setScore(score: string) {
        this.score.setValue(score);
    }
    setSelected(selected: string) {
        this.selected.setValue(`${selected}/${this.totalScore}`);
    }
    setRank(rank: string) {
        this.rank.setValue(rank);
    }
    setProgress(value: number) {
        this.scrollbarInner.style.width = `${value * 100}%`;
    }
    get component() {
        return this.container;
    }
}

export class KeyValueNode {
    private div = document.createElement('div');
    private key = document.createElement('p');
    private value = document.createElement('b');
    constructor(key: string, value: string) {
        this.div.appendChild(this.key);
        this.div.appendChild(this.value);
        this.setKey(key);
        this.setValue(value);
        this.div.classList.add('achievements-key-value');
    }
    setKey(key: string) {
        this.key.textContent = key;
    }
    setValue(value: string) {
        this.value.textContent = value;
    }
    get component() {
        return this.div;
    }
}

export function writeClipboardHack(text: string) {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-999px';
    el.style.bottom = '-999px';
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, text.length);
    const result = document.execCommand('copy');
    document.body.removeChild(el);
    return result;
}

function holdOn(time: number) {
    return new Promise(resolve => setTimeout(resolve, time))
} 

async function compressString(payload: string) {
    try {
        const result = await compress.gzip(payload)
        const sample1 = encodeURI(payload);
        const sample2 = encodeURI(result);
        return sample1.length < sample2.length ? sample1 : sample2;  
    } catch (error) {
        return encodeURI(payload);
    }
}

export async function decodePayload(): Promise<QueryPayload | undefined> {
    if (!location.search) {
        return undefined;
    }
    const raw = getCustomQueryData();
    if (!raw) {
        location.href = location.origin;
        return undefined;
    }
    const data = decodeURI(raw);
    if (!data) {
        location.href = location.origin;
        return undefined;
    }

    try {
        const result = await compress.gunzip(data)
        const decoded = decodeStringPayload(result);
        return decoded; 
    } catch (error) {
        console.error(error);
        const decoded = decodeStringPayload(data);
        return decoded; 
    }
}

function decodeStringPayload(data: string): QueryPayload {
    const [stringData, type, name] = data.split(':');
    const achievements = stringData.split(';');    
    return {
        achievements,
        type,
        name,
    }

}
// URLSearchParams is giving us weird spaces in urls this should fix 
// for what we are doing
function getCustomQueryData() {
    const search = location.search; 
    const questionMarkIndex = search.indexOf('?'); 
    const actualSearch = search.slice(questionMarkIndex + 1);
    if (actualSearch.startsWith('d=')) {
        return actualSearch.slice(2)
    }
    return undefined;
}