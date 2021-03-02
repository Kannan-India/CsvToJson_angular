import { Component } from '@angular/core';

@Component({
    selector: "app-server",
    templateUrl: "./server.component.html",
    styleUrls: ["./server.component.css"]
})
export class ServerComponent{
    serverId: number = 3;
    serverStatus: string = "Offline";

    getServerStatus(){
        return this.serverStatus;
    }

    constructor(){
        this.serverStatus = Math.random() > 0.5?"Online":"Offline";
    }
    
}