
import { imageLoader } from './imageLoader';
import { Achievement } from './interfaces'
import { RANKS } from './constants'

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
    constructor(achievements: Achievement[], title: string, identifier: string, backCb: () => void) {
        const h = document.createElement('h1');
        const list = document.createElement('div');
        h.textContent = title;

        let lock = false;

        const params = new URLSearchParams(location.search);
        let achievementQuery: string[] = []
        if (params.has('d') && params.get('i') === identifier) {
            lock = true;
            try {
                const data = JSON.parse(params.get('d'));
                if (Array.isArray(data)) {
                    achievementQuery = data;
                } else {
                    throw new Error("Not an array");
                }
            } catch (error) {
                alert("Unable to parse data");
            }
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
        generateLink.addEventListener('click', () => {
            const name = prompt('Name');
            const builder: string[] = [];
            for (const ach of this.achievements) {
                if (ach.achieved) {
                    builder.push(ach.achievement.title);
                }
            }

            const params = new URLSearchParams(location.search);
            if (name) {
                params.set('n', name);
            }
            params.set('d', JSON.stringify(builder));
            params.set('i', identifier);
            const url = `${location.origin}?${params.toString()}`;
            window.open(url, '_blank');
        })

        this.component.classList.add('achievements');
        h.classList.add('achievements-header');
        list.classList.add('achievements-list');
        const achs = [...achievements].sort(() => Math.random() > 0.5 ? 1 : -1);
        for (const achievement of achs) {
            const ach = new AchievementComponent(achievement, lock);
            if (lock) {
                if (achievementQuery.includes(achievement.title)) {
                    ach.setValue(true);
                }
                ach.setValue = () => { };
            }

            this.achievements.push(ach);
            list.appendChild(ach.component);
            ach.onChange = this.update;
        }
        this.scoreDisplay = new ScoreDisplay(this.score.toString(), '0', this.achievements.length.toString(), RANKS[0], lock ? params.get('n') : undefined);

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

        this.scoreDisplay.setRank(RANKS[index]);
        this.scoreDisplay.setScore(this.score.toString());
        this.scoreDisplay.setSelected(this.selected.toString());
        this.scoreDisplay.setProgress(percent);

    }
    append(div: HTMLElement) {
        this.remove();
        div.appendChild(this.component);
    }
    remove() {
        if (this.component.parentElement) {
            this.component.parentElement.removeChild(this.component);
        }
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

