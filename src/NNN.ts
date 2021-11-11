import * as moment from 'moment';

export class NNNTimer {
    private div = document.createElement('div');
    private container = document.createElement('container');
    private h = document.createElement('h5');
    private span = document.createElement('span');
    private dec = moment(`${(new Date()).getFullYear()}-12-1`);
    private timer: NodeJS.Timer;

    constructor() {
        this.h.textContent = 'No Nut November Timer'
        this.container.appendChild(this.h);
        this.container.appendChild(this.span);
        this.div.appendChild(this.container);
        this.div.classList.add("NNN");
        this.update();

        this.div.addEventListener('fullscreenchange', () => {
            const bounds = this.div.getBoundingClientRect()
            if (bounds.left !== 0) {
                this.div.style.fontSize = '';
                this.container.style.top = '';
                this.container.style.position = ``;
            } 
        })
        this.div.addEventListener('click', async () => {
            await this.div.requestFullscreen();
            const bounds = this.div.getBoundingClientRect()
            if (bounds.left === 0) {
                this.div.style.fontSize = '9vw';
                this.container.style.top = '30%';
                this.container.style.position = `relative`;
            } 
        });
    }
    start() {
        this.stop();
        setInterval(this.update, 1000);
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    private update = () => {
        if (!this.shown()) {
            this.div.hidden = true;
            return;
        }
        this.div.hidden = false;

        const now = moment(new Date());
        const duration = moment.duration(now.diff(this.dec));
        const m = (a: number) => {
            const e = Math.abs(a).toString();
            return e.length === 1 ? `0${e}` : e;
        };

        const countdown = `${m(duration.days())} days ${m(duration.hours())}:${m(duration.minutes())}:${m(duration.seconds())}`;
        this.span.textContent = countdown;
    }
    private shown() {
        const now = moment(new Date());
        const duration = moment.duration(now.diff(this.dec));
        const days = duration.asDays();
        return days > -31 && days < 0
    }

    get component() {
        return this.div;
    }
}