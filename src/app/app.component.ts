import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { IStateLine } from './StateLine';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  singleLine: IStateLine = {
    id: null,
    state: "",
    city: "",
    tier: ""
  }

  constructor(private http: HttpClient){
  }

  onAdd(){
    if(this.singleLine.city != "" && this.singleLine.state !="" && this.singleLine.tier!=""){
      this.http.post("http://localhost:8080", this.singleLine).toPromise()
      .then(
        (data: IStateLine)=>{
          console.log(data);
          if(data.id == null){
            alert("Class updated successfully");
            // alert("Upload failed - Duplicate Entry\nCity : "+
            // data.city+" already exists under the State : " + data.state);
          }else{
            alert("Uploaded Successfully")
          }
        }
      )
    }
  }

  convertFile(){
    let input = (<HTMLInputElement>document.getElementById('csvFile')).files[0];
    let reader = new FileReader();

    reader.onload = () =>{
      let text = reader.result;
      // console.log('CSV: ', text + '...');
      this.csvJson(text);
    };
    reader.readAsText(input);
  }

  csvJson(csvText){
    //learn regex
    let lines=csvText.split(/\r\n|\n/);
    let stateLines:IStateLine[] = [];

    let headers: string[] = lines[0].split(",");

    console.log(lines.length)

    let flag=true;
    for(let i=1; i<lines.length; i++){

      let currentline: string[] = lines[i].split(",");

      //check if curretLine has only 3 elements
      if(currentline.length === 3  && currentline[0] != "" && currentline[1] != "" && currentline[2] != ""){
        let line: IStateLine = {
          id: null,
          state: currentline[0],
          city: currentline[1],
          tier: currentline[2]
        }

        //check for duplicates (lowercase not done)
        for(let j=0; j<stateLines.length; j++){
          if(stateLines[j].city.toLowerCase() == line.city.toLowerCase()){
            if(stateLines[j].state.toLowerCase() == line.state.toLowerCase() ){
              flag = false;
              alert("duplicate city found!\nLine No: " + i + " (" + line.state + ", " + line.city +
              ")\nAlready Exists on\n" +
               "Line No: " + j + " (" + stateLines[j].state + ", " + stateLines[j].city + ")");
              break;
            }
          }
        }

        if(flag){
          stateLines.push(line);
        }else{
          break;
        }
      }else{
        //to avoid error checking on last line
        if(i < (lines.length-1)){
          if(currentline[0] != "" || currentline[1] != "" || currentline[2] != ""){
            flag = false;
            alert("Upload Failed.\nReason: Empty cell found in the row: " + (i+1));
            break;
          }else{
            flag = false;
            alert("Upload Failed.\nReason: Illegal character - Comma(,) has been used in the row: " + (i+1))
            break;
          }
        }
      }
    }

    if(flag){
      // console.log(stateLines)
      // update db
      this.http.post("http://localhost:8080/cities", stateLines).toPromise()
      .then(
        (data)=>{
          alert("Uploaded Successfully\nNote: In case of any duplicate entries, they would ve been updated");
          // alert("Uploaded Successfully\nNote: In case of any duplicate entries, they would ve been rejected");
          console.log(data);
        }
      )
    }
  }

  deleteAll(){
    this.http.delete("http://localhost:8080").toPromise()
    .then(
      data => console.log(data)
    )
    alert("deleted Successfully")
  }
}
