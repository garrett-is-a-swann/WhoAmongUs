import { Component, OnInit, Input} from '@angular/core';
import { DatePipe } from '@angular/common';
import * as io from 'socket.io-client';

@Component({
    selector: 'app-socket',
    templateUrl: './socket.component.html',
    styleUrls: ['./socket.component.css']
})
export class SocketComponent implements OnInit {
    @Input('socket') socket;
	@Input('room') room;
    messages:any[] = [{msg:'connected', from:'Server', _from:'Server', time:Date.now()}];

    constructor() { }

    ngOnInit() {
        this.socket.on('chat message', (payload) => {
            console.log(payload)
            this.messages.push({msg:payload.msg, from:payload.from,   time:Date.now()
                ,_from:(payload.from == 'Server'?'Server':'Other')
            });
			setTimeout(() => {

				var chatroom = document.getElementById(this.room);
				chatroom.scrollTop = chatroom.scrollHeight;
			}, 0)
        });
    }

    emit(payload) {
        this.socket.emit("chat message", this.room, {msg:payload, from:'Not me'})
        this.messages.push({msg:payload, from:'Me', _from:'Me', time:Date.now()});
		setTimeout(() => {

			var chatroom = document.getElementById(this.room);
			chatroom.scrollTop = chatroom.scrollHeight;
		}, 0)
    }
}
