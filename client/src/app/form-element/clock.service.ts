import { Injectable } from '@angular/core';

@Injectable()
export class ClockService {

    clock: any;
    func: any;

    constructor() { }

    init(lambda) {
        this.func = lambda;
    }

    reset() {
        if(this.clock != null) {
            clearTimeout(this.clock)
        }
    }
    keyup() {
        this.reset()
        this.clock = setTimeout(()=>{
            this.func()}, 1000)
    }

}


