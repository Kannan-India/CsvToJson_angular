import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-servers',
  templateUrl: './servers.component.html',
  styleUrls: ['./servers.component.css']
})
export class ServersComponent implements OnInit {

  createNewServer = true;
  createdMsg = "No server has been created";
  serverName = "";
  serverCreated = false;

  // enableBtn = setTimeout(()=>{
  //   this.createNewServer = false;
  //   clearTimeout(this.enableBtn);
  // },2000)

  addServerClicked(){
    this.createdMsg = "New Server has been created with the name "+ this.serverName;
    this.serverCreated = true;
  }

  onServerNameInput(event: Event){
    this.serverName = (<HTMLInputElement>event.target).value;
  }
  constructor() { }

  ngOnInit(): void {
  }


}
