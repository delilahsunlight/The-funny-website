import * as moment from 'moment';

export class NNNTimer {
    private div = document.createElement('div');
    private h = document.createElement('h5');
    private span = document.createElement('span');
    private dec = moment(`${(new Date()).getFullYear()}-12-1`);
    private timer: NodeJS.Timer;

    constructor() {
        this.h.textContent = 'No Nut November Timer'
        this.div.appendChild(this.h);
        this.div.appendChild(this.span);
        this.div.classList.add("NNN");
        this.update();
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